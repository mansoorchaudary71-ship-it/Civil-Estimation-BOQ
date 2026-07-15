import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { TopNavbar } from '../TopNavbar';
import { Users, CheckCircle, XCircle } from 'lucide-react';

export default function JoinProject() {
  const { projectId, shareToken } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'auth_required'>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [projectData, setProjectData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus('auth_required');
        return;
      }

      if (!projectId || !shareToken) {
        setStatus('error');
        setErrorMsg('Invalid join link.');
        return;
      }

      try {
        const pRef = doc(db, 'projects', projectId);
        const snapshot = await getDoc(pRef);
        
        if (!snapshot.exists()) {
          setStatus('error');
          setErrorMsg('Project not found or link is invalid.');
          return;
        }

        const data = snapshot.data();
        setProjectData(data);

        if (!data.shareLinkEnabled || data.shareToken !== shareToken) {
          setStatus('error');
          setErrorMsg('This invite link has been disabled or is invalid.');
          return;
        }

        if (data.memberIds?.includes(user.uid)) {
          setStatus('success'); // already a member
          return;
        }

        // We can join!
        const newRoles = { ...(data.roles || {}), [user.uid]: data.shareRole || 'viewer' };
        const newEmails = { ...(data.memberEmails || {}), [user.uid]: user.email || '' };
        const newMemberIds = [...(data.memberIds || []), user.uid];

        await updateDoc(pRef, {
          memberIds: newMemberIds,
          roles: newRoles,
          memberEmails: newEmails,
          lastUsedShareToken: shareToken,
          updatedAt: Date.now()
        });

        setStatus('success');
      } catch (err: any) {
        try {
          handleFirestoreError(err, OperationType.UPDATE, 'projects');
        } catch (e: any) {
           setStatus('error');
           setErrorMsg(e.message || 'Failed to join project due to permissions.');
        }
      }
    });

    return () => unsubscribe();
  }, [projectId, shareToken]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopNavbar />
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <div className="w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
          
          {status === 'loading' && (
            <div className="py-8 flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <h2 className="text-xl font-semibold text-slate-900">Joining Project...</h2>
              <p className="text-slate-500 mt-2">Please wait while we verify your invite.</p>
            </div>
          )}

          {status === 'auth_required' && (
            <div className="py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-slate-500" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Sign in Required</h2>
              <p className="text-slate-500 mb-6">You need to sign in to join this project.</p>
              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-login-modal"));
                }}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
              >
                Sign In / Sign Up
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="py-8">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Unable to Join</h2>
              <p className="text-slate-500 mb-6">{errorMsg}</p>
              <button 
                onClick={() => navigate('/team')}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                Go to My Projects
              </button>
            </div>
          )}

          {status === 'success' && (
            <div className="py-8">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">You're In!</h2>
              <p className="text-slate-500 mb-6">
                You have successfully joined <strong>{projectData?.name || 'the project'}</strong>.
              </p>
              <button 
                onClick={() => navigate('/team')}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
              >
                View Project
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
