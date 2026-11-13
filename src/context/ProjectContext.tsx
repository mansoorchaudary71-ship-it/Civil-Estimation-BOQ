import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  listProjects, createProject as storeCreate, updateProject as storeUpdate,
  deleteProject as storeDelete, saveVersion as storeSaveVersion,
  exportProjectJson, importProjectJson,
  type StoredProject, type StoredEstimate,
} from '../lib/projectsStore';

/**
 * ProjectContext — LOCAL-FIRST (G9 §14). Projects live in localStorage
 * (cep_projects_v1); there is no Firebase, no auth_token and no /api on this
 * static GitHub Pages site, so an unsigned-in user previously got an empty /
 * error state. Sharing is by exported JSON file, not by emailed invite.
 * src/lib/firebase.ts is untouched — it is simply no longer imported here.
 */
const LOCAL_OWNER = 'local';

const localAdapter = {
  getItem: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  setItem: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* full — in-memory only */ } },
  removeItem: (k: string) => { try { localStorage.removeItem(k); } catch { /* noop */ } },
};

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
  versions?: Array<{ id: string; name: string; at: number; snapshot: StoredEstimate[] }>;
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
  /** Import a project from exported JSON text. Returns true on success. */
  importProject: (json: string) => Promise<boolean>;
  /** Exported JSON for one project, or null. */
  exportProject: (id: string) => string | null;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

function toProject(sp: StoredProject): Project {
  return {
    id: sp.id,
    name: sp.name,
    location: sp.location ?? '',
    type: sp.type ?? 'Residential',
    startDate: sp.startDate ?? new Date(sp.createdAt).toISOString().split('T')[0],
    budget: sp.budget,
    ownerId: LOCAL_OWNER,
    memberIds: [LOCAL_OWNER],
    roles: { [LOCAL_OWNER]: 'owner' },
    memberEmails: {},
    estimates: sp.estimates.map((e) => ({
      id: e.id, projectId: sp.id, toolId: '', name: e.name, cost: e.cost,
      materials: Object.fromEntries((e.materials ?? []).map((m) => [m.name, { quantity: m.quantity, unit: m.unit }])),
      date: new Date(sp.updatedAt).toISOString(), category: 'General',
      createdAt: sp.createdAt, updatedAt: sp.updatedAt,
    })),
    versions: sp.versions,
    createdAt: sp.createdAt,
    updatedAt: sp.updatedAt,
  };
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(() => listProjects(localAdapter).map(toProject));
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    try { return localStorage.getItem('civil_active_project'); } catch { return null; }
  });

  useEffect(() => {
    try {
      if (activeProjectId) localStorage.setItem('civil_active_project', activeProjectId);
      else localStorage.removeItem('civil_active_project');
    } catch { /* noop */ }
  }, [activeProjectId]);

  const refresh = useCallback(() => {
    setProjects(listProjects(localAdapter).map(toProject));
  }, []);

  const addProject = async (data: Omit<Project, 'id' | 'estimates' | 'ownerId' | 'memberIds' | 'roles' | 'createdAt' | 'updatedAt'>) => {
    const created = storeCreate(localAdapter, {
      name: data.name, location: data.location, type: data.type,
      startDate: data.startDate, budget: data.budget,
    });
    refresh();
    if (!activeProjectId) setActiveProjectId(created.id);
    toast.success(`Project "${data.name}" created — saved on this device.`);
  };

  const updateProject = async (id: string, data: Partial<Omit<Project, 'id' | 'estimates' | 'ownerId' | 'createdAt'>>) => {
    const updated = storeUpdate(localAdapter, id, {
      name: data.name, location: data.location, type: data.type,
      startDate: data.startDate, budget: data.budget,
    });
    if (updated) refresh();
    else toast.error("Failed to update project");
  };

  const deleteProject = async (id: string) => {
    if (storeDelete(localAdapter, id)) {
      if (activeProjectId === id) setActiveProjectId(null);
      refresh();
      toast.success("Project deleted.");
    } else {
      toast.error("Failed to delete project");
    }
  };

  const saveVersion = async (projectId: string, versionName: string) => {
    const saved = storeSaveVersion(localAdapter, projectId, versionName);
    if (saved) { refresh(); toast.success(`Version "${versionName}" saved.`); }
    else toast.error("Error saving version");
  };

  const addEstimateToProject = async (projectId: string, estimate: Omit<ProjectEstimate, 'id' | 'projectId' | 'date' | 'createdAt' | 'updatedAt'>) => {
    const all = listProjects(localAdapter);
    const p = all.find((x) => x.id === projectId);
    if (!p) { toast.error("Project not found"); return; }
    const now = Date.now();
    p.estimates.push({
      id: `est_${now.toString(36)}`,
      name: estimate.name,
      cost: estimate.cost,
      materials: Object.entries(estimate.materials ?? {}).map(([name, v]) => ({ name, quantity: v.quantity, unit: v.unit })),
    });
    p.updatedAt = now;
    storeUpdate(localAdapter, projectId, { estimates: p.estimates, updatedAt: now });
    refresh();
  };

  const deleteEstimate = async (projectId: string, estimateId: string) => {
    const all = listProjects(localAdapter);
    const p = all.find((x) => x.id === projectId);
    if (!p) return;
    storeUpdate(localAdapter, projectId, { estimates: p.estimates.filter((e) => e.id !== estimateId) });
    refresh();
  };

  const addMember = async () => {
    toast.error("No accounts on this site — projects are local-first. Use Share to send the project file instead.");
  };

  const removeMember = async () => {
    toast.error("No accounts on this site — projects are local-first.");
  };

  const canEditProject = (_projectId: string) => true; // local-first: the device owner can always edit

  const importProject = async (json: string): Promise<boolean> => {
    const imported = importProjectJson(localAdapter, json);
    if (imported) { refresh(); toast.success(`Project "${imported.name}" imported.`); return true; }
    toast.error("Could not import — that file is not a Civil Estimation Pro project export.");
    return false;
  };

  const exportProject = (id: string): string | null => {
    const p = listProjects(localAdapter).find((x) => x.id === id);
    return p ? exportProjectJson(p) : null;
  };

  return (
    <ProjectContext.Provider value={{
      projects, activeProjectId, setActiveProjectId,
      addProject, updateProject, deleteProject, saveVersion,
      addEstimateToProject, deleteEstimate, addMember, removeMember,
      canEditProject, importProject, exportProject,
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
