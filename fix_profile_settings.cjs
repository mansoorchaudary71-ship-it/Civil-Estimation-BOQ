const fs = require('fs');

let content = fs.readFileSync('src/components/auth/ProfileSettings.tsx', 'utf8');

// Replace form
content = content.replace(
  /<form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">[\s\S]*?<\/form>/,
  `<form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-sm flex items-center justify-center group">
                {photoURL ? (
                  <img src={photoURL} alt="User Profile Details Settings Photo" title="Profile Avatar" loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
                <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5 flex flex-col">
                <label htmlFor="profile-name" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Display Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-txt-primary placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label htmlFor="profile-photo" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Photo URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Camera className="w-5 h-5 text-slate-400" />
                  </div>
                  <input id="profile-photo"
                    type="url"
                    value={photoURL}
                    onChange={(e) => setPhotoURL(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-txt-primary placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              isLoading={isLoading}
              loadingText="Saving..."
              className="mt-6 shadow-[0_4px_14px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.3)] bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white"
            >
              Save Changes
            </Button>
          </form>`
);

fs.writeFileSync('src/components/auth/ProfileSettings.tsx', content);

