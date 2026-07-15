const fs = require('fs');
let content = fs.readFileSync('src/components/ToolCard.tsx', 'utf8');

const knockoutIconComponent = `
function KnockoutBadge({ icon: Icon, uniqueId, className }: { icon: any, uniqueId: string, className?: string }) {
  const maskId = \`knockout-mask-\${uniqueId}\`;
  return (
    <div className={cn("relative w-12 h-12", className)}>
      <svg width="48" height="48" viewBox="0 0 48 48" className="w-full h-full">
        <defs>
          <mask id={maskId}>
            <rect width="48" height="48" fill="white" rx="14" />
            <svg x="12" y="12" width="24" height="24" viewBox="0 0 24 24">
              <Icon size={24} color="black" strokeWidth={2.5} />
            </svg>
          </mask>
        </defs>
        <rect width="48" height="48" fill="currentColor" mask={\`url(#\${maskId})\`} rx="14" />
      </svg>
    </div>
  );
}
`;

content = content.replace('function Dots({', knockoutIconComponent + '\nfunction Dots({');

// Replace the existing icon with KnockoutBadge
const oldIconContainer = `          <motion.div
              animate={{ scale: hov ? 1.1 : 1, rotate: hov ? [0, -5, 5, 0] : 0 }}
             transition={{ duration: 0.4, ease: "easeOut" }}
             className="text-slate-800"
          >
            <IconComponent size={32} strokeWidth={1.5} />
          </motion.div>`;

const newIconContainer = `          <motion.div
              animate={{ scale: hov ? 1.1 : 1, rotate: hov ? [0, -5, 5, 0] : 0 }}
             transition={{ duration: 0.4, ease: "easeOut" }}
             className="text-slate-900/5 shadow-sm"
          >
            <KnockoutBadge icon={IconComponent} uniqueId={mod.id} className="text-slate-900" />
          </motion.div>`;

content = content.replace(oldIconContainer, newIconContainer);

fs.writeFileSync('src/components/ToolCard.tsx', content);
