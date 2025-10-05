import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

export const repositories = sqliteTable('repositories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  path: text('path').notNull().unique(),
  worktreeBase: text('worktree_base').default('../worktrees'),
  editor: text('editor'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const worktrees = sqliteTable('worktrees', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  repoId: integer('repo_id').notNull().references(() => repositories.id, { onDelete: 'cascade' }),
  issueId: text('issue_id').notNull(),
  issueIdentifier: text('issue_identifier').notNull(),
  issueTitle: text('issue_title'),
  branchName: text('branch_name').notNull(),
  path: text('path').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
