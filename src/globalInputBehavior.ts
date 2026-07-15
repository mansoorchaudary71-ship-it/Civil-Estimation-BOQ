export function initGlobalInputBehavior() {
  if (typeof window === 'undefined') return;

  // Utility to set value and trigger React's synthetic event
  const setNativeValue = (element: HTMLInputElement, value: string) => {
    const valueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(element),
      "value"
    )?.set;

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }
    
    element.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const processInputs = () => {
    const inputs = document.querySelectorAll('input[type="number"], input.calc-input');
    inputs.forEach(input => {
      const el = input as HTMLInputElement;
      
      if (!el.placeholder) {
        el.placeholder = "0";
      }
      
      // Clear initial "0" to use placeholder instead, do this automatically
      // to remove hardcoded value="0" and rely on placeholder.
      if (el.value === "0" && el.dataset.clearedZero !== "true") {
        el.dataset.clearedZero = "true";
        setNativeValue(el, "");
      }
    });
  };

  // Run once immediately
  processInputs();

  // Observe DOM mutations to cover new calculators loading
  const observer = new MutationObserver((mutations) => {
    let shouldUpdate = false;
    for (let mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        shouldUpdate = true;
        break;
      }
    }
    if (shouldUpdate) {
      processInputs();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Additional check: clear "0" on focus if it somehow got set back to "0" (e.g. react state reset)
  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLInputElement;
    if (target && target.tagName === 'INPUT' && (target.type === 'number' || target.classList.contains('calc-input'))) {
      if (target.value === '0') {
        target.dataset.clearedZero = "true";
        setNativeValue(target, '');
      }
    }
  });
  
  // Format handling globally
  document.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    if (target && target.tagName === 'INPUT' && (target.type === 'number' || target.classList.contains('calc-input'))) {
      if (!target.placeholder) {
        target.placeholder = "0";
      }
    }
  });
}

