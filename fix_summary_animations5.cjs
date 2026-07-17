const fs = require('fs');
let content = fs.readFileSync('src/components/ui/MaterialSummary.tsx', 'utf8');

if (!content.includes('import { useDebounce }')) {
  content = content.replace("import { useCountUp } from '../../hooks/useCountUp';", "import { useCountUp } from '../../hooks/useCountUp';\nimport { useDebounce } from '../../hooks/useDebounce';");
}

content = content.replace(
  /const controls = useAnimation\(\);\n\s*const \[hasMounted, setHasMounted\] = useState\(false\);/,
  `const controls = useAnimation();
  const [hasMounted, setHasMounted] = useState(false);
  const debouncedTotalValue = useDebounce(totalValue, 600);`
);

content = content.replace(
  /useEffect\(\(\) => \{\n\s*\/\/ Initial mount animation[\s\S]*?\}, \[totalValue, items, controls, hasMounted\]\);/,
  `useEffect(() => {
    if (hasMounted) {
      controls.set({ opacity: 0, y: 15, scale: 0.98 });
      controls.start({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
      });
    } else {
      setHasMounted(true);
    }
  }, [debouncedTotalValue, items, controls, hasMounted]);`
);

fs.writeFileSync('src/components/ui/MaterialSummary.tsx', content);
