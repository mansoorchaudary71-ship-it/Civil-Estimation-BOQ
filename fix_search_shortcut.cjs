const fs = require('fs');

let content = fs.readFileSync('src/components/SearchAndFilterBar.tsx', 'utf8');

const shortcutEffect = `
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent '/' if we are already in an input, textarea or contenteditable
      if (
        e.key === '/' && 
        document.activeElement?.tagName !== 'INPUT' && 
        document.activeElement?.tagName !== 'TEXTAREA' &&
        !(document.activeElement as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
`;

// Insert the ref and effect just after 'const getSuggestions = () => {' and before the return statement. Wait, better to place it where other hooks are.
content = content.replace('  const getSuggestions = () => {', shortcutEffect + '\n  const getSuggestions = () => {');

// Attach the ref to the input
content = content.replace(/<input\n\s*type="text"/, '<input\n              ref={inputRef}\n              type="text"');
content = content.replace(/<input type="text"/, '<input ref={inputRef} type="text"');

fs.writeFileSync('src/components/SearchAndFilterBar.tsx', content);
