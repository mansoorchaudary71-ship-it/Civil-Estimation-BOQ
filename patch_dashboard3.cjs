const fs = require('fs');
let content = fs.readFileSync('src/components/Dashboard.tsx', 'utf8');

const regex = /const handleSelect = \(id: string, inputs\?: any\) => \{\s*if \(trackToolUse\) trackToolUse\(id\);\s*addRecentTool\(id, inputs\);\s*onSelectModule\(id\);\s*\};/g;

content = content.replace(regex, `const handleSelect = (id: string, inputsOrLayoutId?: any, explicitLayoutId?: string) => {
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
  };`);

fs.writeFileSync('src/components/Dashboard.tsx', content);
