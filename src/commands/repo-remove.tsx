import React from 'react';
import { Box, Text } from 'ink';
import { deleteRepositoryByName, getRepositoryByName } from '../db/repositories.js';

interface RepoRemoveProps {
  name: string;
}

export const RepoRemove: React.FC<RepoRemoveProps> = ({ name }) => {
  const repo = getRepositoryByName(name);

  if (!repo) {
    return (
      <Box flexDirection="column">
        <Text color="red">✗ Repository not found: {name}</Text>
        <Text dimColor>View repositories with: relay repo list</Text>
      </Box>
    );
  }

  try {
    deleteRepositoryByName(name);

    return (
      <Box flexDirection="column">
        <Text color="green">✓ Repository removed: {name}</Text>
        <Text dimColor>Associated worktrees have been removed from the database.</Text>
      </Box>
    );
  } catch (error: any) {
    return (
      <Box>
        <Text color="red">✗ Failed to remove repository: {error.message}</Text>
      </Box>
    );
  }
};
