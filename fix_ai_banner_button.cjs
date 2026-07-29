const fs = require('fs');

let content = fs.readFileSync('src/components/AIEstimatorBanner.tsx', 'utf8');

content = content.replace(
  /<Button onClick={onOpenChat} className="relative group\/btn z-10 w-full sm:w-auto mb-10 bg-gradient-to-tr from-\[#0a0f25\] via-slate-800 to-\[#0a0f25\] dark:from-indigo-600 dark:via-blue-600 dark:to-indigo-600 text-white font-bold py-4 px-12 rounded-full text-\[15px\] sm:text-base whitespace-nowrap hover:shadow-\[0_12px_30px_-6px_rgba\(10,15,37,0\.4\)\] dark:hover:shadow-\[0_12px_30px_-6px_rgba\(37,99,235,0\.4\)\] transition-all duration-500 active:scale-95 overflow-hidden hover:-translate-y-0\.5">[\s\S]*?<\/span>\s*<\/Button>/m,
  `<Button
        onClick={onOpenChat}
        variant="premium"
        size="lg"
        className="mb-10 w-full sm:w-auto px-12 z-10 group"
      >
        Start Chatting Now
        <svg className="w-5 h-5 ml-1 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </Button>`
);

fs.writeFileSync('src/components/AIEstimatorBanner.tsx', content);

