/**
 * projectsStore — local-first project storage (G9 §14).
 * Pure storage layer over an injected storage adapter (localStorage in the
 * browser, in-memory in tests). Replaces the Firebase Firestore dependency
 * in the Projects UI: on static GitHub Pages an unsigned-in user previously
 * got an empty/error state with no local fallback, and invites called
 * fetch("/api/project/invite") which does not exist (404).
 * Firebase is NOT used here; the file src/lib/firebase.ts is untouched.
 */
export interface StoredEstimate { id: string; name: string; cost: number; materials?: Array<{ name: string; quantity: number; unit: string }>; }
export interface StoredProject {
  id: string;
  name: string;
  client?: string;
  location?: string;
  /** e.g. Residential / Commercial / Infrastructure / Industrial */
  type?: string;
  startDate?: string;
  budget?: number;
  createdAt: number;
  updatedAt: number;
  estimates: StoredEstimate[];
  versions: Array<{ id: string; name: string; at: number; snapshot: StoredEstimate[] }>;
}

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const PROJECTS_KEY = "cep_projects_v1";

export function memoryStorage(): StorageAdapter {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => { map.set(k, v); },
    removeItem: (k) => { map.delete(k); },
  };
}

export function listProjects(store: StorageAdapter): StoredProject[] {
  try {
    const raw = store.getItem(PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredProject[];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveAll(store: StorageAdapter, projects: StoredProject[]): void {
  store.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function createProject(store: StorageAdapter, p: Omit<StoredProject, "id" | "createdAt" | "updatedAt" | "estimates" | "versions">): StoredProject {
  const now = Date.now();
  const project: StoredProject = {
    ...p,
    id: `proj_${now.toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`,
    createdAt: now, updatedAt: now, estimates: [], versions: [],
  };
  const all = listProjects(store);
  all.push(project);
  saveAll(store, all);
  return project;
}

export function updateProject(store: StorageAdapter, id: string, patch: Partial<StoredProject>): StoredProject | null {
  const all = listProjects(store);
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...patch, id, updatedAt: Date.now() };
  saveAll(store, all);
  return all[idx];
}

export function deleteProject(store: StorageAdapter, id: string): boolean {
  const all = listProjects(store);
  const next = all.filter((p) => p.id !== id);
  if (next.length === all.length) return false;
  saveAll(store, next);
  return true;
}

export function saveVersion(store: StorageAdapter, projectId: string, name: string): StoredProject | null {
  const all = listProjects(store);
  const p = all.find((x) => x.id === projectId);
  if (!p) return null;
  p.versions.push({ id: `v_${Date.now().toString(36)}`, name, at: Date.now(), snapshot: JSON.parse(JSON.stringify(p.estimates)) });
  p.updatedAt = Date.now();
  saveAll(store, all);
  return p;
}

export function projectTotals(p: StoredProject): { totalCost: number; topMaterials: Array<{ name: string; unit: string; quantity: number }> } {
  const totalCost = p.estimates.reduce((s, e) => s + (Number(e.cost) || 0), 0);
  const map = new Map<string, { name: string; unit: string; quantity: number }>();
  for (const e of p.estimates) {
    for (const m of e.materials ?? []) {
      const key = `${m.name}_${m.unit}`;
      const cur = map.get(key) ?? { name: m.name, unit: m.unit, quantity: 0 };
      cur.quantity += Number(m.quantity) || 0;
      map.set(key, cur);
    }
  }
  const topMaterials = [...map.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  return { totalCost, topMaterials };
}

export function exportProjectJson(p: StoredProject): string {
  return JSON.stringify(p, null, 2);
}

export function importProjectJson(store: StorageAdapter, json: string): StoredProject | null {
  try {
    const parsed = JSON.parse(json) as StoredProject;
    if (!parsed || typeof parsed.name !== "string") return null;
    const project: StoredProject = {
      ...parsed,
      id: `proj_${Date.now().toString(36)}_import`,
      createdAt: Date.now(), updatedAt: Date.now(),
      estimates: Array.isArray(parsed.estimates) ? parsed.estimates : [],
      versions: Array.isArray(parsed.versions) ? parsed.versions : [],
    };
    const all = listProjects(store);
    all.push(project);
    saveAll(store, all);
    return project;
  } catch { return null; }
}
