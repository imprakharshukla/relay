import { eq, desc } from 'drizzle-orm';
import db from './index.js';
import { worktrees, repositories } from './schema.js';

export interface Worktree {
  id: number;
  repoId: number;
  issueId: string;
  issueIdentifier: string;
  issueTitle: string | null;
  branchName: string;
  path: string;
  createdAt: string | null;
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
  const result = db.insert(worktrees)
    .values({
      repoId: input.repo_id,
      issueId: input.issue_id,
      issueIdentifier: input.issue_identifier,
      issueTitle: input.issue_title || null,
      branchName: input.branch_name,
      path: input.path,
    })
    .returning()
    .get();

  return result as Worktree;
}

export function getWorktreeById(id: number): Worktree | null {
  return db.select().from(worktrees).where(eq(worktrees.id, id)).get() as Worktree | null;
}

export function getWorktreeByIssueIdentifier(issueIdentifier: string): Worktree | null {
  return db.select().from(worktrees).where(eq(worktrees.issueIdentifier, issueIdentifier)).get() as Worktree | null;
}

export function getWorktreesByRepo(repoId: number): Worktree[] {
  return db.select()
    .from(worktrees)
    .where(eq(worktrees.repoId, repoId))
    .orderBy(desc(worktrees.createdAt))
    .all() as Worktree[];
}

export function getAllWorktrees(): Worktree[] {
  return db.select()
    .from(worktrees)
    .orderBy(desc(worktrees.createdAt))
    .all() as Worktree[];
}

export function getAllWorktreesWithRepo(): WorktreeWithRepo[] {
  return db.select({
    id: worktrees.id,
    repoId: worktrees.repoId,
    issueId: worktrees.issueId,
    issueIdentifier: worktrees.issueIdentifier,
    issueTitle: worktrees.issueTitle,
    branchName: worktrees.branchName,
    path: worktrees.path,
    createdAt: worktrees.createdAt,
    repo_name: repositories.name,
    repo_path: repositories.path,
  })
    .from(worktrees)
    .innerJoin(repositories, eq(worktrees.repoId, repositories.id))
    .orderBy(desc(worktrees.createdAt))
    .all() as WorktreeWithRepo[];
}

export function getWorktreesWithRepoByRepoId(repoId: number): WorktreeWithRepo[] {
  return db.select({
    id: worktrees.id,
    repoId: worktrees.repoId,
    issueId: worktrees.issueId,
    issueIdentifier: worktrees.issueIdentifier,
    issueTitle: worktrees.issueTitle,
    branchName: worktrees.branchName,
    path: worktrees.path,
    createdAt: worktrees.createdAt,
    repo_name: repositories.name,
    repo_path: repositories.path,
  })
    .from(worktrees)
    .innerJoin(repositories, eq(worktrees.repoId, repositories.id))
    .where(eq(worktrees.repoId, repoId))
    .orderBy(desc(worktrees.createdAt))
    .all() as WorktreeWithRepo[];
}

export function deleteWorktree(id: number): void {
  db.delete(worktrees).where(eq(worktrees.id, id)).run();
}

export function deleteWorktreeByIssueIdentifier(issueIdentifier: string): void {
  db.delete(worktrees).where(eq(worktrees.issueIdentifier, issueIdentifier)).run();
}

export function getWorktreeCount(): number {
  const result = db.select({ count: worktrees.id }).from(worktrees).all();
  return result.length;
}

export function getWorktreeCountByRepo(repoId: number): number {
  const result = db.select({ count: worktrees.id })
    .from(worktrees)
    .where(eq(worktrees.repoId, repoId))
    .all();
  return result.length;
}
