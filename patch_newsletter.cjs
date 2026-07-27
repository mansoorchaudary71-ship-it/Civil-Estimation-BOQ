const fs = require('fs');
const file = 'src/components/NewsletterSignupCard.tsx';
let code = fs.readFileSync(file, 'utf8');

// Add import
if (!code.includes('import { Button }')) {
  code = code.replace("import { motion, AnimatePresence } from 'framer-motion';", "import { motion, AnimatePresence } from 'framer-motion';\nimport { Button } from './ui/Button';");
}

// Replace Subscribe another email button
code = code.replace(/<button[\s\S]*?onClick=\{\(\) => setIsSuccess\(false\)\}[\s\S]*?>[\s\S]*?Subscribe another email[\s\S]*?<\/button>/, '<Button variant="ghost" size="sm" onClick={() => setIsSuccess(false)}>Subscribe another email</Button>');

// Replace submit button
code = code.replace(/<button\s*type="submit"[\s\S]*?disabled=\{isSubscribing\}[\s\S]*?>[\s\S]*?\{isSubscribing \? \([\s\S]*?\) : \([\s\S]*?\)\}[\s\S]*?<\/button>/, 
`<Button
  type="submit"
  variant="premium"
  size="lg"
  fullWidth
  isLoading={isSubscribing}
  loadingText="Subscribing..."
  rightIcon={<ArrowRight className="w-4 h-4" />}
  className="mt-2"
>
  Subscribe Now
</Button>`);

fs.writeFileSync(file, code);
