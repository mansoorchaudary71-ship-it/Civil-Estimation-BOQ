const fs = require('fs');

let content = fs.readFileSync('src/components/ExcelPromo.tsx', 'utf8');

// Replace form with improved one
content = content.replace(
  /<form onSubmit={handleSubmit} className="space-y-4">[\s\S]*?<\/form>/,
  `<form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 flex flex-col">
                <label htmlFor="excel-name" className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Name <span className="text-rose-500" aria-hidden="true">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input id="excel-name" 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-txt-primary placeholder:text-slate-400"
                  />
                </div>
              </div>
              <div className="space-y-1.5 flex flex-col">
                <label htmlFor="excel-email" className="text-sm font-bold text-slate-700 dark:text-slate-300">Work Email Address <span className="text-rose-500" aria-hidden="true">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <input id="excel-email" 
                    type="email" 
                    required 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="john@company.com"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-txt-primary placeholder:text-slate-400"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                variant="premium"
                size="lg"
                fullWidth
                isLoading={status === 'loading'}
                loadingText="Sending Templates..."
                className="mt-2 text-base shadow-[0_4px_14px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.3)] bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white"
              >
                Send Me Free Templates
              </Button>
              <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3 font-medium">
                No spam. 100% free forever. Unsubscribe anytime.
              </p>
            </form>`
);

fs.writeFileSync('src/components/ExcelPromo.tsx', content);

