const fs = require('fs');
let code = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

if (!code.includes('import CategoryHub')) {
  code = code.replace(
    'import SocialProofSection from "./SocialProofSection";',
    'import SocialProofSection from "./SocialProofSection";\nimport CategoryHub from "./CategoryHub";'
  );
}

const renderOld = `<div className="flex flex-col w-full">
                  {isComputing ? <ToolsSkeleton /> : groupsToDisplay.map((groupName, index) => {
                    const toolsInGroup = groupedModules[groupName];
                    if (!toolsInGroup || toolsInGroup.length === 0) return null;
                    return (
                      <div key={groupName} className={\`w-full flex flex-col py-12 md:py-20 \${index % 3 === 0 ? 'bg-[#F4F1EA]' : index % 3 === 1 ? 'bg-[#F0F5FF]' : 'bg-[#D9E6DD]'}\`}>
                        <div className="w-full md:max-w-[1400px] md:mx-auto px-4 flex flex-col gap-5">
                          <h2 className="px-2 flex items-center gap-2 text-xl font-semibold text-slate-800 tracking-tight mb-4">
                            {groupName}
                            <span className="text-sm font-normal px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 shadow-sm">{toolsInGroup.length}</span>
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 tool-card-grid">
                            {toolsInGroup.map((mod, modIdx) => (
                              <motion.div
                                key={mod.id}
                                id={\`module-card-\${mod.id}\`}
                                className="flex flex-col h-full"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.4, delay: modIdx * 0.05 }}
                              >
                                <ToolCard mod={mod} onSelect={handleSelect} layoutId={\`card-\${groupName || 'group'}-\${mod.id}\`} categoryColor={index % 3 === 0 ? '#F4F1EA' : index % 3 === 1 ? '#F0F5FF' : '#D9E6DD'} />
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>`;

const renderNew = `<CategoryHub groupedModules={groupedModules} groupsToDisplay={groupsToDisplay} handleSelect={handleSelect} isComputing={isComputing} />`;

code = code.replace(renderOld, renderNew);

fs.writeFileSync('src/components/Dashboard.tsx', code);
