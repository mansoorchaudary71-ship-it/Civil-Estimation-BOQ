const fs = require('fs');
const file = 'src/App.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `    document.addEventListener('input', handleInput, true);
    document.addEventListener('focusout', handleFocusOut, true);

    return () => {
      document.removeEventListener('input', handleInput, true);
      document.removeEventListener('focusout', handleFocusOut, true);
    };`;

content = content.replace(/    document\.addEventListener\('input', handleInput, true\);\s*document\.addEventListener\('focusout', handleFocusOut, true\);\s*return \(\) => \{\s*document\.removeEventListener\('input', handleInput, true\);\s*document\.removeEventListener\('focusout', handleFocusOut, true\);\s*\};\s*\}, \[\]\);/, `    const handleUnitsChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newMeasurement = customEvent.detail?.measurement;
      if (!newMeasurement) return;

      const inputs = document.querySelectorAll('input[type="number"], input[inputmode="decimal"], input[inputmode="numeric"]');
      
      inputs.forEach((input) => {
        const target = input as HTMLInputElement;
        const val = parseFloat(target.value);
        if (isNaN(val) || val === 0) return;

        const identifiers = (target.id + " " + target.name + " " + target.placeholder + " " + target.className).toLowerCase();
        
        if (
          identifiers.includes('price') || 
          identifiers.includes('cost') || 
          identifiers.includes('rate') || 
          identifiers.includes('percent') || 
          identifiers.includes('ratio') || 
          identifiers.includes('count') || 
          identifiers.includes('quantity') ||
          identifiers.includes('days') ||
          identifiers.includes('hours') ||
          identifiers.includes('year') ||
          identifiers.includes('month') ||
          identifiers.includes('bag')
        ) {
          return;
        }
        
        let factor = 1;
        
        if (identifiers.includes('volume') || identifiers.includes('cubic')) {
           factor = newMeasurement === 'SI' ? (1 / 35.3147) : 35.3147;
        } else if (identifiers.includes('area') || identifiers.includes('sq') || identifiers.includes('square')) {
           factor = newMeasurement === 'SI' ? (1 / 10.7639) : 10.7639;
        } else if (identifiers.includes('weight') || identifiers.includes('mass') || identifiers.includes('kg') || identifiers.includes('lbs')) {
           factor = newMeasurement === 'SI' ? (1 / 2.20462) : 2.20462;
        } else {
           factor = newMeasurement === 'SI' ? 0.3048 : 3.28084;
        }
        
        const newVal = Number((val * factor).toFixed(3));
        setNativeValue(target, newVal.toString());
        target.dispatchEvent(new Event('input', { bubbles: true }));
      });
    };

    document.addEventListener('input', handleInput, true);
    document.addEventListener('focusout', handleFocusOut, true);
    window.addEventListener('units-changed', handleUnitsChanged);

    return () => {
      document.removeEventListener('input', handleInput, true);
      document.removeEventListener('focusout', handleFocusOut, true);
      window.removeEventListener('units-changed', handleUnitsChanged);
    };
  }, []);`);

fs.writeFileSync(file, content);
console.log("Patched App.tsx with Regex");
