import { eq, desc } from 'drizzle-orm';
import db from './index.js';
import { repositories } from './schema.js';

export interface Repository {
  id: number;
  name: string;
  path: string;
  worktreeBase: string | null;
  editor: string | null;
  createdAt: string | null;
}

export interface CreateRepositoryInput {
  name: string;
  path: string;
  worktree_base?: string;
  editor?: string;
}

export function createRepository(input: CreateRepositoryInput): Repository {
  const result = db.insert(repositories)
    .values({
      name: input.name,
      path: input.path,
      worktreeBase: input.worktree_base || '../worktrees',
      editor: input.editor || null,
    })
    .returning()
    .get();

  return result as Repository;
}

export function getRepositoryById(id: number): Repository | null {
  return db.select().from(repositories).where(eq(repositories.id, id)).get() as Repository | null;
}

export function getRepositoryByName(name: string): Repository | null {
  return db.select().from(repositories).where(eq(repositories.name, name)).get() as Repository | null;
}

export function getRepositoryByPath(path: string): Repository | null {
  return db.select().from(repositories).where(eq(repositories.path, path)).get() as Repository | null;
}

export function getAllRepositories(): Repository[] {
  return db.select().from(repositories).orderBy(desc(repositories.createdAt)).all() as Repository[];
}

export function updateRepository(id: number, updates: Partial<CreateRepositoryInput>): Repository | null {
  const updateData: any = {};

  if (updates.name !== undefined) {
    updateData.name = updates.name;
  }
  if (updates.path !== undefined) {
    updateData.path = updates.path;
  }
  if (updates.worktree_base !== undefined) {
    updateData.worktreeBase = updates.worktree_base;
  }
  if (updates.editor !== undefined) {
    updateData.editor = updates.editor;
  }

  if (Object.keys(updateData).length === 0) {
    return getRepositoryById(id);
  }

  db.update(repositories)
    .set(updateData)
    .where(eq(repositories.id, id))
    .run();

  return getRepositoryById(id);
}

export function deleteRepository(id: number): void {
  db.delete(repositories).where(eq(repositories.id, id)).run();
}

export function deleteRepositoryByName(name: string): void {
  db.delete(repositories).where(eq(repositories.name, name)).run();
}

export function getRepositoryCount(): number {
  const result = db.select({ count: repositories.id }).from(repositories).all();
  return result.length;
}
