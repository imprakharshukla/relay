import React, { useState } from 'react';
import { Box, Text, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import { Spinner } from '../components/Spinner.js';
import { getAllWorktreesWithRepo, deleteWorktree } from '../db/worktrees.js';
import { getRepositoryById } from '../db/repositories.js';
import { removeWorktree } from '../services/git.js';

type CleanupStep = 'select' | 'removing' | 'complete';

export const WorktreeCleanup: React.FC = () => {
  const { exit } = useApp();
  const [step, setStep] = useState<CleanupStep>('select');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const worktrees = getAllWorktreesWithRepo();

  if (worktrees.length === 0) {
    return (
      <Box flexDirection="column">
        <Text>No worktrees to clean up.</Text>
        <Text dimColor>Create one with: relay create "your task"</Text>
      </Box>
    );
  }

  const handleSelect = async (item: { value: number }) => {
    const worktreeId = item.value;
    setSelectedId(worktreeId);
    setStep('removing');

    const worktree = worktrees.find(w => w.id === worktreeId);
    if (!worktree) {
      setError('Worktree not found');
      setStep('select');
      return;
    }

    const repo = getRepositoryById(worktree.repoId);
    if (!repo) {
      setError('Repository not found');
      setStep('select');
      return;
    }

    try {
      // Remove git worktree
      await removeWorktree(repo.path, worktree.path);

      // Remove from database
      deleteWorktree(worktreeId);

      setStep('complete');
      setTimeout(() => exit(), 2000);
    } catch (err: any) {
      setError(`Failed to remove worktree: ${err.message}`);
      setStep('select');
    }
  };

  if (step === 'removing') {
    return <Spinner message="Removing worktree..." />;
  }

  if (step === 'complete') {
    const worktree = worktrees.find(w => w.id === selectedId);
    return (
      <Box flexDirection="column">
        <Text color="green">✓ Worktree removed successfully</Text>
        {worktree && (
          <Text>Issue: {worktree.issue_identifier}</Text>
        )}
      </Box>
    );
  }

  const items = worktrees.map(w => ({
    label: `${w.issue_identifier} - ${w.issue_title || 'No title'} (${w.repo_name})`,
    value: w.id
  }));

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Select a worktree to remove:
        </Text>
      </Box>

      {error && (
        <Box marginBottom={1}>
          <Text color="red">✗ {error}</Text>
        </Box>
      )}

      <SelectInput items={items} onSelect={handleSelect} />
    </Box>
  );
};
