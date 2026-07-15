const fs = require('fs');
const file = 'src/context/ProjectContext.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `  useEffect(() => {
    const active = localStorage.getItem('civil_active_project');
    if (active) {
      setActiveProjectId(active);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setActiveProjectId(null);
    }
  }, [user]);

  const getHeaders = () => {
    return {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${user?.token || ''}\`
    }
  };

  const fetchProjects = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/projects', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
        if (activeProjectId && !data.find((p: Project) => p.id === activeProjectId)) {
          setActiveProjectId(null);
        }
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const addProject = async (data: Omit<Project, 'id' | 'estimates' | 'ownerId' | 'memberIds' | 'roles' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const newProject = await res.json();
        setProjects(prev => [...prev, newProject]);
        if (!activeProjectId) setActiveProjectId(newProject.id);
      } else {
        toast.error("Failed to add project");
      }
    } catch (error) {
      toast.error("Error adding project");
    }
  };

  const updateProject = async (id: string, data: Partial<Omit<Project, 'id' | 'estimates' | 'ownerId' | 'createdAt'>>) => {
    if (!user) return;
    try {
      const res = await fetch(\`/api/projects/\${id}\`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        setProjects(prev => prev.map(p => p.id === id ? updated : p));
      } else {
        toast.error("Failed to update project");
      }
    } catch (error) {
      toast.error("Error updating project");
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) return;
    try {
      const res = await fetch(\`/api/projects/\${id}\`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (activeProjectId === id) setActiveProjectId(null);
        toast.success("Project deleted");
      } else {
        toast.error("Failed to delete project");
      }
    } catch (error) {
      toast.error("Error deleting project");
    }
  };

  const saveVersion = async (projectId: string, versionName: string) => {
    toast.success("Version saved! (Demo only)");
  };

  const addEstimateToProject = async (projectId: string, estimate: Omit<ProjectEstimate, 'id' | 'projectId' | 'date' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    try {
      const res = await fetch(\`/api/projects/\${projectId}/estimates\`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(estimate)
      });
      if (res.ok) {
        const newEst = await res.json();
        setProjects(prev => prev.map(p => {
          if (p.id === projectId) {
            return { ...p, estimates: [...p.estimates, newEst] };
          }
          return p;
        }));
        toast.success("Saved to project!");
      } else {
        toast.error("Failed to save estimate");
      }
    } catch (error) {
      toast.error("Error saving estimate to project");
    }
  };

  const deleteEstimate = async (projectId: string, estimateId: string) => {
     if (!user) return;
    try {
      const res = await fetch(\`/api/projects/\${projectId}/estimates/\${estimateId}\`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setProjects(prev => prev.map(p => {
          if (p.id === projectId) {
            return { ...p, estimates: p.estimates.filter(e => e.id !== estimateId) };
          }
          return p;
        }));
        toast.success("Estimate deleted");
      } else {
        toast.error("Failed to delete estimate");
      }
    } catch (error) {
      toast.error("Error deleting estimate");
    }
  };

  const addMember = async (projectId: string, email: string, role: 'editor' | 'viewer') => {
    toast.success("Invited member!");
  };

  const removeMember = async (projectId: string, userId: string) => {
    toast.success("Removed member!");
  };`;

const newCode = `
  useEffect(() => {
    const active = localStorage.getItem('civil_active_project');
    if (active) {
      setActiveProjectId(active);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProjects();
    } else {
      setProjects([]);
      setActiveProjectId(null);
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      const q = query(collection(db, 'projects'), where('memberIds', 'array-contains', user.uid));
      const snapshot = await getDocs(q);
      
      const projs: Project[] = [];
      for (const d of snapshot.docs) {
        const pData = { id: d.id, ...d.data(), estimates: [] } as any;
        // fetch estimates
        const estSnap = await getDocs(collection(db, 'projects', d.id, 'estimates'));
        pData.estimates = estSnap.docs.map(ed => ({ id: ed.id, ...ed.data() }));
        projs.push(pData);
      }
      setProjects(projs);
      
      if (activeProjectId && !projs.find(p => p.id === activeProjectId)) {
        setActiveProjectId(null);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const addProject = async (data: Omit<Project, 'id' | 'estimates' | 'ownerId' | 'memberIds' | 'roles' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      
      const newId = crypto.randomUUID();
      const now = Date.now();
      const newProject = {
        ...data,
        ownerId: user.uid,
        memberIds: [user.uid],
        roles: { [user.uid]: 'owner' },
        memberEmails: { [user.uid]: user.email || '' },
        createdAt: now,
        updatedAt: now,
        shareLinkEnabled: false,
        shareToken: '',
        shareRole: 'viewer',
        lastUsedShareToken: ''
      };
      
      await setDoc(doc(db, 'projects', newId), newProject);
      const fullProj = { id: newId, ...newProject, estimates: [] } as unknown as Project;
      setProjects(prev => [...prev, fullProj]);
      if (!activeProjectId) setActiveProjectId(newId);
    } catch (error) {
      toast.error("Error adding project");
      console.error(error);
    }
  };

  const updateProject = async (id: string, data: Partial<Omit<Project, 'id' | 'estimates' | 'ownerId' | 'createdAt'>>) => {
    if (!user) return;
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      const updates = { ...data, updatedAt: Date.now() };
      await updateDoc(doc(db, 'projects', id), updates);
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } as any : p));
    } catch (error) {
      toast.error("Error updating project");
      console.error(error);
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) return;
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      await deleteDoc(doc(db, 'projects', id));
      setProjects(prev => prev.filter(p => p.id !== id));
      if (activeProjectId === id) setActiveProjectId(null);
      toast.success("Project deleted");
    } catch (error) {
      toast.error("Error deleting project");
      console.error(error);
    }
  };

  const saveVersion = async (projectId: string, versionName: string) => {
    toast.success("Version saved! (Demo only)");
  };

  const addEstimateToProject = async (projectId: string, estimate: Omit<ProjectEstimate, 'id' | 'projectId' | 'date' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      const newId = crypto.randomUUID();
      const now = Date.now();
      const newEst = {
        ...estimate,
        projectId,
        createdAt: now,
        updatedAt: now,
        date: new Date().toISOString()
      };
      await setDoc(doc(db, 'projects', projectId, 'estimates', newId), newEst);
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return { ...p, estimates: [...p.estimates, { id: newId, ...newEst } as any] };
        }
        return p;
      }));
      toast.success("Saved to project!");
    } catch (error) {
      toast.error("Error saving estimate to project");
      console.error(error);
    }
  };

  const deleteEstimate = async (projectId: string, estimateId: string) => {
     if (!user) return;
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      await deleteDoc(doc(db, 'projects', projectId, 'estimates', estimateId));
      setProjects(prev => prev.map(p => {
        if (p.id === projectId) {
          return { ...p, estimates: p.estimates.filter(e => e.id !== estimateId) };
        }
        return p;
      }));
      toast.success("Estimate deleted");
    } catch (error) {
      toast.error("Error deleting estimate");
      console.error(error);
    }
  };

  const addMember = async (projectId: string, email: string, role: 'editor' | 'viewer') => {
    toast.success("Invited member!"); // Using share link instead for now
  };

  const removeMember = async (projectId: string, userId: string) => {
    // handled in TeamCollaboration component
  };
`;

let contentArr = content.split('  const getHeaders = () => {');
if (contentArr.length !== 2) {
  // Let's just find the block and replace using regex
}
content = content.replace(/  useEffect\(\(\) => \{\n    const active = localStorage\.getItem\('civil_active_project'\);[\s\S]*?const removeMember = async \(projectId: string, userId: string\) => \{\n    toast\.success\("Removed member!"\);\n  \};/, newCode);

fs.writeFileSync(file, content);
console.log("Patched ProjectContext to use Firestore");
