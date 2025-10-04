import React, { useState, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import { Spinner } from '../components/Spinner.js';
import { getLinearKey } from '../utils/storage.js';
import { ensureConfig } from '../services/config.js';
import { LinearService } from '../services/linear.js';
import { createWorktree, listWorktrees } from '../services/git.js';
import { openInEditor } from '../services/editor.js';
import type { Issue } from '@linear/sdk';

type SwitchStep =
  | 'init'
  | 'fetching'
  | 'selecting'
  | 'switching'
  | 'creating'
  | 'complete'
  | 'error';

interface IssueOption {
  label: string;
  value: string;
  issue: Issue;
}

export const Switch: React.FC = () => {
  const { exit } = useApp();
  const [step, setStep] = useState<SwitchStep>('init');
  const [error, setError] = useState('');
  const [issues, setIssues] = useState<IssueOption[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [worktreePath, setWorktreePath] = useState('');

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
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

      setStep('fetching');
      const linearService = new LinearService(linearKey);
      const myIssues = await linearService.getMyIssues();

      if (myIssues.length === 0) {
        setError('No assigned issues found. Create an issue first with: relay "task"');
        setStep('error');
        return;
      }

      const issueOptions: IssueOption[] = myIssues.map((issue) => ({
        label: `${issue.identifier} - ${issue.title}`,
        value: issue.id,
        issue
      }));

      setIssues(issueOptions);
      setStep('selecting');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch issues');
      setStep('error');
    }
  };

  const handleSelect = async (item: IssueOption) => {
    try {
      const config = await ensureConfig();
      if (!config) return;

      setSelectedIssue(item.issue);
      setStep('switching');

      const branchName = item.issue.branchName;
      const repoBase = config.repoBase;

      // Check if worktree already exists
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
        setStep('creating');
        const newWorktreePath = await createWorktree(
          config.repoBase,
          config.worktreeBase,
          branchName,
          config.baseBranch || 'main',
          config.startupScripts
        );

        setWorktreePath(newWorktreePath);
        await openInEditor(newWorktreePath, config.editor);
      }

      setStep('complete');
      setTimeout(() => exit(), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to switch to issue');
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
    return <Spinner message="Fetching your assigned issues..." />;
  }

  if (step === 'selecting' && issues.length > 0) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color="cyan">
            Select an issue to work on:
          </Text>
        </Box>
        <SelectInput items={issues} onSelect={handleSelect} />
        <Box marginTop={1}>
          <Text dimColor>Use ↑↓ arrows to navigate, Enter to select</Text>
        </Box>
      </Box>
    );
  }

  if (step === 'switching') {
    return <Spinner message="Switching to issue..." />;
  }

  if (step === 'creating') {
    return <Spinner message="Creating worktree..." />;
  }

  if (step === 'complete') {
    return (
      <Box flexDirection="column">
        <Text color="green" bold>
          ✓ Switched to issue!
        </Text>
        {selectedIssue && (
          <Box marginTop={1}>
            <Text>
              {selectedIssue.identifier} - {selectedIssue.title}
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
