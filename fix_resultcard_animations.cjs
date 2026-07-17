const fs = require('fs');
let content = fs.readFileSync('src/components/ui/ResultCard.tsx', 'utf8');

if (!content.includes('import { useDebounce }')) {
  content = content.replace("import { useCountUp } from '../../hooks/useCountUp';", "import { useCountUp } from '../../hooks/useCountUp';\nimport { useDebounce } from '../../hooks/useDebounce';");
}

content = content.replace(
  /const controls = useAnimation\(\);\n\s*const \[hasMounted, setHasMounted\] = useState\(false\);/,
  `const controls = useAnimation();
  const [hasMounted, setHasMounted] = useState(false);
  const debouncedValue = useDebounce(value, 600);`
);

content = content.replace(
  /useEffect\(\(\) => \{\n\s*if \(\!hasMounted\) \{\n\s*controls\.start\(\{\n\s*opacity: 1,\n\s*y: 0,\n\s*scale: 1,\n\s*transition: \{ duration: 0\.4, delay, ease: \[0\.23, 1, 0\.32, 1\] \}\n\s*\}\);\n\s*setHasMounted\(true\);\n\s*\} else \{\n\s*controls\.set\(\{\ opacity: 0, y: 15, scale: 0\.98 \}\);\n\s*controls\.start\(\{\n\s*opacity: 1,\n\s*y: 0,\n\s*scale: 1,\n\s*transition: \{ duration: 0\.4, ease: \[0\.23, 1, 0\.32, 1\] \}\n\s*\}\);\n\s*\}\n\s*\}, \[value, controls, delay\]\);/,
  `useEffect(() => {
    if (!hasMounted) {
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }
      });
      setHasMounted(true);
    } else {
      controls.set({ opacity: 0, y: 15, scale: 0.98 });
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
      });
    }
  }, [debouncedValue, controls, delay]);`
);

fs.writeFileSync('src/components/ui/ResultCard.tsx', content);
