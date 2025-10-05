import React from 'react';
import { Box, Text } from 'ink';
import { getWorktreeByIssueIdentifier } from '../db/worktrees.js';
import { getRepositoryById } from '../db/repositories.js';
import { getDefaultEditor } from '../db/settings.js';
import { openInEditor } from '../services/editor.js';
import type { Editor } from '../types/index.js';

interface WorktreeOpenProps {
  issueIdentifier: string;
}

export const WorktreeOpen: React.FC<WorktreeOpenProps> = ({ issueIdentifier }) => {
  const worktree = getWorktreeByIssueIdentifier(issueIdentifier);

  if (!worktree) {
    return (
      <Box flexDirection="column">
        <Text color="red">✗ Worktree not found: {issueIdentifier}</Text>
        <Text dimColor>View worktrees with: relay list</Text>
      </Box>
    );
  }

  const repo = getRepositoryById(worktree.repo_id);
  if (!repo) {
    return (
      <Box>
        <Text color="red">✗ Repository not found for this worktree</Text>
      </Box>
    );
  }

  const editor = (repo.editor || getDefaultEditor() || 'cursor') as Editor;

  try {
    openInEditor(worktree.path, editor);

    return (
      <Box flexDirection="column">
        <Text color="green">✓ Opening worktree in {editor}</Text>
        <Text>Issue: {worktree.issue_identifier} - {worktree.issue_title}</Text>
        <Text dimColor>Path: {worktree.path}</Text>
      </Box>
    );
  } catch (error: any) {
    return (
      <Box>
        <Text color="red">✗ Failed to open editor: {error.message}</Text>
      </Box>
    );
  }
};
