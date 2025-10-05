import React from 'react';
import { Box, Text } from 'ink';
import { getRepositoryByName, updateRepository } from '../db/repositories.js';

interface RepoEditProps {
  name: string;
  editor?: string;
  worktreeBase?: string;
}

export const RepoEdit: React.FC<RepoEditProps> = ({ name, editor, worktreeBase }) => {
  const repo = getRepositoryByName(name);

  if (!repo) {
    return (
      <Box flexDirection="column">
        <Text color="red">✗ Repository not found: {name}</Text>
        <Text dimColor>View repositories with: relay repo list</Text>
      </Box>
    );
  }

  const updates: any = {};
  if (editor) updates.editor = editor;
  if (worktreeBase) updates.worktree_base = worktreeBase;

  if (Object.keys(updates).length === 0) {
    return (
      <Box>
        <Text color="yellow">No updates specified. Use --editor or --worktree-base</Text>
      </Box>
    );
  }

  try {
    updateRepository(repo.id, updates);

    return (
      <Box flexDirection="column">
        <Text color="green">✓ Repository updated: {name}</Text>
        {editor && <Text>  Editor: {editor}</Text>}
        {worktreeBase && <Text>  Worktree base: {worktreeBase}</Text>}
      </Box>
    );
  } catch (error: any) {
    return (
      <Box>
        <Text color="red">✗ Failed to update repository: {error.message}</Text>
      </Box>
    );
  }
};
