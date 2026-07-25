const fs = require('fs');
let code = fs.readFileSync('src/components/ui/ScrollToTop.tsx', 'utf8');

code = code.replace(
  /const scrollToTop = \(\) => \{[\s\S]*?\};/,
  `const scrollToTop = () => {
    let activeContainer: HTMLElement | Window = window;
    let maxScroll = window.scrollY || document.documentElement.scrollTop;
    const scrollableContainers = document.querySelectorAll('.overflow-y-auto, .overflow-y-scroll, main div, #main-content');
    for (let i = 0; i < scrollableContainers.length; i++) {
        const el = scrollableContainers[i] as HTMLElement;
        if (el.clientHeight >= window.innerHeight * 0.5 && el.scrollTop > maxScroll) {
            maxScroll = el.scrollTop;
            activeContainer = el;
        }
    }

    const mainContent = document.getElementById("main-content");
    const toolHeader = document.getElementById("tool-header-top");
    const dashboardHero = document.getElementById("dashboard-hero") || document.querySelector('.hero-section');
    
    if (activeContainer instanceof HTMLElement) {
      if (mainContent && activeContainer.contains(mainContent)) {
        const y = mainContent.offsetTop;
        activeContainer.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      } else if (toolHeader && activeContainer.contains(toolHeader)) {
        const y = toolHeader.offsetTop - 80;
        activeContainer.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      } else if (dashboardHero && activeContainer.contains(dashboardHero)) {
        const y = (dashboardHero as HTMLElement).offsetTop - 80;
        activeContainer.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      } else {
        activeContainer.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      if (mainContent) {
        const y = mainContent.getBoundingClientRect().top + window.scrollY - 80; // Added offset for header
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      } else if (toolHeader) {
        const y = toolHeader.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      } else if (dashboardHero) {
        const y = dashboardHero.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };`
);

fs.writeFileSync('src/components/ui/ScrollToTop.tsx', code);
