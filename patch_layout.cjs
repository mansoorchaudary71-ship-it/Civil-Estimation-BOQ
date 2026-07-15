const fs = require('fs');
const file = 'src/components/modules/UnitConverter.tsx';
let content = fs.readFileSync(file, 'utf8');

const topTarget = `  return (
    <div className="w-full h-full bg-transparent text-slate-900  p-6 md:p-8">
      {" "}
      <div className="w-full md:max-w-6xl md:mx-auto px-4 md:px-0">`;
const topReplace = `  return (
    <div className="w-full h-full bg-transparent text-slate-900  p-6 md:p-8">
      {" "}
      <div className="w-full md:max-w-6xl md:mx-auto px-4 md:px-0">
        <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
          <div className="flex-1 min-w-0">`;

const bottomTarget = `          )}
        </div>{" "}
        {" "}
      </div>{" "}
      <CalculationHistory`;
const bottomReplace = `          )}
        </div>{" "}
        {" "}
          </div>
          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-sm p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-fuchsia-500" />
                <h3 className="text-lg font-bold text-slate-900">Recent Conversions</h3>
              </div>
              
              <div className="space-y-3">
                {recentConversions.length === 0 ? (
                  <p className="text-sm text-slate-500 italic text-center py-6">No recent conversions.</p>
                ) : (
                  recentConversions.map((conv, i) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setActiveCategory(conv.category);
                        setFromUnit(conv.fromUnit);
                        setToUnit(conv.toUnit);
                        setFromValue(conv.fromValue);
                      }}
                      className="w-full text-left bg-white hover:bg-fuchsia-50/50 border border-slate-100 hover:border-fuchsia-100 p-3 rounded-xl transition-all duration-200 group"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-slate-500 uppercase">{conv.category}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {conv.fromValue} <span className="text-xs text-slate-500">{conv.fromUnit}</span>
                          </p>
                        </div>
                        <ArrowRightLeft className="w-3 h-3 text-slate-300 group-hover:text-fuchsia-400 shrink-0" />
                        <div className="min-w-0 text-right">
                          <p className="font-bold text-fuchsia-600 truncate">
                            {conv.toValue} <span className="text-xs text-fuchsia-400">{conv.toUnit}</span>
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>{" "}
      <CalculationHistory`;

if (content.includes(topTarget) && content.includes(bottomTarget)) {
  content = content.replace(topTarget, topReplace);
  content = content.replace(bottomTarget, bottomReplace);
  fs.writeFileSync(file, content);
  console.log("Patched layout successfully.");
} else {
  console.error("Could not find targets.");
}
