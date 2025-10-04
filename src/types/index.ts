export interface RelayConfig {
  repoBase: string;
  editor: 'vscode' | 'cursor' | 'zed';
  defaultTeam?: string;
  worktreeBase: string;
}

export interface AIGeneratedIssue {
  title: string;
  description: string;
  projectId?: string;
  labelIds: string[];
  priority: 0 | 1 | 2 | 3 | 4;
  assigneeId?: string;
}

export interface LinearContext {
  teams: Array<{ id: string; name: string; key: string }>;
  projects: Array<{ id: string; name: string; description?: string; teamId: string }>;
  labels: Array<{ id: string; name: string; description?: string }>;
}

export interface EditorConfig {
  command: string;
  args: string[];
}

export type Editor = 'vscode' | 'cursor' | 'zed';
