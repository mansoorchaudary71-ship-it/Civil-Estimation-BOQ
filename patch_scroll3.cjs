const fs = require('fs');
let code = fs.readFileSync('src/components/ui/ScrollToTop.tsx', 'utf8');

code = code.replace(
  /const interval = setInterval\(\(\) => \{[\s\S]*?\}, 1000\);/,
  `const interval = setInterval(() => {
        const mainContent = document.getElementById("main-content");
        if (mainContent) {
            const mainRect = mainContent.getBoundingClientRect();
            const scrolledPastMainTop = -mainRect.top;
            if (scrolledPastMainTop < 100) {
                setIsVisible(false);
            }
        } else {
            let activeScrollTop = 0;
            const scrollableContainers = document.querySelectorAll('.overflow-y-auto, .overflow-y-scroll, main div');
            for (let i = 0; i < scrollableContainers.length; i++) {
                const el = scrollableContainers[i] as HTMLElement;
                if (el.clientHeight >= window.innerHeight * 0.5 && el.scrollTop > 0) {
                    activeScrollTop = Math.max(activeScrollTop, el.scrollTop);
                }
            }
            if (activeScrollTop < 100 && (window.scrollY || document.documentElement.scrollTop) < 100) {
                setIsVisible(false);
            }
        }
    }, 1000);`
);

fs.writeFileSync('src/components/ui/ScrollToTop.tsx', code);
