import db from './index.js';

export interface Repository {
  id: number;
  name: string;
  path: string;
  worktree_base: string;
  editor: string | null;
  created_at: string;
}

export interface CreateRepositoryInput {
  name: string;
  path: string;
  worktree_base?: string;
  editor?: string;
}

export function createRepository(input: CreateRepositoryInput): Repository {
  const stmt = db.prepare(`
    INSERT INTO repositories (name, path, worktree_base, editor)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(
    input.name,
    input.path,
    input.worktree_base || '../worktrees',
    input.editor || null
  );

  return getRepositoryById(result.lastInsertRowid as number)!;
}

export function getRepositoryById(id: number): Repository | null {
  const stmt = db.prepare('SELECT * FROM repositories WHERE id = ?');
  return stmt.get(id) as Repository | null;
}

export function getRepositoryByName(name: string): Repository | null {
  const stmt = db.prepare('SELECT * FROM repositories WHERE name = ?');
  return stmt.get(name) as Repository | null;
}

export function getRepositoryByPath(path: string): Repository | null {
  const stmt = db.prepare('SELECT * FROM repositories WHERE path = ?');
  return stmt.get(path) as Repository | null;
}

export function getAllRepositories(): Repository[] {
  const stmt = db.prepare('SELECT * FROM repositories ORDER BY created_at DESC');
  return stmt.all() as Repository[];
}

export function updateRepository(id: number, updates: Partial<CreateRepositoryInput>): Repository | null {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.path !== undefined) {
    fields.push('path = ?');
    values.push(updates.path);
  }
  if (updates.worktree_base !== undefined) {
    fields.push('worktree_base = ?');
    values.push(updates.worktree_base);
  }
  if (updates.editor !== undefined) {
    fields.push('editor = ?');
    values.push(updates.editor);
  }

  if (fields.length === 0) {
    return getRepositoryById(id);
  }

  values.push(id);

  const stmt = db.prepare(`
    UPDATE repositories
    SET ${fields.join(', ')}
    WHERE id = ?
  `);

  stmt.run(...values);
  return getRepositoryById(id);
}

export function deleteRepository(id: number): void {
  const stmt = db.prepare('DELETE FROM repositories WHERE id = ?');
  stmt.run(id);
}

export function deleteRepositoryByName(name: string): void {
  const stmt = db.prepare('DELETE FROM repositories WHERE name = ?');
  stmt.run(name);
}

export function getRepositoryCount(): number {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM repositories');
  const result = stmt.get() as { count: number };
  return result.count;
}
