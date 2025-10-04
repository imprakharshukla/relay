import React, { useState, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import { Spinner } from '../components/Spinner.js';
import { getLinearKey } from '../utils/storage.js';
import { ensureConfig } from '../services/config.js';
import { LinearService } from '../services/linear.js';
import { createWorktree, listWorktrees } from '../services/git.js';
import { openInEditor } from '../services/editor.js';
import type { Issue } from '@linear/sdk';

type OpenStep =
  | 'init'
  | 'fetching'
  | 'checking-worktree'
  | 'creating-worktree'
  | 'complete'
  | 'error';

interface OpenProps {
  issueId: string;
}

export const Open: React.FC<OpenProps> = ({ issueId }) => {
  const { exit } = useApp();
  const [step, setStep] = useState<OpenStep>('init');
  const [error, setError] = useState('');
  const [issue, setIssue] = useState<Issue | null>(null);
  const [worktreePath, setWorktreePath] = useState('');

  useEffect(() => {
    openIssue();
  }, []);

  const openIssue = async () => {
    try {
      setStep('init');
      const config = await ensureConfig();
      if (!config) {
        setError('No configuration found. Please run: relay setup');
        setStep('error');
        return;
      }

      const linearKey = getLinearKey();
      if (!linearKey) {
        setError('Linear API key not found. Please run: relay setup');
        setStep('error');
        return;
      }

      // Fetch the issue
      setStep('fetching');
      const linearService = new LinearService(linearKey);

      // Try to find the issue by identifier (e.g., ENG-123)
      const issues = await linearService.getMyIssues();
      const foundIssue = issues.find((i) => i.identifier === issueId);

      if (!foundIssue) {
        setError(`Issue ${issueId} not found or not assigned to you`);
        setStep('error');
        return;
      }

      setIssue(foundIssue);

      // Get branch name from Linear
      const branchName = foundIssue.branchName;
      const repoBase = config.repoBase;

      // Check if worktree already exists
      setStep('checking-worktree');
      const existingWorktrees = await listWorktrees(repoBase);
      const existingWorktree = existingWorktrees.find((wt) =>
        wt.includes(branchName)
      );

      if (existingWorktree) {
        // Worktree exists, just open it
        setWorktreePath(existingWorktree);
        await openInEditor(existingWorktree, config.editor);
      } else {
        // Create new worktree
        setStep('creating-worktree');
        const newWorktreePath = await createWorktree(
          config.repoBase,
          config.worktreeBase,
          branchName,
          config.baseBranch || 'main'
        );

        setWorktreePath(newWorktreePath);
        await openInEditor(newWorktreePath, config.editor);
      }

      setStep('complete');
      setTimeout(() => exit(), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to open issue');
      setStep('error');
    }
  };

  if (step === 'error') {
    return (
      <Box flexDirection="column">
        <Text color="red">✗ Error: {error}</Text>
        <Text dimColor>Press Ctrl+C to exit</Text>
      </Box>
    );
  }

  if (step === 'init') {
    return <Spinner message="Initializing..." />;
  }

  if (step === 'fetching') {
    return <Spinner message={`Fetching issue ${issueId}...`} />;
  }

  if (step === 'checking-worktree') {
    return <Spinner message="Checking for existing worktree..." />;
  }

  if (step === 'creating-worktree') {
    return <Spinner message="Creating worktree..." />;
  }

  if (step === 'complete') {
    return (
      <Box flexDirection="column">
        <Text color="green" bold>
          ✓ Opened issue!
        </Text>
        {issue && (
          <Box marginTop={1}>
            <Text>
              {issue.identifier} - {issue.title}
            </Text>
          </Box>
        )}
        <Box marginTop={1}>
          <Text dimColor>Worktree: {worktreePath}</Text>
        </Box>
      </Box>
    );
  }

  return <Spinner message="Working..." />;
};
