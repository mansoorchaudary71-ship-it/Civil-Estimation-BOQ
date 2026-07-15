import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

interface Comment {
  id: string;
  toolId: string;
  userName: string;
  text: string;
  timestamp: any;
  status: string;
}

export default function DiscussionWidget({ moduleId, toolName }: { moduleId: string; toolName: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useAuth(); // or auth.currentUser? Both should work.

  useEffect(() => {
    // Only fetch approved comments for this specific tool
    const q = query(
      collection(db, 'comments'),
      where('toolId', '==', moduleId),
      where('status', '==', 'approved'),
      orderBy('timestamp', 'asc') // Firestore requires a composite index if combining where + orderBy. We'll handle this. Actually, if we just orderBy 'timestamp', we might need an index. Wait! If index missing, we can sort locally. Let's just where('toolId', '==', moduleId) and sort locally to avoid index errors!
    );
    
    // Safer local sort querying
    const simpleQ = query(
      collection(db, 'comments'),
      where('toolId', '==', moduleId),
      where('status', '==', 'approved')
    );

    const unsubscribe = onSnapshot(simpleQ, (snapshot) => {
      const fetchedComments = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Comment[];
      
      // Sort locally to prevent requiring composite indexes for dynamically added features
      fetchedComments.sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp.toMillis() : (a.timestamp || 0);
        const timeB = b.timestamp?.toMillis ? b.timestamp.toMillis() : (b.timestamp || 0);
        return timeA - timeB;
      });

      setComments(fetchedComments);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'comments');
    });

    return () => unsubscribe();
  }, [moduleId]);

  const handlePost = async () => {
    if (!newComment.trim()) return;

    if (!user) {
      alert("Please sign in to post a comment.");
      return;
    }

    setIsPosting(true);
    setSuccessMessage('');

    try {
      const commentId = uuidv4();
      const commentData = {
        toolId: moduleId,
        userName: user.displayName || 'Engineer',
        text: newComment.trim(),
        timestamp: serverTimestamp(),
        status: 'approved', // Auto-approving for demo purposes
        userId: user.uid // Include to match our rule schema allowing it
      };

      await setDoc(doc(db, 'comments', commentId), commentData);
      
      setNewComment('');
      setSuccessMessage('Comment posted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'comments');
      alert("Failed to post comment.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="mt-8 p-4 sm:p-6 rounded-[2rem] bg-white border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl md:text-xl font-semibold text-slate-800 tracking-tight mb-6">Discussion & Comments</h2>
        <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          {comments.length} engineers found this helpful
        </span>
      </div>
      
      <div className="flex flex-col gap-4">
        {comments.map(comment => (
          <div key={comment.id} className="flex items-start gap-4 flex-wrap">
            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0 font-bold text-slate-500">
              {comment.userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="bg-slate-50 p-4 rounded-[24px] rounded-tl-none border border-slate-100 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-lg font-medium text-slate-800 mb-4">{comment.userName}</h4>
                  <span className="text-sm text-slate-500">
                    {comment.timestamp && comment.timestamp.toDate 
                      ? comment.timestamp.toDate().toLocaleDateString()
                      : 'Just now'}
                  </span>
                </div>
                <p className="whitespace-pre-wrap text-base font-normal text-slate-600 leading-relaxed">{comment.text}</p>
              </div>
            </div>
          </div>
        ))}
        
        {comments.length === 0 && (
          <p className="italic mb-4 text-base font-normal text-slate-600 leading-relaxed">No comments yet. Be the first to share your thoughts on the {toolName}!</p>
        )}
        
        <div className="mt-4 flex items-start gap-4 flex-wrap">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 font-bold text-indigo-600">
             {user ? user.displayName?.charAt(0).toUpperCase() || 'U' : 'You'}
          </div>
          <div className="flex-1 relative">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={user ? "Add a comment or ask a question..." : "Sign in to post a comment..."}
              disabled={isPosting}
              className="w-full bg-slate-50 border border-slate-200 rounded-[24px] p-4 pb-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:outline-none focus:ring-indigo-500 resize-none disabled:opacity-60 overflow-hidden"
              rows={3}
            />
            {successMessage && <div className="absolute bottom-3 left-3 text-sm text-emerald-600 font-medium">{successMessage}</div>}
            <button onClick={handlePost}
              disabled={isPosting || !newComment.trim()}
              className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white px-4 py-1.5 rounded-full transition-colors text-base font-semibold active:scale-95 hover:-translate-y-0.5 hover:shadow-lg shadow-sm"
            >
              {isPosting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
