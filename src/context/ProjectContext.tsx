import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export interface ProjectEstimate {
  id: string;
  projectId: string;
  toolId: string;
  name: string;
  cost: number;
  materials: Record<string, { quantity: number; unit: string }>;
  date: string;
  category: string;
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  type: string;
  startDate: string;
  budget?: number;
  ownerId: string;
  memberIds: string[];
  roles: Record<string, 'owner' | 'editor' | 'viewer'>;
  memberEmails?: Record<string, string>;
  estimates: ProjectEstimate[];
  createdAt: number;
  updatedAt: number;
}

interface ProjectContextType {
  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  addProject: (project: Omit<Project, 'id' | 'estimates' | 'ownerId' | 'memberIds' | 'roles' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, data: Partial<Omit<Project, 'id' | 'estimates' | 'ownerId' | 'createdAt'>>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  saveVersion: (projectId: string, versionName: string) => Promise<void>;
  addEstimateToProject: (projectId: string, estimate: Omit<ProjectEstimate, 'id' | 'projectId' | 'date' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteEstimate: (projectId: string, estimateId: string) => Promise<void>;
  addMember: (projectId: string, email: string, role: 'editor' | 'viewer') => Promise<void>;
  removeMember: (projectId: string, userId: string) => Promise<void>;
  canEditProject: (projectId: string) => boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const active = localStorage.getItem('civil_active_project');
    if (active) {
      setActiveProjectId(active);
    }
  }, []);

  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem('civil_active_project', activeProjectId);
    } else {
      localStorage.removeItem('civil_active_project');
    }
  }, [activeProjectId]);

  const fetchProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      return;
    }
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      const res = await fetch('/api/projects', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Error fetching projects", err);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  });

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
    try {
      const res = await fetch(`/api/projects/${id}`, {
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
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
        if (activeProjectId === id) setActiveProjectId(null);
      } else {
        toast.error("Failed to delete project");
      }
    } catch (error) {
      toast.error("Error deleting project");
    }
  };

  const saveVersion = async (projectId: string, versionName: string) => {
    if (!user) return;
    const projectToClone = projects.find(p => p.id === projectId);
    if (!projectToClone) return;

    try {
      const { name, ...rest } = projectToClone;
      
      const newProjData = {
        name: versionName,
        location: rest.location,
        type: rest.type,
        startDate: rest.startDate,
        budget: rest.budget
      };
      
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newProjData)
      });
      
      if (res.ok) {
        const newProject = await res.json();
        
        for (const est of projectToClone.estimates) {
          const { id, projectId: pId, createdAt, updatedAt, date, ...estRest } = est;
          await fetch(`/api/projects/${newProject.id}/estimates`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(estRest)
          });
        }
        await fetchProjects();
      }
    } catch (error) {
      toast.error("Error saving version");
    }
  };

  const addEstimateToProject = async (projectId: string, estimate: Omit<ProjectEstimate, 'id' | 'projectId' | 'date' | 'createdAt' | 'updatedAt'>) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/estimates`, {
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
      }
    } catch (error) {
      toast.error("Error adding estimate");
    }
  };

  const deleteEstimate = async (projectId: string, estimateId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/estimates/${estimateId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (res.ok) {
        setProjects(prev => prev.map(p => {
          if (p.id === projectId) {
            return { ...p, estimates: p.estimates.filter(e => e.id !== estimateId) };
          }
          return p;
        }));
      }
    } catch (error) {
      toast.error("Error deleting estimate");
    }
  };

  const addMember = async (projectId: string, email: string, role: 'editor' | 'viewer') => {
    // Basic implementation since we're using mock in-memory for users
    toast.error("Not implemented with JWT mock users");
  };

  const removeMember = async (projectId: string, userId: string) => {
    toast.error("Not implemented with JWT mock users");
  };

  const canEditProject = (projectId: string) => {
    if (!user) return false;
    const project = projects.find(p => p.id === projectId);
    if (!project) return false;
    const role = project.roles[user.uid];
    return role === 'owner' || role === 'editor';
  };

  return (
    <ProjectContext.Provider value={{
      projects, activeProjectId, setActiveProjectId,
      addProject, updateProject, deleteProject, saveVersion,
      addEstimateToProject, deleteEstimate, addMember, removeMember,
      canEditProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProjects must be used within ProjectProvider');
  return context;
}
