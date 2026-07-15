const fs = require('fs');
const file = 'src/components/modules/UnitConverter.tsx';
let content = fs.readFileSync(file, 'utf8');

const stateStr = `  const [batchResults, setBatchResults] = useState<{in: string, out: string}[]>([]);`;
const newState = `  const [batchResults, setBatchResults] = useState<{in: string, out: string}[]>([]);
  const [recentConversions, setRecentConversions] = useState<{
    id: string;
    timestamp: number;
    fromValue: string;
    fromUnit: string;
    toValue: string;
    toUnit: string;
    category: Category;
  }[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("unit_converter_recent");
    if (saved) {
      try {
        setRecentConversions(JSON.parse(saved));
      } catch (e) { }
    }
  }, []);

  useEffect(() => {
    if (!fromValue || isNaN(parseFloat(fromValue)) || !toValue || isBatchMode || isCompareMode) return;
    
    const timeout = setTimeout(() => {
      setRecentConversions(prev => {
        if (prev.length > 0) {
          const last = prev[0];
          if (last.fromValue === fromValue && last.fromUnit === fromUnit && last.toUnit === toUnit) {
            return prev;
          }
        }
        
        const newRecent = [
          {
            id: Date.now().toString(),
            timestamp: Date.now(),
            fromValue,
            fromUnit,
            toValue,
            toUnit,
            category: activeCategory
          },
          ...prev
        ].slice(0, 5);
        
        localStorage.setItem("unit_converter_recent", JSON.stringify(newRecent));
        return newRecent;
      });
    }, 1500);
    
    return () => clearTimeout(timeout);
  }, [fromValue, fromUnit, toUnit, toValue, activeCategory, isBatchMode, isCompareMode]);`;

content = content.replace(stateStr, newState);
fs.writeFileSync(file, content);
