const fs = require('fs');

let content = fs.readFileSync('src/components/pages/Contact.tsx', 'utf8');

// Replace the form fields
content = content.replace(
  /<div className="grid md:grid-cols-2 gap-6">[\s\S]*?<\/div>\s*<Button/m,
  `<div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2 flex flex-col">
                <label htmlFor="contact-first-name" className="text-sm font-bold text-slate-700 dark:text-slate-300">First Name <span className="text-rose-500" aria-hidden="true">*</span></label>
                <input id="contact-first-name" 
                  type="text" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={status === 'loading'}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium disabled:opacity-50 overflow-hidden text-txt-primary" 
                  placeholder="e.g. Jane" 
                />
              </div>
              <div className="space-y-2 flex flex-col">
                <label htmlFor="contact-last-name" className="text-sm font-bold text-slate-700 dark:text-slate-300">Last Name <span className="text-rose-500" aria-hidden="true">*</span></label>
                <input id="contact-last-name" 
                  type="text" 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={status === 'loading'}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium disabled:opacity-50 overflow-hidden text-txt-primary" 
                  placeholder="e.g. Smith" 
                />
              </div>
            </div>
            
            <div className="space-y-2 flex flex-col">
              <label htmlFor="contact-email" className="text-sm font-bold text-slate-700 dark:text-slate-300">Work Email Address <span className="text-rose-500" aria-hidden="true">*</span></label>
              <input id="contact-email" 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={status === 'loading'}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium disabled:opacity-50 overflow-hidden text-txt-primary" 
                placeholder="jane@company.com" 
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <label htmlFor="contact-message" className="text-sm font-bold text-slate-700 dark:text-slate-300">How can we help? <span className="text-rose-500" aria-hidden="true">*</span></label>
              <textarea id="contact-message"
                name="message"
                rows={5} 
                value={formData.message}
                onChange={handleInputChange}
                disabled={status === 'loading'}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium resize-none disabled:opacity-50 overflow-hidden text-txt-primary" 
                placeholder="Tell us about your project, team size, or specific features you need..." 
              />
            </div>
            <div className="flex items-start gap-2 mt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Your data is secure and will only be used to respond to your inquiry. Read our <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a>.
              </p>
            </div>
            <Button`
);

fs.writeFileSync('src/components/pages/Contact.tsx', content);
