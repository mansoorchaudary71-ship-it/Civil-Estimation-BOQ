const fs = require('fs');

let file = fs.readFileSync('src/components/modules/AIAssistant.tsx', 'utf-8');

// Imports
if (!file.includes('Mic')) {
  file = file.replace(/import {([^}]+)} from "lucide-react";/, "import {$1, Mic, MicOff} from \"lucide-react\";");
}

// State
const stateToAdd = `
  const [isListening, setIsListening] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      setRecognitionInstance(recognition);
    }
  }, []);

  useEffect(() => {
    if (recognitionInstance) {
      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };
    }
  }, [recognitionInstance]);

  const toggleListening = () => {
    if (!recognitionInstance) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionInstance.stop();
    } else {
      recognitionInstance.start();
    }
  };
`;

if (!file.includes('const [isListening, setIsListening] = useState(false);')) {
  file = file.replace(/const \[isLoading, setIsLoading\] = useState\(false\);/, "const [isLoading, setIsLoading] = useState(false);\n" + stateToAdd);
}

const micButton = `
                <button
                  onClick={toggleListening}
                  className={cn(
                    "p-3 rounded-xl transition-all ml-2 shrink-0 flex items-center justify-center border",
                    isListening
                      ? "bg-red-50 text-red-500 border-red-200 animate-pulse"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
                  )}
                  title={isListening ? "Stop dictation" : "Start dictation"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
`;

if (!file.includes('toggleListening')) {
  file = file.replace(/(<button aria-label="Send")/, micButton + "                $1");
}

fs.writeFileSync('src/components/modules/AIAssistant.tsx', file);
