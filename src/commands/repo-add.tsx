import React, { useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { FirstTimeSetup } from '../components/FirstTimeSetup.js';
import { hasRequiredKeys, getDefaultEditor } from '../db/settings.js';
import { createRepository, getRepositoryByPath } from '../db/repositories.js';
import { validatePath, isGitRepository } from '../utils/validation.js';
import { basename } from 'path';

type AddRepoStep = 'first_time' | 'name' | 'path' | 'worktree_base' | 'complete';

export const RepoAdd: React.FC = () => {
  const { exit } = useApp();
  const [step, setStep] = useState<AddRepoStep>(
    hasRequiredKeys() ? 'name' : 'first_time'
  );
  const [repoName, setRepoName] = useState(basename(process.cwd()));
  const [repoPath, setRepoPath] = useState(process.cwd());
  const [worktreeBase, setWorktreeBase] = useState('../worktrees');
  const [error, setError] = useState('');

  useInput((input, key) => {
    if (key.escape && step !== 'first_time') {
      exit();
    }
  });

  const handleFirstTimeComplete = () => {
    setStep('name');
  };

  const handleSubmit = () => {
    setError('');

    switch (step) {
      case 'name':
        if (!repoName.trim()) {
          setError('Repository name cannot be empty');
          return;
        }
        setStep('path');
        break;

      case 'path':
        if (!validatePath(repoPath)) {
          setError('Invalid path. Please enter a valid directory path.');
          return;
        }
        if (!isGitRepository(repoPath)) {
          setError('Not a git repository. Please enter a valid git repository path.');
          return;
        }

        // Check if repo already exists
        const existing = getRepositoryByPath(repoPath);
        if (existing) {
          setError(`Repository already exists: ${existing.name}`);
          return;
        }

        setStep('worktree_base');
        break;

      case 'worktree_base':
        // Save repository
        try {
          const editor = getDefaultEditor() || undefined;
          createRepository({
            name: repoName,
            path: repoPath,
            worktree_base: worktreeBase,
            editor
          });

          setStep('complete');
          setTimeout(() => exit(), 2000);
        } catch (err: any) {
          setError(`Failed to save repository: ${err.message}`);
        }
        break;
    }
  };

  if (step === 'first_time') {
    return <FirstTimeSetup onComplete={handleFirstTimeComplete} />;
  }

  if (step === 'complete') {
    return (
      <Box flexDirection="column">
        <Text color="green">✓ Repository added successfully!</Text>
        <Text>
          Name: <Text color="cyan">{repoName}</Text>
        </Text>
        <Text>
          Path: <Text color="cyan">{repoPath}</Text>
        </Text>
        <Text dimColor>
          Create issues with: relay create "your task"
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Add Repository
        </Text>
      </Box>

      {error && (
        <Box marginBottom={1}>
          <Text color="red">✗ {error}</Text>
        </Box>
      )}

      {step === 'name' && (
        <Box flexDirection="column">
          <Text>Repository name:</Text>
          <Text dimColor>(Press Enter to use: {basename(process.cwd())})</Text>
          <Box marginTop={1}>
            <Text>Name: </Text>
            <TextInput
              value={repoName}
              onChange={setRepoName}
              onSubmit={handleSubmit}
              placeholder={basename(process.cwd())}
            />
          </Box>
        </Box>
      )}

      {step === 'path' && (
        <Box flexDirection="column">
          <Text>Git repository path:</Text>
          <Text dimColor>(Press Enter to use current directory)</Text>
          <Box marginTop={1}>
            <Text color="cyan">{repoPath}</Text>
          </Box>
          <Box marginTop={1}>
            <Text>Path: </Text>
            <TextInput
              value={repoPath}
              onChange={setRepoPath}
              onSubmit={handleSubmit}
              placeholder={process.cwd()}
            />
          </Box>
        </Box>
      )}

      {step === 'worktree_base' && (
        <Box flexDirection="column">
          <Text>Worktree base directory (relative to repo):</Text>
          <Text dimColor>(Press Enter to use default)</Text>
          <Box marginTop={1}>
            <Text color="cyan">{worktreeBase}</Text>
          </Box>
          <Box marginTop={1}>
            <Text>Path: </Text>
            <TextInput
              value={worktreeBase}
              onChange={setWorktreeBase}
              onSubmit={handleSubmit}
              placeholder="../worktrees"
            />
          </Box>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Press ESC to cancel</Text>
      </Box>
    </Box>
  );
};
