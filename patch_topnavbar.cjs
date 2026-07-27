const fs = require('fs');
const file = 'src/components/TopNavbar.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add import
if (!code.includes('import { Button }')) {
  code = code.replace('import { motion, AnimatePresence } from "framer-motion";', 'import { motion, AnimatePresence } from "framer-motion";\nimport { Button } from "./ui/Button";');
}

// Replace login button
code = code.replace(/<button[\s\S]*?onClick=\{\(\) => onOpenAuth \? onOpenAuth\(\) : window.dispatchEvent\(new CustomEvent\("open-login-modal"\)\)\}[\s\S]*?>[\s\n]*?Log in[\s\n]*?<\/button>/, '<Button variant="ghost" size="sm" onClick={() => onOpenAuth ? onOpenAuth() : window.dispatchEvent(new CustomEvent("open-login-modal"))}>Log in</Button>');

// Replace Sign up button
code = code.replace(/<button[\s\S]*?onClick=\{\(\) => onOpenAuth \? onOpenAuth\(\) : window.dispatchEvent\(new CustomEvent\("open-login-modal"\)\)\}[\s\S]*?>[\s\n]*?Sign up[\s\n]*?<\/button>/, '<Button variant="premium" size="sm" onClick={() => onOpenAuth ? onOpenAuth() : window.dispatchEvent(new CustomEvent("open-login-modal"))} rightIcon={<ArrowRight className="w-4 h-4" />}>Sign up</Button>');

// Mobile versions
code = code.replace(/<button[\s\S]*?onClick=\{\(\) => \{[\s\S]*?onOpenAuth\(\);[\s\S]*?\}\}[\s\S]*?className="w-full py-4[\s\S]*?>[\s\n]*?Log in[\s\n]*?<\/button>/, '<Button variant="outline" fullWidth size="lg" onClick={() => { setIsMobileMenuOpen(false); if (onOpenAuth) onOpenAuth(); else window.dispatchEvent(new CustomEvent("open-login-modal")); }}>Log in</Button>');

code = code.replace(/<button[\s\S]*?onClick=\{\(\) => \{[\s\S]*?onOpenAuth\(\);[\s\S]*?\}\}[\s\S]*?className="w-full py-4 bg-slate-900[\s\S]*?>[\s\n]*?Sign up[\s\n]*?<\/button>/, '<Button variant="premium" fullWidth size="lg" rightIcon={<ArrowRight className="w-4 h-4" />} onClick={() => { setIsMobileMenuOpen(false); if (onOpenAuth) onOpenAuth(); else window.dispatchEvent(new CustomEvent("open-login-modal")); }}>Sign up</Button>');

fs.writeFileSync(file, code);
