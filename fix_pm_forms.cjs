const fs = require('fs');

let content = fs.readFileSync('src/components/modules/ProjectManager.tsx', 'utf8');

// Replace create project form
content = content.replace(
  /<form onSubmit={handleCreate} className="w-full bg-surface-default backdrop-blur-xl border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-sm transform transition-all overflow-hidden">[\s\S]*?<div className="flex gap-3 mt-6">/m,
  `<form onSubmit={handleCreate} className="w-full bg-surface-default backdrop-blur-xl border border-ui-borderSubtle p-4 sm:p-6 rounded-2xl shadow-sm transform transition-all overflow-hidden">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-txt-primary">
            <Plus className="text-indigo-500" /> Create New Project
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="proj-name" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Project Name <span className="text-rose-500" aria-hidden="true">*</span></label>
              <input id="proj-name" type="text" value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-txt-primary placeholder:text-slate-400" required placeholder="e.g. Al-Hamra Tower" />
            </div>
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="proj-location" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Location <span className="text-rose-500" aria-hidden="true">*</span></label>
              <input id="proj-location" type="text" value={newProject.location} onChange={e => setNewProject({...newProject, location: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-txt-primary placeholder:text-slate-400" required placeholder="City, Area" />
            </div>
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="proj-type" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Type <span className="text-rose-500" aria-hidden="true">*</span></label>
              <select id="proj-type" value={newProject.type} onChange={e => setNewProject({...newProject, type: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-txt-primary">
                <option>Residential</option>
                <option>Commercial</option>
                <option>Infrastructure</option>
                <option>Industrial</option>
              </select>
            </div>
            <div className="space-y-1.5 flex flex-col">
              <label htmlFor="proj-date" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Start Date <span className="text-rose-500" aria-hidden="true">*</span></label>
              <input id="proj-date" type="date" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} required className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-txt-primary" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">`
);


// Replace invite form
content = content.replace(
  /<form onSubmit={handleSendInvite} className="space-y-4">[\s\S]*?<\/form>/m,
  `<form onSubmit={handleSendInvite} className="space-y-4">
                <div className="space-y-1.5 flex flex-col">
                  <label htmlFor="invite-email" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                    Email Address <span className="text-rose-500" aria-hidden="true">*</span>
                  </label>
                  <input
                    type="email"
                    id="invite-email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-ui-borderSubtle dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-medium text-txt-primary placeholder:text-slate-400"
                    disabled={inviteStatus === "sending" || inviteStatus === "success"}
                  />
                </div>
                
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  disabled={inviteStatus === "sending" || inviteStatus === "success"}
                  isLoading={inviteStatus === "sending"}
                  loadingText="Sending Invite..."
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {inviteStatus === "success" ? (
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Invite Sent
                    </span>
                  ) : (
                    'Send Invitation'
                  )}
                </Button>
              </form>`
);

fs.writeFileSync('src/components/modules/ProjectManager.tsx', content);

