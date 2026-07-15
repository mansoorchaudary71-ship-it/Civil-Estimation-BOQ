import { useState, useEffect } from "react";
import { GlobalSettingsToggle } from "../ui/GlobalSettingsToggle";
import { Send, Loader2, Bot } from "lucide-react";
import Markdown from "react-markdown";
import { cn } from "../../lib/utils";
import { processAIEstimate } from "../../lib/gemini";
import { CalculationHistory } from "../ui/CalculationHistory";

interface Message {
  role: "user" | "model";
  content: string;
  isStreaming?: boolean;
}

// Simulated streaming effect component
function StreamingMessage({ content, isStreaming, onComplete }: { content: string, isStreaming?: boolean, onComplete?: () => void }) {
  const [displayedContent, setDisplayedContent] = useState(isStreaming ? "" : content);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayedContent(content);
      return;
    }

    let currentIndex = 0;
    const streamInterval = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(streamInterval);
        if (onComplete) onComplete();
      }
    }, 15); // Adjust typing speed here (ms per char)

    return () => clearInterval(streamInterval);
  }, [content, isStreaming, onComplete]);

  return <Markdown>{displayedContent}</Markdown>;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content:
        "Hello! I am your AI-powered Civil Engineering Estimator. Describe your project requirements (e.g., 'Estimate materials for a 10x10 room with a 10ft ceiling'), and I will provide a preliminary cost and material breakdown using NLP extraction.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    try {
      const content = await processAIEstimate(userMessage);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            content || "I was unable to generate an estimate at this time.",
          isStreaming: true,
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            "Error executing estimation. Please check your API key configuration and try again.",
          isStreaming: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStreamingComplete = (index: number) => {
    setMessages((prev) =>
      prev.map((msg, i) =>
        i === index ? { ...msg, isStreaming: false } : msg
      )
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 text-slate-900 p-0 sm:p-4 md:p-6 overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[80px] animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
      </div>
      
      <div className="flex-1 w-full max-w-[1200px] mx-auto bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[32px] flex flex-col overflow-hidden relative z-10">
        <div className="px-8 py-5 border-b border-slate-200/50 bg-white/50 backdrop-blur-md flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                AI Estimator
              </h2>
              <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider mt-0.5">Premium Copilot</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-blue-100">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Online
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-4 max-w-4xl mx-auto w-full",
                msg.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {msg.role === "model" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 mt-1 shadow-md shadow-blue-600/20">
                  <Sparkles className="w-4 h-4 text-white" strokeWidth={1.5} />
                </div>
              )}
              <div
                className={cn(
                  "rounded-[24px] px-5 py-3.5 max-w-[85%] text-[15px] shadow-sm backdrop-blur-md transition-all font-medium",
                  msg.role === "user"
                    ? "bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-tr-[8px] shadow-slate-900/10"
                    : "bg-white/90 text-slate-700 border border-slate-200/60 rounded-tl-[8px] shadow-slate-200/50 leading-relaxed",
                )}
              >
                {msg.role === "model" ? (
                  <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-slate-800 prose-a:text-indigo-600 prose-th:bg-slate-100 prose-td:border-slate-200">
                    <StreamingMessage 
                      content={msg.content} 
                      isStreaming={msg.isStreaming} 
                      onComplete={() => handleStreamingComplete(index)} 
                    />
                  </div>
                ) : (
                  <div className="leading-relaxed">{msg.content}</div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 max-w-4xl mx-auto w-full justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 mt-1 shadow-md shadow-blue-600/20">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="rounded-[24px] rounded-tl-[8px] px-5 py-4 bg-white/90 border border-slate-200/60 flex items-center gap-2 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-75"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce delay-150"></span>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 sm:p-6 bg-white/60 backdrop-blur-xl border-t border-slate-200/50 relative z-10">
          <div className="max-w-4xl mx-auto relative group">
             <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-[28px] opacity-30 group-focus-within:opacity-100 blur-[4px] transition-all duration-500"></div>
             <div className="relative flex items-center bg-white/90 backdrop-blur-md rounded-[24px] pl-4 pr-2 py-2 border border-slate-200/50 shadow-inner overflow-hidden">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about cost optimization or estimation..."
                  className="w-full bg-transparent border-none py-2 outline-none text-[15px] text-slate-800 placeholder:text-slate-400 resize-none min-h-[40px] max-h-[120px] shadow-none"
                  rows={1}
                />
                <button aria-label="Send" onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/30 text-white rounded-xl transition-all disabled:opacity-50 hover:scale-105 active:scale-95 ml-2 shrink-0 flex items-center justify-center relative overflow-hidden group/send"
                >
                  <div className="absolute inset-0 bg-white/20 -translate-x-[150%] skew-x-12 group-hover/send:animate-[shimmer_1.5s_infinite]"></div>
                  <Send className="w-4 h-4 relative z-10" />
                </button>
             </div>
          </div>
          <div className="text-center mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            AI generated estimates are preliminary. Always confirm with a certified QS.
          </div>
        </div>
      </div>
      <CalculationHistory
        calculatorId="ai_assistant"
        estimationName="AI Assistant Chat"
        currentInputs={{}}
      />
    </div>
  );
}
