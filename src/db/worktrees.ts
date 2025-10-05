import db from './index.js';
import type { Repository } from './repositories.js';

export interface Worktree {
  id: number;
  repo_id: number;
  issue_id: string;
  issue_identifier: string;
  issue_title: string | null;
  branch_name: string;
  path: string;
  created_at: string;
}

export interface WorktreeWithRepo extends Worktree {
  repo_name: string;
  repo_path: string;
}

export interface CreateWorktreeInput {
  repo_id: number;
  issue_id: string;
  issue_identifier: string;
  issue_title?: string;
  branch_name: string;
  path: string;
}

export function createWorktree(input: CreateWorktreeInput): Worktree {
  const stmt = db.query(`
    INSERT INTO worktrees (repo_id, issue_id, issue_identifier, issue_title, branch_name, path)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    input.repo_id,
    input.issue_id,
    input.issue_identifier,
    input.issue_title || null,
    input.branch_name,
    input.path
  );

  return getWorktreeById(result.lastInsertRowid as number)!;
}

export function getWorktreeById(id: number): Worktree | null {
  const stmt = db.query('SELECT * FROM worktrees WHERE id = ?');
  return stmt.get(id) as Worktree | null;
}

export function getWorktreeByIssueIdentifier(issueIdentifier: string): Worktree | null {
  const stmt = db.query('SELECT * FROM worktrees WHERE issue_identifier = ?');
  return stmt.get(issueIdentifier) as Worktree | null;
}

export function getWorktreesByRepo(repoId: number): Worktree[] {
  const stmt = db.query('SELECT * FROM worktrees WHERE repo_id = ? ORDER BY created_at DESC');
  return stmt.all(repoId) as Worktree[];
}

export function getAllWorktrees(): Worktree[] {
  const stmt = db.query('SELECT * FROM worktrees ORDER BY created_at DESC');
  return stmt.all() as Worktree[];
}

export function getAllWorktreesWithRepo(): WorktreeWithRepo[] {
  const stmt = db.query(`
    SELECT
      w.*,
      r.name as repo_name,
      r.path as repo_path
    FROM worktrees w
    JOIN repositories r ON w.repo_id = r.id
    ORDER BY w.created_at DESC
  `);
  return stmt.all() as WorktreeWithRepo[];
}

export function getWorktreesWithRepoByRepoId(repoId: number): WorktreeWithRepo[] {
  const stmt = db.query(`
    SELECT
      w.*,
      r.name as repo_name,
      r.path as repo_path
    FROM worktrees w
    JOIN repositories r ON w.repo_id = r.id
    WHERE w.repo_id = ?
    ORDER BY w.created_at DESC
  `);
  return stmt.all(repoId) as WorktreeWithRepo[];
}

export function deleteWorktree(id: number): void {
  const stmt = db.query('DELETE FROM worktrees WHERE id = ?');
  stmt.run(id);
}

export function deleteWorktreeByIssueIdentifier(issueIdentifier: string): void {
  const stmt = db.query('DELETE FROM worktrees WHERE issue_identifier = ?');
  stmt.run(issueIdentifier);
}

export function getWorktreeCount(): number {
  const stmt = db.query('SELECT COUNT(*) as count FROM worktrees');
  const result = stmt.get() as { count: number };
  return result.count;
}

export function getWorktreeCountByRepo(repoId: number): number {
  const stmt = db.query('SELECT COUNT(*) as count FROM worktrees WHERE repo_id = ?');
  const result = stmt.get(repoId) as { count: number };
  return result.count;
}
