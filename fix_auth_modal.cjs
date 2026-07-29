const fs = require('fs');

let content = fs.readFileSync('src/components/auth/AuthModal.tsx', 'utf8');

// Replace form
content = content.replace(
  /<form onSubmit={handleSubmit} className="space-y-4">[\s\S]*?<\/form>/,
  `<form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5 flex flex-col">
                  <label htmlFor="auth-name" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name <span className="text-rose-500" aria-hidden="true">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <input id="auth-name"
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setError('');
                      }}
                      required
                      className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-txt-primary placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5 flex flex-col">
                <label htmlFor="auth-email" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Work Email Address <span className="text-rose-500" aria-hidden="true">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <AtSign className="w-5 h-5 text-slate-400" />
                  </div>
                  <input id="auth-email"
                    type="email"
                    placeholder="john@company.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-txt-primary placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label htmlFor="auth-password" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password <span className="text-rose-500" aria-hidden="true">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input id="auth-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    required
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-txt-primary placeholder:text-slate-400"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                isLoading={isLoading}
                loadingText={isLogin ? 'Signing In...' : 'Creating Account...'}
                className="mt-2 text-base shadow-[0_4px_14px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.3)] bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>`
);

fs.writeFileSync('src/components/auth/AuthModal.tsx', content);

