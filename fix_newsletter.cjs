const fs = require('fs');

let content = fs.readFileSync('src/components/NewsletterSignupCard.tsx', 'utf8');

// Value Proposition update
content = content.replace(
  /<h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-txt-primary dark:text-white mb-4 leading-tight">\s*Smarter estimation, <br className="hidden lg:block" \/>\s*<span className="text-transparent bg-clip-text bg-gradient-to-r from-\[#fa5c5c\] to-\[#f58145\]">delivered weekly\.<\/span>\s*<\/h2>/,
  `<h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-txt-primary dark:text-white mb-4 leading-tight">
            Stop Guessing Costs. <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Start Winning Bids.</span>
          </h2>`
);

content = content.replace(
  /<p className="text-txt-tertiary dark:text-slate-400 text-base md:text-lg leading-relaxed mb-8 max-w-lg mx-auto md:mx-0 font-medium">\s*Get exclusive access to pre-built BOQ templates, live material rate updates, and expert strategies to win more bids\.\s*<\/p>/,
  `<p className="text-txt-secondary dark:text-slate-300 text-base md:text-lg leading-relaxed mb-8 max-w-lg mx-auto md:mx-0 font-medium">
            Join 15,000+ contractors getting free weekly insights on live material rates, professional takeoff strategies, and plug-and-play BOQ templates.
          </p>`
);

content = content.replace(
  /<label htmlFor="newsletter-email" className="text-sm font-bold text-txt-secondary dark:text-slate-300 ml-1">Email address<\/label>/,
  `<label htmlFor="newsletter-email" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Work Email Address <span className="text-rose-500" aria-hidden="true">*</span></label>`
);

// We can improve the CTA copy
content = content.replace(
  /Subscribe Now/,
  `Get Free Weekly Insights`
);

// Form success animation is already present but let's make sure it's good
content = content.replace(
  /<h4 className="text-xl font-bold text-txt-primary dark:text-white mb-2">You're on the list!<\/h4>/,
  `<h4 className="text-2xl font-bold text-txt-primary dark:text-white mb-2">You're on the list!</h4>`
);

content = content.replace(
  /<p className="text-txt-tertiary dark:text-slate-400 text-sm mb-6">\s*Check your inbox for confirmation and your first exclusive resource\.\s*<\/p>/,
  `<p className="text-slate-500 dark:text-slate-400 text-base font-medium mb-6">
                    Check your inbox for confirmation and your first exclusive resource.
                  </p>`
);

fs.writeFileSync('src/components/NewsletterSignupCard.tsx', content);

