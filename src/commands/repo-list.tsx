import React from 'react';
import { Box, Text } from 'ink';
import { getAllRepositories } from '../db/repositories.js';
import { getWorktreeCountByRepo } from '../db/worktrees.js';

export const RepoList: React.FC = () => {
  const repos = getAllRepositories();

  if (repos.length === 0) {
    return (
      <Box flexDirection="column">
        <Text>No repositories found.</Text>
        <Text dimColor>Add one with: relay repo add</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Repositories
        </Text>
      </Box>

      {repos.map((repo) => {
        const worktreeCount = getWorktreeCountByRepo(repo.id);

        return (
          <Box key={repo.id} flexDirection="column" marginBottom={1}>
            <Box>
              <Text bold color="green">
                {repo.name}
              </Text>
              <Text dimColor> ({worktreeCount} worktree{worktreeCount !== 1 ? 's' : ''})</Text>
            </Box>
            <Text dimColor>  Path: {repo.path}</Text>
            <Text dimColor>  Worktree base: {repo.worktreeBase}</Text>
            {repo.editor && <Text dimColor>  Editor: {repo.editor}</Text>}
          </Box>
        );
      })}
    </Box>
  );
};
