import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ConcreteMortarCalculator, BrickworkCalculator } from "../utils/calculators";

export async function processAIEstimate(prompt: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Schema for structured extraction
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      calculationType: {
        type: Type.STRING,
        description: "The type of calculation requested: 'room', 'wall', or 'slab'",
      },
      lengthFt: {
        type: Type.NUMBER,
        description: "The length dimension in feet. Example: 10",
      },
      widthFt: {
        type: Type.NUMBER,
        description: "The width dimension in feet. Example: 10",
      },
      heightFt: {
        type: Type.NUMBER,
        description: "The height or depth dimension in feet. Example: 10",
      },
      deductionsSqFt: {
        type: Type.NUMBER,
        description: "Any deductions in square feet (like doors/windows), 0 if none.",
      }
    },
    required: ["calculationType", "lengthFt", "widthFt", "heightFt", "deductionsSqFt"]
  } as Schema;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [{
          text: `You are an expert natural language parser for construction estimation.
          Extract the length, width, height (or depth) in feet from the user's prompt.
          Determine the calculation Type: 'room' (walls and slab), 'wall' (just brickwork), or 'slab' (just concrete).
          If only 2 dimensions are given (e.g. 10x10 room), assume width=10, length=10, and default height to 10 if not provided.
          
          User prompt: "${prompt}"`
        }]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate extraction");
  }

  const extracted = JSON.parse(response.text);

  let resultText = "";
  
  const length = extracted.lengthFt || 0;
  const width = extracted.widthFt || 0;
  const height = extracted.heightFt || 10;
  const deductions = extracted.deductionsSqFt || 0;

  // Processing the calculations
  if (extracted.calculationType === 'room' || extracted.calculationType === 'wall') {
    const wallPerimeter = 2 * (length + width); // Total length of walls
    
    // standard 9-inch brick wall
    // Check parameters in BrickworkCalculator logic. isSI defaults.
    const brickCalc = new BrickworkCalculator(
      wallPerimeter, // length
      height,        // height
      9 / 12,        // thickness (ft fallback)
      deductions,    // deductions
      9 / 12, 4.5 / 12, 3 / 12, // brick sizes
      0.39 / 12,     // mortar thickness
      "1:4",         // mix ratio
      5, false
    );
    const brickRes = brickCalc.calculate();

    resultText += `**Brickwork for Walls** (Assume 9-inch thick walls, 1:4 Mortar)\n`;
    resultText += `- **Total Wall Volume (net):** ${brickRes.netWallVol.toFixed(2)} cft\n`;
    resultText += `- **Bricks Required:** ${brickRes.numBricks} bricks\n`;
    resultText += `- **Cement for Mortar:** ${brickRes.cementBags.toFixed(2)} bags\n`;
    resultText += `- **Sand for Mortar:** ${brickRes.sandVol.toFixed(2)} cft\n\n`;
  }

  if (extracted.calculationType === 'room' || extracted.calculationType === 'slab') {
    // standard 5-inch concrete slab
    const slabDepthFt = 5 / 12; 
    
    const concCalc = new ConcreteMortarCalculator(
      length, width, slabDepthFt, "1:2:4", 5, 0.5, false
    );
    const concRes = concCalc.calculate();

    resultText += `**Concrete for Slab** (Assume 5-inch thick slab, 1:2:4 Mix)\n`;
    resultText += `- **Total Wet Volume:** ${concRes.totalWetVolume.toFixed(2)} cft\n`;
    resultText += `- **Cement:** ${concRes.cementBags.toFixed(2)} bags\n`;
    resultText += `- **Sand:** ${concRes.sandVol.toFixed(2)} cft\n`;
    resultText += `- **Crush/Aggregate:** ${concRes.aggregateVol.toFixed(2)} cft\n`;
  }

  if (!resultText) {
    resultText = "Could not confidently parse structure details from your prompt.";
  }

  let finalContext = `I have analyzed your request based on standard practices:\n\n` + 
                     `**Parsed Dimensions:** Length ${length}ft, Width ${width}ft, Height/Depth ${height}ft.\n\n` +
                     resultText;

  return finalContext;
}
