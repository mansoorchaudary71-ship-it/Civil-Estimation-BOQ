const fs = require('fs');
const file = 'src/components/ToolCard.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldMotionDiv = `    <motion.div
      layoutId={layoutId || \`module-\${mod.id}\`}
      onClick={() => onSelect(mod.id, layoutId || \`module-\${mod.id}\`)}
      onMouseEnter={() => {
        setHov(true);
        hoverTimeout.current = setTimeout(() => {
          setShowQuickView(true);
        }, 500);
      }}
      onMouseLeave={() => {
        setHov(false);
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      }}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        opacity: { duration: 0.3 }
      }}
      className={cn(
        "w-full h-full flex flex-col font-sans cursor-pointer transition-all duration-300",
        "bg-white relative overflow-hidden rounded-[1.5rem] ring-1 ring-gray-900/5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]",
        hov ? "shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)] -translate-y-1.5 scale-[1.02]" : ""
      )}
      style={{`;

const newMotionDiv = `    <motion.div
      layoutId={layoutId || \`module-\${mod.id}\`}
      onClick={() => onSelect(mod.id, layoutId || \`module-\${mod.id}\`)}
      onMouseEnter={() => {
        setHov(true);
        hoverTimeout.current = setTimeout(() => {
          setShowQuickView(true);
        }, 500);
      }}
      onMouseLeave={() => {
        setHov(false);
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
      }}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 25,
        opacity: { duration: 0.3 }
      }}
      className={cn(
        "w-full h-full flex flex-col font-sans cursor-pointer transition-all duration-300",
        "bg-white relative overflow-hidden rounded-[1.5rem] ring-1 ring-gray-900/5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]",
        hov ? "shadow-[0_20px_40px_-10px_rgba(0,0,0,0.15)]" : ""
      )}
      style={{`;

content = content.replace(oldMotionDiv, newMotionDiv);
fs.writeFileSync(file, content);
console.log('patched ToolCard');
