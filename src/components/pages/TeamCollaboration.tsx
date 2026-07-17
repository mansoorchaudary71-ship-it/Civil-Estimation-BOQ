import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'framer-motion';
import { Users, Link as LinkIcon, Share2, Copy, Check, Shield, Trash2, Crown } from 'lucide-react';
import TopNavbar from '../TopNavbar';

export default function TeamCollaboration() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchProjects(currentUser.uid);
      } else {
        setProjects([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchProjects = async (uid: string) => {
    try {
      const q = query(collection(db, 'projects'), where('memberIds', 'array-contains', uid));
      const snapshot = await getDocs(q);
      const projData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projData);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.LIST, 'projects');
      } catch (e) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnableSharing = async (projectId: string) => {
    try {
      const token = crypto.randomUUID();
      await updateDoc(doc(db, 'projects', projectId), {
        shareLinkEnabled: true,
        shareToken: token,
        shareRole: 'viewer',
        updatedAt: Date.now()
      });
      // Refresh
      fetchProjects(user.uid);
      setSelectedProject((prev: any) => ({ ...prev, shareLinkEnabled: true, shareToken: token, shareRole: 'viewer' }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'projects');
    }
  };

  const handleDisableSharing = async (projectId: string) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        shareLinkEnabled: false,
        shareToken: '',
        updatedAt: Date.now()
      });
      fetchProjects(user.uid);
      setSelectedProject((prev: any) => ({ ...prev, shareLinkEnabled: false, shareToken: '' }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'projects');
    }
  };

  const handleChangeRole = async (projectId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        shareRole: newRole,
        updatedAt: Date.now()
      });
      fetchProjects(user.uid);
      setSelectedProject((prev: any) => ({ ...prev, shareRole: newRole }));
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'projects');
    }
  };

  const copyLink = (projectId: string, token: string) => {
    const url = `${window.location.origin}/#/join/${projectId}/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Team Collaboration</h1>
            <p className="text-slate-500 mt-1">Share your projects and collaborate with team members.</p>
          </div>
        </div>

        {!user ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500 mb-4">Please sign in to view and share your projects.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Project List */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Projects</h2>
              {projects.length === 0 ? (
                <div className="p-6 bg-white rounded-xl border border-slate-200 text-center">
                  <p className="text-slate-500 text-sm">No projects found. Create a project to start collaborating.</p>
                </div>
              ) : (
                projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProject(p)}
                    className={`w-full text-left p-5 rounded-xl border transition-all ${selectedProject?.id === p.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-900 truncate pr-2">{p.name || 'Untitled Project'}</h3>
                      {p.ownerId === user.uid ? (
                        <Crown className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : (
                        <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {p.memberIds?.length || 1} members
                    </p>
                  </button>
                ))
              )}
            </div>

            {/* Selected Project Details */}
            <div className="lg:col-span-2">
              {selectedProject ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 md:p-8 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedProject.name}</h2>
                    <p className="text-sm text-slate-500">Manage sharing and collaboration settings for this project.</p>
                  </div>
                  
                  <div className="p-6 md:p-8 space-y-8">
                    {/* Share Link Section */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                        <LinkIcon className="w-5 h-5 text-indigo-500" /> Share via Link
                      </h3>
                      
                      {selectedProject.ownerId !== user.uid ? (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="text-sm text-slate-600">Only the project owner can manage sharing links.</p>
                        </div>
                      ) : !selectedProject.shareLinkEnabled ? (
                        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center">
                          <Share2 className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                          <p className="text-sm text-slate-600 mb-4">Anyone with the link can join this project.</p>
                          <button
                            onClick={() => handleEnableSharing(selectedProject.id)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                          >
                            Generate Share Link
                          </button>
                        </div>
                      ) : (
                        <div className="p-6 bg-indigo-50/50 rounded-xl border border-indigo-100">
                          <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="flex-1">
                              <label className="block text-xs font-medium text-slate-500 mb-1">Share Link</label>
                              <div className="flex items-center">
                                <input 
                                  readOnly
                                  value={`${window.location.origin}/#/join/${selectedProject.id}/${selectedProject.shareToken}`}
                                  className="w-full bg-white border border-slate-200 text-slate-600 text-sm px-3 py-2.5 rounded-l-lg outline-none"
                                />
                                <button 
                                  onClick={() => copyLink(selectedProject.id, selectedProject.shareToken)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-r-lg transition-colors flex items-center gap-2 border border-indigo-600"
                                >
                                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                  {copied ? 'Copied' : 'Copy'}
                                </button>
                              </div>
                            </div>
                            <div className="w-full md:w-48">
                              <label className="block text-xs font-medium text-slate-500 mb-1">Default Role</label>
                              <select 
                                value={selectedProject.shareRole || 'viewer'}
                                onChange={(e) => handleChangeRole(selectedProject.id, e.target.value)}
                                className="w-full bg-white border border-slate-200 text-slate-900 text-sm px-3 py-2.5 rounded-lg outline-none focus:border-indigo-500"
                              >
                                <option value="viewer">Viewer</option>
                                <option value="editor">Editor</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleDisableSharing(selectedProject.id)}
                              className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                              Disable Link Sharing
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Members List */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                        <Users className="w-5 h-5 text-indigo-500" /> Project Members
                      </h3>
                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        {selectedProject.memberIds?.map((memberId: string) => (
                          <div key={memberId} className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium shrink-0">
                                {selectedProject.memberEmails?.[memberId]?.[0]?.toUpperCase() || 'U'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 truncate">
                                  {selectedProject.memberEmails?.[memberId] || 'Unknown User'}
                                  {memberId === user.uid && <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">You</span>}
                                </p>
                                <p className="text-xs text-slate-500 capitalize">{selectedProject.roles?.[memberId] || 'Viewer'}</p>
                              </div>
                            </div>
                            {selectedProject.ownerId === user.uid && memberId !== user.uid && (
                              <button 
                                onClick={async () => {
                                  if (confirm('Remove this member?')) {
                                    const newMemberIds = selectedProject.memberIds.filter((id: string) => id !== memberId);
                                    const newRoles = { ...selectedProject.roles };
                                    delete newRoles[memberId];
                                    const newEmails = { ...selectedProject.memberEmails };
                                    delete newEmails[memberId];
                                    try {
                                      await updateDoc(doc(db, 'projects', selectedProject.id), {
                                        memberIds: newMemberIds,
                                        roles: newRoles,
                                        memberEmails: newEmails,
                                        updatedAt: Date.now()
                                      });
                                      fetchProjects(user.uid);
                                      setSelectedProject((prev: any) => ({ ...prev, memberIds: newMemberIds, roles: newRoles, memberEmails: newEmails }));
                                    } catch (err) {
                                      handleFirestoreError(err, OperationType.UPDATE, 'projects');
                                    }
                                  }
                                }}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 border-dashed py-20">
                  <div className="text-center">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Select a project to view collaboration settings.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
