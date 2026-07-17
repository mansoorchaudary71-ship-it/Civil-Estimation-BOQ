const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const shortcutLogic = `
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to calculate results
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const buttons = Array.from(document.querySelectorAll('button'));
        const calcBtn = buttons.find(b => 
          b.textContent?.toLowerCase().includes('calculate') || 
          b.textContent?.toLowerCase().includes('recalculate')
        );
        if (calcBtn) {
          calcBtn.click();
        }
      }

      // Esc to close active modals or return to the dashboard
      if (e.key === 'Escape') {
        if (isAuthOpen) {
          setIsAuthOpen(false);
          return;
        }
        if (isProfileOpen) {
          setIsProfileOpen(false);
          return;
        }
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
          return;
        }
        
        // If there is any element with role="dialog" or class includes "modal", don't navigate home (let it close itself)
        const activeModals = document.querySelectorAll('[role="dialog"], .modal-overlay, [data-modal]');
        if (activeModals.length > 0) {
          return;
        }

        if (activeModule !== 'home') {
          handleSelectModule('home');
        }
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeModule, isAuthOpen, isProfileOpen, isSettingsOpen]);

  return (
`;

content = content.replace('  return (', shortcutLogic);

fs.writeFileSync('src/App.tsx', content);
