import React from 'react';
import { Box, Text } from 'ink';
import { getAllWorktreesWithRepo, getWorktreesWithRepoByRepoId } from '../db/worktrees.js';
import { getRepositoryByName } from '../db/repositories.js';

interface WorktreeListProps {
  repoName?: string;
}

export const WorktreeList: React.FC<WorktreeListProps> = ({ repoName }) => {
  let worktrees;

  if (repoName) {
    const repo = getRepositoryByName(repoName);
    if (!repo) {
      return (
        <Box>
          <Text color="red">✗ Repository not found: {repoName}</Text>
        </Box>
      );
    }
    worktrees = getWorktreesWithRepoByRepoId(repo.id);
  } else {
    worktrees = getAllWorktreesWithRepo();
  }

  if (worktrees.length === 0) {
    return (
      <Box flexDirection="column">
        <Text>No worktrees found.</Text>
        <Text dimColor>Create one with: relay create "your task"</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Worktrees
        </Text>
      </Box>

      {worktrees.map((worktree) => (
        <Box key={worktree.id} flexDirection="column" marginBottom={1}>
          <Box>
            <Text bold color="green">
              {worktree.issue_identifier}
            </Text>
            <Text> - {worktree.issue_title || 'No title'}</Text>
          </Box>
          <Text dimColor>  Repo: {worktree.repo_name}</Text>
          <Text dimColor>  Branch: {worktree.branch_name}</Text>
          <Text dimColor>  Path: {worktree.path}</Text>
        </Box>
      ))}
    </Box>
  );
};
