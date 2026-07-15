const fs = require('fs');
const content = fs.readFileSync('src/components/ToolCard.tsx', 'utf8');

// Replace the <motion.div> wrapper structure for the ToolCard
// We will separate the card content and the wrapper, so the card gets masked,
// and the shadow is applied to the wrapper.
// But motion.div itself handles hover events and animations.

let newContent = content;

// Replace the main motion.div wrapper opening:
const oldMotionDiv = `    <motion.div
      onClick={() => onSelect(mod.id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
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
        "relative w-full flex flex-col font-sans overflow-hidden cursor-pointer",
        "rounded-[32px]",
        "border border-gray-100",
        "transition-all duration-300",
        hov ? "shadow-[0_24px_50px_-12px_rgba(0,0,0,0.35)] -translate-y-1" : "shadow-[0_8px_24px_-4px_rgba(0,0,0,0.15)]"
      )}
      style={{ 
         background: \`radial-gradient(circle at 0% 0%, \${colorToUse} 0%, rgba(255,255,255,0) 45%), linear-gradient(135deg, #ffffff 30%, \${colorToUse} 100%)\` 
      }}
    >`;

const newMotionDiv = `    <motion.div
      onClick={() => onSelect(mod.id)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
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
        "relative w-full font-sans cursor-pointer",
        "transition-all duration-300",
        hov ? "drop-shadow-[0_24px_30px_rgba(0,0,0,0.15)] -translate-y-1" : "drop-shadow-[0_8px_20px_rgba(0,0,0,0.08)]"
      )}
    >
      <div 
        className="relative w-full h-full flex flex-col rounded-[32px] overflow-hidden"
        style={{ 
           background: \`radial-gradient(circle at 0% 0%, \${colorToUse} 0%, rgba(255,255,255,0) 45%), linear-gradient(135deg, #ffffff 30%, \${colorToUse} 100%)\`,
           maskImage: 'radial-gradient(circle at 0 0, transparent 65px, black 66px)',
           WebkitMaskImage: 'radial-gradient(circle at 0 0, transparent 65px, black 66px)'
        }}
      >`;

newContent = newContent.replace(oldMotionDiv, newMotionDiv);

// We need to add a closing </div> for the new masked container, and position the icon OUTSIDE the masked container but inside the motion.div wrapper.
// So let's replace the icon in the flow, move it to be absolute.

const oldIconCode = `        <div className="flex items-start justify-between">
          <motion.div 
             animate={{ scale: hov ? 1.1 : 1, rotate: hov ? [0, -5, 5, 0] : 0 }}
             transition={{ duration: 0.4, ease: "easeOut" }}
             className="text-slate-800"
          >
            <IconComponent size={32} strokeWidth={1.5} />
          </motion.div>
          <div className="flex items-center gap-3">`;

const newIconCode = `        <div className="flex items-start justify-end min-h-[40px]">
          <div className="flex items-center gap-3">`;

newContent = newContent.replace(oldIconCode, newIconCode);

const oldEnd = `        </div>
      </div>
    </motion.div>
  );`;

const newEnd = `        </div>
      </div>
      
      {/* Absolute floating icon placed precisely in the cutout area */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none">
        <motion.div 
           animate={{ scale: hov ? 1.1 : 1, rotate: hov ? [0, -5, 5, 0] : 0 }}
           transition={{ duration: 0.4, ease: "easeOut" }}
           className="text-slate-800"
        >
          <IconComponent size={32} strokeWidth={1.5} />
        </motion.div>
      </div>
    </motion.div>
  );`;

newContent = newContent.replace(oldEnd, newEnd);

fs.writeFileSync('src/components/ToolCard.tsx', newContent);
