import { collection, addDoc, getDocs, query, where, documentId, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

import { db, handleFirestoreError, OperationType } from './firebase';

function getUserId() {
  const token = localStorage.getItem('auth_token');
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (e) {
      return null;
    }
  }
  return null;
}


export async function saveEstimate(name: string, payload: any, type: string = 'material_calculation') {
  if (!getUserId()) throw new Error("User not authenticated");
  try {
    const estimatesRef = collection(db, 'estimates');
    await addDoc(estimatesRef, {
      userId: getUserId(),
      name,
      type,
      payload,
      createdAt: Date.now(),
      status: 'To Do'
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, 'estimates');
  }
}

export async function updateEstimateStatus(id: string, status: string) {
  if (!getUserId()) throw new Error("User not authenticated");
  try {
    const docRef = doc(db, 'estimates', id);
    await updateDoc(docRef, { status });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'estimates');
  }
}

export async function updateEstimateOrders(orders: { id: string, order: number }[]) {
  if (!getUserId()) throw new Error("User not authenticated");
  try {
    const promises = orders.map(({ id, order }) => {
      const docRef = doc(db, 'estimates', id);
      return updateDoc(docRef, { order });
    });
    await Promise.all(promises);
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, 'estimates');
  }
}

export async function getToolEstimates(calculatorId: string, limitCount = 50) {
  try {
    const estimates = await getMyEstimates();
    if (!estimates) return [];
    
    // Filter by tool and sort by date descending
    const filtered = estimates
      .filter((e: any) => e.payload?.calculatorId === calculatorId)
      .sort((a: any, b: any) => b.createdAt - a.createdAt)
      .slice(0, limitCount);
      
    return filtered;
  } catch (err) {
    return [];
  }
}

export async function getMyEstimates() {
  if (!getUserId()) return [];
  try {
    const q = query(collection(db, 'estimates'), where('userId', '==', getUserId()));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'estimates');
  }
}
