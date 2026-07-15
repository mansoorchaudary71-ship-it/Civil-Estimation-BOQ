import {
  Box, Layers, Columns, PaintBucket, Truck,
  Ruler, Square, ClipboardList,
  Pickaxe, Droplet, Trees
} from "lucide-react";

export interface CalcItem {
  id: string;
  label: string;
  group: string;
  icon: any;
  inputs: Array<{ id: string; label: string; unit?: string; defaultVal: string }>;
  sharedDependencies?: string[];
  compute: (inputs: Record<string, number>, shared: Record<string, number>, isSI: boolean) => {
    results: Record<string, string | number>;
    sharedOutputs?: Record<string, number>;
  };
}

export const calculatorsList: CalcItem[] = [
  // 1. Site Clearance
  {
    id: "clearance",
    label: "1. Site Clearance",
    group: "Earthworks",
    icon: Trees,
    inputs: [
      { id: "area", label: "Plot Area", unit: "A", defaultVal: "500" },
      { id: "depth", label: "Topsoil Depth to Remove", unit: "L", defaultVal: "0.15" },
    ],
    compute: (v, shared, isSI) => {
      const vol = v.area * v.depth;
      return {
        results: { "Topsoil Volume": `${vol.toFixed(2)} ${isSI ? "m³" : "cu.ft"}` },
        sharedOutputs: { v_topsoil: vol }
      };
    }
  },
  // 2. Site Excavation
  {
    id: "excavation",
    label: "2. Site Excavation",
    group: "Earthworks",
    icon: Pickaxe,
    inputs: [
      { id: "length", label: "Total Trench Length", unit: "L", defaultVal: "50" },
      { id: "width", label: "Trench Width", unit: "L", defaultVal: "1" },
      { id: "depth", label: "Trench Depth", unit: "L", defaultVal: "1.5" },
      { id: "swell", label: "Soil Swell Factor (%)", unit: "%", defaultVal: "20" }
    ],
    compute: (v, shared, isSI) => {
      const vol = v.length * v.width * v.depth;
      const looseVol = vol * (1 + v.swell / 100);
      return {
        results: {
          "Bank Volume (In-situ)": `${vol.toFixed(2)} ${isSI ? "m³" : "cu.ft"}`,
          "Loose Volume (Excavated)": `${looseVol.toFixed(2)} ${isSI ? "m³" : "cu.ft"}`,
        },
        sharedOutputs: { v_excavation: looseVol, v_bank_excavation: vol }
      };
    }
  },
  // 3. Anti-Termite
  {
    id: "antitermite",
    label: "3. Anti-Termite Treatment",
    group: "Earthworks",
    icon: Droplet,
    inputs: [
      { id: "area", label: "Treatment Area", unit: "A", defaultVal: "200" },
      { id: "rate", label: "Chemical Rate", unit: "Liters/A", defaultVal: "5" }
    ],
    compute: (v, shared, isSI) => {
      const chem = v.area * v.rate;
      return { results: { "Chemical Required": `${chem.toFixed(2)} Liters` } };
    }
  },
  // 4. Backfilling
  {
    id: "filling",
    label: "4. Backfilling",
    group: "Earthworks",
    icon: Truck,
    inputs: [
      { id: "compaction", label: "Compaction Shrinkage (%)", unit: "%", defaultVal: "15" }
    ],
    sharedDependencies: ["v_bank_excavation", "v_foundation_concrete"],
    compute: (v, shared, isSI) => {
      const exc = shared.v_bank_excavation || 0;
      const conc = shared.v_foundation_concrete || 0;
      let fillSpace = exc - conc;
      if (fillSpace < 0) fillSpace = 0;
      const requiredFill = fillSpace * (1 + v.compaction / 100);
      return {
        results: {
          "Space to Fill": `${fillSpace.toFixed(2)} ${isSI ? "m³" : "cu.ft"}`,
          "Required Fill Material": `${requiredFill.toFixed(2)} ${isSI ? "m³" : "cu.ft"}`
        },
        sharedOutputs: { v_backfill: requiredFill }
      };
    }
  },
  // 5. PCC Foundation
  {
    id: "pcc_foundation",
    label: "5. PCC Foundation",
    group: "Substructure",
    icon: Box,
    inputs: [
      { id: "length", label: "Total Base Length", unit: "L", defaultVal: "50" },
      { id: "width", label: "Base Width", unit: "L", defaultVal: "1" },
      { id: "depth", label: "Thickness", unit: "L", defaultVal: "0.15" },
    ],
    compute: (v, shared, isSI) => {
      const vol = v.length * v.width * v.depth;
      const dryVol = vol * 1.54; // CONCRETE_DRY_VOLUME
      const cementBags = Math.ceil(dryVol * (1/7) / 0.0347); // Assuming 1:2:4 -> Cement = 1/7
      return {
        results: {
          "Wet Volume": `${vol.toFixed(2)} ${isSI ? "m³" : "cu.ft"}`,
          "Dry Volume": `${dryVol.toFixed(2)} ${isSI ? "m³" : "cu.ft"}`,
          "Cement Bags (approx 1:2:4)": cementBags
        },
        sharedOutputs: { v_pcc: vol, v_foundation_concrete: vol }
      };
    }
  },
  // 6. RCC Footing (Trapezoidal using rule)
  {
    id: "rcc_footing",
    label: "6. RCC Footing (Trapezoidal)",
    group: "Substructure",
    icon: Box,
    inputs: [
      { id: "count", label: "Number of Footings", defaultVal: "10" },
      { id: "L", label: "Bottom Length", unit: "L", defaultVal: "1.5" },
      { id: "W", label: "Bottom Width", unit: "L", defaultVal: "1.5" },
      { id: "h1", label: "Rectangular Height", unit: "L", defaultVal: "0.2" },
      { id: "tL", label: "Top Length (Column)", unit: "L", defaultVal: "0.4" },
      { id: "tW", label: "Top Width (Column)", unit: "L", defaultVal: "0.4" },
      { id: "h2", label: "Sloped Height", unit: "L", defaultVal: "0.3" },
    ],
    sharedDependencies: ["v_pcc"],
    compute: (v, shared, isSI) => {
      // rule TRAPEZOIDAL_FOOTING_VOLUME
      const A1 = v.L * v.W;
      const A2 = v.tL * v.tW;
      const vRect = A1 * v.h1;
      const vSlope = (v.h2 / 3) * (A1 + A2 + Math.sqrt(A1 * A2));
      const singleVol = vRect + vSlope;
      const totalVol = singleVol * v.count;
      const dryVol = totalVol * 1.54; // CONCRETE_DRY_VOLUME
      // Combine with PCC for backfill
      const pcc = shared.v_pcc || 0;
      const totalFoundConc = pcc + totalVol;
      return {
        results: {
          "Single Footing Vol": `${singleVol.toFixed(3)} ${isSI ? "m³" : "cu.ft"}`,
          "Total Wet Volume": `${totalVol.toFixed(2)} ${isSI ? "m³" : "cu.ft"}`,
          "Total Dry Volume": `${dryVol.toFixed(2)} ${isSI ? "m³" : "cu.ft"}`,
        },
        sharedOutputs: { v_rcc_footing: totalVol, v_foundation_concrete: totalFoundConc }
      };
    }
  },
  // 7. DPC
  {
    id: "dpc",
    label: "7. Damp Proof Course",
    group: "Substructure",
    icon: Layers,
    inputs: [
      { id: "length", label: "Total Wall Length", unit: "L", defaultVal: "100" },
      { id: "width", label: "Wall Width", unit: "L", defaultVal: "0.23" },
      { id: "thick", label: "Thickness", unit: "L", defaultVal: "0.05" },
    ],
    compute: (v, shared, isSI) => {
      const area = v.length * v.width;
      const vol = area * v.thick;
      const dryVol = vol * 1.54; // concrete dry vol
      return {
         results: { "DPC Area": `${area.toFixed(2)} ${isSI ? "m²" : "sq.ft"}`, "DPC Concrete (Dry)": `${dryVol.toFixed(2)} ${isSI ? "m³" : "cu.ft"}` },
         sharedOutputs: { a_dpc: area }
      };
    }
  },
  // 8. Plinth Beam
  {
    id: "plinth_beam",
    label: "8. Plinth Beams",
    group: "Substructure",
    icon: Box,
    inputs: [
      { id: "len", label: "Total Length", unit: "L", defaultVal: "100" },
      { id: "w", label: "Width", unit: "L", defaultVal: "0.23" },
      { id: "d", label: "Depth", unit: "L", defaultVal: "0.3" },
    ],
    compute: (v, shared, isSI) => {
      const vol = v.len * v.w * v.d;
      return {
        results: { "Wet Volume": vol.toFixed(2), "Dry Volume": (vol*1.54).toFixed(2) },
        sharedOutputs: { v_plinth: vol }
      };
    }
  },
  // 9. RCC Columns
  {
    id: "rcc_columns",
    label: "9. RCC Columns",
    group: "Superstructure",
    icon: Columns,
    inputs: [
      { id: "count", label: "Count", defaultVal: "10" },
      { id: "L", label: "Length", unit: "L", defaultVal: "0.4" },
      { id: "W", label: "Width", unit: "L", defaultVal: "0.4" },
      { id: "H", label: "Height", unit: "L", defaultVal: "3" },
      { id: "spacing", label: "Rebar Spacing (mm)", defaultVal: "200" }
    ],
    compute: (v, shared, isSI) => {
      const vol = v.count * v.L * v.W * v.H;
      // REBAR_SPACING_COUNT
      const spacingM = v.spacing / 1000;
      const stirrupsPerCol = Math.ceil(v.H / spacingM) + 1;
      const totalStirrups = stirrupsPerCol * v.count;
      
      return { 
        results: { 
          "Concrete Wet Vol": vol.toFixed(2), 
          "Dry Vol": (vol*1.54).toFixed(2),
          "Total Stirrups": totalStirrups
        }, 
        sharedOutputs: { v_columns: vol } 
      };
    }
  },
  // 10. RCC Beams
  {
    id: "rcc_beams",
    label: "10. RCC Beams",
    group: "Superstructure",
    icon: Box,
    inputs: [
      { id: "len", label: "Total Length", unit: "L", defaultVal: "100" },
      { id: "w", label: "Width", unit: "L", defaultVal: "0.23" },
      { id: "d", label: "Depth", unit: "L", defaultVal: "0.3" },
    ],
    compute: (v, shared, isSI) => {
      const vol = v.len * v.w * v.d;
      return { results: { "Concrete Wet Vol": vol.toFixed(2), "Dry Vol": (vol*1.54).toFixed(2) }, sharedOutputs: { v_beams: vol } };
    }
  },
  // 11. RCC Slab (Must use EFFECTIVE_DEPTH calc)
  {
    id: "rcc_slab",
    label: "11. RCC Slab",
    group: "Superstructure",
    icon: Square,
    inputs: [
      { id: "A", label: "Slab Area", unit: "A", defaultVal: "100" },
      { id: "thickness", label: "Total Thickness (mm)", defaultVal: "150" },
      { id: "cc", label: "Clear Cover (mm)", defaultVal: "20" },
      { id: "phi", label: "Main Bar Dia (mm)", defaultVal: "10" },
    ],
    compute: (v, shared, isSI) => {
      // rule EFFECTIVE DEPTH CALCULATION: d = D - (Clear Cover + phi/2)
      const d_eff = v.thickness - (v.cc + v.phi / 2);
      const D_meters = v.thickness / 1000;
      const vol = v.A * D_meters;
      const dryVol = vol * 1.54;
      return {
        results: { 
          "Effective Depth (d)": `${d_eff.toFixed(2)} mm`,
          "Wet Concrete Vol": `${vol.toFixed(2)}`,
          "Dry Concrete Vol": `${dryVol.toFixed(2)}`
        },
        sharedOutputs: { v_slab: vol }
      };
    }
  },
  // 12. Brickwork (Masonry)
  {
    id: "brickwork",
    label: "12. Brickwork",
    group: "Superstructure",
    icon: Layers,
    inputs: [
      { id: "len", label: "Wall Length", unit: "L", defaultVal: "50" },
      { id: "h", label: "Height", unit: "L", defaultVal: "3" },
      { id: "w", label: "Thickness", unit: "L", defaultVal: "0.23" },
      { id: "bl", label: "Brick Length (mm)", defaultVal: "230" },
      { id: "bw", label: "Brick Width (mm)", defaultVal: "110" },
      { id: "bh", label: "Brick Height (mm)", defaultVal: "75" },
      { id: "jt", label: "Mortar Joint (mm)", defaultVal: "10" },
    ],
    compute: (v, shared, isSI) => {
      const volWall = v.len * v.h * v.w;
      // rule MASONRY_BRICK_COUNT: N = V_wall / V_brick_with_mortar
      const V_brick_mortar = ((v.bl + v.jt)/1000) * ((v.bw + v.jt)/1000) * ((v.bh + v.jt)/1000);
      const N = Math.ceil(volWall / V_brick_mortar);
      // Mortar volume = Wall volume - Brick only volume
      const V_brick_only = (v.bl/1000) * (v.bw/1000) * (v.bh/1000) * N;
      const V_mortar_wet = volWall - V_brick_only;
      const V_mortar_dry = V_mortar_wet * 1.33; // MORTAR_DRY_VOLUME
      
      const cementBags = Math.ceil((V_mortar_dry * (1/5)) / 0.0347); // Assume 1:4 ratio -> 1/5 cement
      return {
        results: {
          "Total Bricks": N,
          "Dry Mortar Vol": V_mortar_dry.toFixed(3),
          "Cement Bags (approx 1:4)": cementBags
        },
        sharedOutputs: { v_brickwork: volWall }
      };
    }
  },
  // 13. Staircase
  {
    id: "stairs",
    label: "13. Staircase Concrete",
    group: "Superstructure",
    icon: Layers, // Stairs icon substitute
    inputs: [
      { id: "steps", label: "Number of Steps", defaultVal: "20" },
      { id: "tread", label: "Tread", unit: "L", defaultVal: "0.3" },
      { id: "riser", label: "Riser", unit: "L", defaultVal: "0.15" },
      { id: "width", label: "Flight Width", unit: "L", defaultVal: "1.2" },
      { id: "waist", label: "Waist Slab Thickness", unit: "L", defaultVal: "0.15" },
    ],
    compute: (v, shared, isSI) => {
      const stepVol = 0.5 * v.tread * v.riser * v.width * v.steps;
      const flightLen = Math.sqrt(v.tread*v.tread + v.riser*v.riser) * v.steps;
      const waistVol = flightLen * v.width * v.waist;
      const total = stepVol + waistVol;
      return {
        results: { "Concrete Vol (Wet)": total.toFixed(3), "Concrete Vol (Dry)": (total*1.54).toFixed(3) }
      };
    }
  },
  // 14. Lintel Concrete
  {
    id: "lintel",
    label: "14. Lintels",
    group: "Superstructure",
    icon: Box,
    inputs: [
      { id: "count", label: "Count", defaultVal: "10" },
      { id: "L", label: "Length", unit: "L", defaultVal: "1.5" },
      { id: "W", label: "Width", unit: "L", defaultVal: "0.23" },
      { id: "D", label: "Depth", unit: "L", defaultVal: "0.15" },
    ],
    compute: (v, shared, isSI) => {
      const vol = v.count * v.L * v.W * v.D;
      return { results: { "Concrete Vol (Wet)": vol.toFixed(3), "Concrete Vol (Dry)": (vol*1.54).toFixed(3) } };
    }
  },
  // 15. Wall Plastering
  {
    id: "plastering",
    label: "15. Wall Plastering",
    group: "Finishes",
    icon: PaintBucket,
    inputs: [
      { id: "L", label: "Total Wall Length", unit: "L", defaultVal: "100" },
      { id: "H", label: "Wall Height", unit: "L", defaultVal: "3" },
      { id: "openings", label: "Openings Area", unit: "A", defaultVal: "20" },
      { id: "thick", label: "Plaster Thickness (mm)", defaultVal: "12" },
      { id: "ratio", label: "Sand Ratio (1:X)", defaultVal: "4" }
    ],
    compute: (v, shared, isSI) => {
      // rule PLASTERING_DEDUCTIONS (simpler form based on inputs)
      const A_gross = v.L * v.H;
      const A_total = A_gross - v.openings; 
      const t = v.thick / 1000;
      const v_wet = A_total * t;
      // rule MORTAR_DRY_VOLUME: V_dry = V_wet * 1.33
      const v_dry = v_wet * 1.33;
      // Cement:Sand ratio is 1 : v.ratio
      const cementVol = v_dry * (1 / (1 + v.ratio)); // rule CEMENT_BAG_CONVERSION
      const bags = Math.ceil(cementVol / 0.0347);
      return {
        results: { "Net Plaster Area": A_total.toFixed(2), "Dry Mortar Vol": v_dry.toFixed(3), "Cement Bags": bags },
        sharedOutputs: { a_wall_plaster: A_total }
      };
    }
  },
  // 16. Ceiling Plastering
  {
    id: "ceiling_plaster",
    label: "16. Ceiling Plaster",
    group: "Finishes",
    icon: PaintBucket,
    inputs: [
      { id: "area", label: "Ceiling Area", unit: "A", defaultVal: "100" },
      { id: "thick", label: "Thickness (mm)", defaultVal: "6" },
      { id: "ratio", label: "Sand Ratio (1:X)", defaultVal: "3" }
    ],
    compute: (v, shared, isSI) => {
      const v_wet = v.area * (v.thick / 1000);
      const v_dry = v_wet * 1.33; // MORTAR_DRY_VOLUME
      const cementVol = v_dry * (1 / (1 + v.ratio)); 
      const bags = Math.ceil(cementVol / 0.0347); // CEMENT_BAG_CONVERSION
      return { results: { "Dry Mortar Vol": v_dry.toFixed(3), "Cement Bags": bags } };
    }
  },
  // 17. Flooring Base
  {
    id: "floor_base",
    label: "17. Flooring Base Concrete",
    group: "Finishes",
    icon: Box,
    inputs: [
      { id: "area", label: "Floor Area", unit: "A", defaultVal: "100" },
      { id: "thick", label: "Thickness (mm)", defaultVal: "50" },
    ],
    compute: (v, shared, isSI) => {
      const vol = v.area * (v.thick / 1000);
      return { results: { "Wet Vol": vol.toFixed(3), "Dry Vol": (vol*1.54).toFixed(3) }, sharedOutputs: { a_flooring: v.area } };
    }
  },
  // 18. Flooring Tiles
  {
    id: "tiles",
    label: "18. Flooring Tiles",
    group: "Finishes",
    icon: Layers,
    inputs: [
      { id: "area", label: "Area", unit: "A", defaultVal: "0" },
      { id: "L", label: "Tile Length (mm)", defaultVal: "600" },
      { id: "W", label: "Tile Width (mm)", defaultVal: "600" },
      { id: "waste", label: "Wastage (%)", defaultVal: "5" }
    ],
    sharedDependencies: ["a_flooring"],
    compute: (v, shared, isSI) => {
      const areaTouse = v.area > 0 ? v.area : shared.a_flooring || 100;
      const tL = v.L / 1000;
      const tW = v.W / 1000;
      const tArea = tL * tW;
      const totalArea = areaTouse * (1 + v.waste/100);
      const count = Math.ceil(totalArea / tArea);
      return { results: { "Tiles Required": count, "Total Area (inc. waste)": totalArea.toFixed(2) } };
    }
  },
  // 19. Skirting
  {
    id: "skirting",
    label: "19. Skirting",
    group: "Finishes",
    icon: Ruler,
    inputs: [
      { id: "perim", label: "Perimeter", unit: "L", defaultVal: "50" },
      { id: "h", label: "Skirting Height (mm)", defaultVal: "100" },
    ],
    compute: (v, shared, isSI) => {
      const A = v.perim * (v.h / 1000);
      return { results: { "Skirting Area": A.toFixed(2) } };
    }
  },
  // 20. Paint
  {
    id: "paint",
    label: "20. Paint & Primer",
    group: "Finishes",
    icon: PaintBucket,
    inputs: [
      { id: "area", label: "Area", unit: "A", defaultVal: "0" },
      { id: "coats", label: "Number of Coats", defaultVal: "2" },
      { id: "spread", label: "Spread Area/Liter", defaultVal: "12" },
    ],
    sharedDependencies: ["a_wall_plaster"],
    compute: (v, shared, isSI) => {
      const areaTarget = v.area > 0 ? v.area : shared.a_wall_plaster || 200;
      const liters = (areaTarget / v.spread) * v.coats;
      return { results: { "Paint Required": `${liters.toFixed(2)} Liters` } };
    }
  },
  // 21. False Ceiling
  {
    id: "false_ceiling",
    label: "21. False Ceiling",
    group: "Specialized",
    icon: Columns,
    inputs: [
      { id: "area", label: "Ceiling Area", unit: "A", defaultVal: "100" },
      { id: "boardL", label: "Board Length (mm)", defaultVal: "1200" },
      { id: "boardW", label: "Board Width (mm)", defaultVal: "600" },
    ],
    compute: (v, shared, isSI) => {
      const A_board = (v.boardL / 1000) * (v.boardW / 1000);
      const count = Math.ceil((v.area * 1.05) / A_board); // 5% waste
      return { results: { "Gypsum Boards": count } };
    }
  },
  // 22. Waterproofing
  {
    id: "waterproof",
    label: "22. Waterproofing",
    group: "Specialized",
    icon: Droplet,
    inputs: [
      { id: "area", label: "Area (Roof/Bath)", unit: "A", defaultVal: "50" },
      { id: "coats", label: "Coats", defaultVal: "2" },
      { id: "spread", label: "Spread (Area/L)", defaultVal: "4" }
    ],
    compute: (v, shared, isSI) => {
      const liters = (v.area / v.spread) * v.coats;
      return { results: { "Chemical Liters": liters.toFixed(2) } };
    }
  },
  // 23. Unified BOQ
  {
    id: "boq",
    label: "23. Unified BOQ",
    group: "Summary",
    icon: ClipboardList,
    inputs: [],
    sharedDependencies: ["v_excavation", "v_bank_excavation", "v_foundation_concrete", "v_backfill", "v_pcc", "v_rcc_footing", "a_dpc", "v_columns", "v_slab", "v_brickwork"],
    compute: (v, shared, isSI) => {
      const agg = {
        "Earthworks Vol": `${(shared.v_excavation || 0).toFixed(2)}`,
        "Backfill Vol": `${(shared.v_backfill || 0).toFixed(2)}`,
        "PCC Found. Vol": `${(shared.v_pcc || 0).toFixed(2)}`,
        "RCC Footing Vol": `${(shared.v_rcc_footing || 0).toFixed(2)}`,
        "DPC Area": `${(shared.a_dpc || 0).toFixed(2)}`,
        "Columns Conc.": `${(shared.v_columns || 0).toFixed(2)}`,
        "Slabs Conc.": `${(shared.v_slab || 0).toFixed(2)}`,
        "Brickwork Vol": `${(shared.v_brickwork || 0).toFixed(2)}`,
      };
      return { results: agg };
    }
  }
];
