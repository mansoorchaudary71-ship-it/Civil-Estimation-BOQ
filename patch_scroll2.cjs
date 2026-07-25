const fs = require('fs');
let code = fs.readFileSync('src/components/ui/ScrollToTop.tsx', 'utf8');

code = code.replace(
  /const handleScroll = \(e: Event\) => \{[\s\S]*?\};\s*\/\/ Use capture phase to catch scroll events from all elements/,
  `const handleScroll = (e: Event) => {
      const target = e.target;
      let scrollTop = 0;
      if (target === document || target === window) {
        scrollTop = window.scrollY || document.documentElement.scrollTop;
      } else if (target instanceof HTMLElement) {
        if (target.clientHeight >= window.innerHeight * 0.5) {
          scrollTop = target.scrollTop;
        } else {
          return;
        }
      }
      
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
          // Calculate the distance from the top of the page to the top of the #main-content
          const mainRect = mainContent.getBoundingClientRect();
          // The scrolled amount within or past the main content
          const scrolledPastMainTop = -mainRect.top;
          
          if (scrolledPastMainTop > 300) {
              setIsVisible(true);
          } else if (scrolledPastMainTop < 100) {
              setIsVisible(false);
          }
      } else {
          if (scrollTop > 400) {
            setIsVisible(true);
          } else if (scrollTop < 100) {
            setIsVisible(false);
          }
      }
    };
    // Use capture phase to catch scroll events from all elements`
);

fs.writeFileSync('src/components/ui/ScrollToTop.tsx', code);
