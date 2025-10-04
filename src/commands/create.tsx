import React, { useState, useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { Spinner } from '../components/Spinner.js';
import { IssuePreview } from '../components/IssuePreview.js';
import { getOpenRouterKey, getLinearKey } from '../utils/storage.js';
import { ensureConfig } from '../services/config.js';
import { LinearService } from '../services/linear.js';
import { AIService } from '../services/ai.js';
import { createWorktree } from '../services/git.js';
import { openInEditor } from '../services/editor.js';
import type { AIGeneratedIssue, LinearContext } from '../types/index.js';

interface CreateProps {
  task: string;
  teamKey?: string;
}

type CreateStep = 'init' | 'fetching' | 'analyzing' | 'preview' | 'creating' | 'worktree' | 'complete' | 'error';

export const Create: React.FC<CreateProps> = ({ task, teamKey }) => {
  const { exit } = useApp();
  const [step, setStep] = useState<CreateStep>('init');
  const [error, setError] = useState('');
  const [context, setContext] = useState<LinearContext | null>(null);
  const [aiIssue, setAiIssue] = useState<AIGeneratedIssue | null>(null);
  const [issueUrl, setIssueUrl] = useState('');
  const [branchName, setBranchName] = useState('');

  useInput((input, key) => {
    if (key.escape && step !== 'creating' && step !== 'worktree') {
      exit();
    }
  });

  useEffect(() => {
    runWorkflow();
  }, []);

  const runWorkflow = async () => {
    try {
      // Step 1: Load configuration
      setStep('init');
      const config = await ensureConfig();
      if (!config) {
        setError('No configuration found. Please run: relay setup');
        setStep('error');
        return;
      }

      const openRouterKey = getOpenRouterKey();
      const linearKey = getLinearKey();

      if (!openRouterKey || !linearKey) {
        setError('API keys not found. Please run: relay setup');
        setStep('error');
        return;
      }

      // Step 2: Fetch Linear context
      setStep('fetching');
      const linearService = new LinearService(linearKey);
      const linearContext = await linearService.getContext();
      setContext(linearContext);

      // Validate we have teams
      if (!linearContext.teams || linearContext.teams.length === 0) {
        setError('No teams found in your Linear workspace. Please create a team first.');
        setStep('error');
        return;
      }

      // Find default team or use first team
      let selectedTeam = linearContext.teams[0];
      if (teamKey) {
        const found = linearContext.teams.find(t => t.key === teamKey);
        if (found) {
          selectedTeam = found;
        } else {
          setError(`Team "${teamKey}" not found. Available teams: ${linearContext.teams.map(t => t.key).join(', ')}`);
          setStep('error');
          return;
        }
      }

      // Step 3: AI Analysis
      setStep('analyzing');
      const aiService = new AIService(openRouterKey);
      const generatedIssue = await aiService.analyzeTask(task, linearContext);
      setAiIssue(generatedIssue);

      // Step 4: Preview
      setStep('preview');

      // Auto-confirm after showing preview for 2 seconds
      setTimeout(async () => {
        await confirmAndCreate(linearService, selectedTeam.id, generatedIssue, config);
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setStep('error');
    }
  };

  const confirmAndCreate = async (
    linearService: LinearService,
    teamId: string,
    issue: AIGeneratedIssue,
    config: any
  ) => {
    try {
      // Step 5: Create issue
      setStep('creating');
      const createdIssue = await linearService.createIssue(teamId, issue);
      const url = createdIssue.url;
      const identifier = createdIssue.identifier;
      const branch = createdIssue.branchName;

      setIssueUrl(url);
      setBranchName(branch);

      // Step 6: Create worktree
      setStep('worktree');
      const worktreePath = await createWorktree(
        config.repoBase,
        config.worktreeBase,
        branch,
        config.baseBranch || 'main'
      );

      // Step 7: Open editor
      await openInEditor(worktreePath, config.editor);

      setStep('complete');
      setTimeout(() => exit(), 3000);

    } catch (err: any) {
      setError(err.message || 'Failed to create issue or worktree');
      setStep('error');
    }
  };

  if (step === 'error') {
    return (
      <Box flexDirection="column">
        <Text color="red">✗ Error: {error}</Text>
        <Text dimColor>Press ESC to exit</Text>
      </Box>
    );
  }

  if (step === 'init') {
    return <Spinner message="Initializing..." />;
  }

  if (step === 'fetching') {
    return <Spinner message="Fetching Linear context..." />;
  }

  if (step === 'analyzing') {
    return <Spinner message="AI analyzing your task..." />;
  }

  if (step === 'preview' && aiIssue && context) {
    const project = context.projects.find(p => p.id === aiIssue.projectId);
    const labels = context.labels.filter(l => aiIssue.labelIds.includes(l.id));

    return (
      <Box flexDirection="column">
        <IssuePreview
          issue={aiIssue}
          projectName={project?.name}
          labelNames={labels.map(l => l.name)}
        />
        <Text dimColor>Creating issue...</Text>
      </Box>
    );
  }

  if (step === 'creating') {
    return <Spinner message="Creating Linear issue..." />;
  }

  if (step === 'worktree') {
    return <Spinner message="Setting up git worktree..." />;
  }

  if (step === 'complete') {
    return (
      <Box flexDirection="column">
        <Text color="green">✓ All done!</Text>
        <Text>Issue: {issueUrl}</Text>
        <Text>Branch: {branchName}</Text>
        <Text dimColor>Worktree created and editor opened!</Text>
      </Box>
    );
  }

  return <Spinner message="Working..." />;
};
