const fs = require('fs');

let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const oldHandleSelect = `  const handleSelect = (id: string, inputs?: any) => {
    if (trackToolUse) trackToolUse(id);
    addRecentTool(id, inputs);
    onSelectModule(id);
  };`;

const newHandleSelect = `  const handleSelect = (id: string, inputsOrLayoutId?: any, explicitLayoutId?: string) => {
    let layoutId = explicitLayoutId;
    let inputs = undefined;
    if (typeof inputsOrLayoutId === 'string') {
       layoutId = inputsOrLayoutId;
    } else if (inputsOrLayoutId) {
       inputs = inputsOrLayoutId;
    }

    if (trackToolUse) trackToolUse(id);
    addRecentTool(id, inputs);
    onSelectModule(id, layoutId);
  };`;

content = content.replace(oldHandleSelect, newHandleSelect);

// Replace ToolCard instances in Dashboard to pass unique layoutIds
// We have three places where ToolCard is mapped. 
// 1: <ToolCard mod={mod} onSelect={handleSelect} categoryColor={index % 3 === 0 ? '#F4F1EA' : index % 3 === 1 ? '#F0F5FF' : '#D9E6DD'} />
// 2: <ToolCard mod={mod} onSelect={handleSelect} categoryColor={'#f8fafc'} />
// 3: <ToolCard mod={mod} onSelect={handleSelect} categoryColor={index % 3 === 0 ? '#F4F1EA' : index % 3 === 1 ? '#F0F5FF' : '#D9E6DD'} />

content = content.replace(
  /<ToolCard mod=\{mod\} onSelect=\{handleSelect\} categoryColor=\{index % 3 === 0 \? '#F4F1EA' : index % 3 === 1 \? '#F0F5FF' : '#D9E6DD'\} \/>/g,
  "<ToolCard mod={mod} onSelect={handleSelect} layoutId={`card-${groupName || 'group'}-${mod.id}`} categoryColor={index % 3 === 0 ? '#F4F1EA' : index % 3 === 1 ? '#F0F5FF' : '#D9E6DD'} />"
);

content = content.replace(
  /<ToolCard mod=\{mod\} onSelect=\{handleSelect\} categoryColor=\{'#f8fafc'\} \/>/g,
  "<ToolCard mod={mod} onSelect={handleSelect} layoutId={`card-fav-${mod.id}`} categoryColor={'#f8fafc'} />"
);

fs.writeFileSync('src/components/Dashboard.tsx', content);
console.log("Patched Dashboard.tsx");
