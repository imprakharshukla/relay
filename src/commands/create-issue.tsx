import React, { useState, useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { Spinner } from '../components/Spinner.js';
import { IssuePreview } from '../components/IssuePreview.js';
import { RepoSelector } from '../components/RepoSelector.js';
import { getOpenRouterKey, getLinearKey } from '../db/settings.js';
import { getAllRepositories, getRepositoryByName, type Repository } from '../db/repositories.js';
import { createWorktree as dbCreateWorktree } from '../db/worktrees.js';
import { LinearService } from '../services/linear.js';
import { AIService } from '../services/ai.js';
import { createWorktree } from '../services/git.js';
import { openInEditor } from '../services/editor.js';
import type { AIGeneratedIssue, LinearContext } from '../types/index.js';

interface CreateIssueProps {
  task: string;
  repoName?: string;
}

type CreateStep = 'select_repo' | 'fetching' | 'analyzing' | 'preview' | 'creating' | 'worktree' | 'complete' | 'error';

export const CreateIssue: React.FC<CreateIssueProps> = ({ task, repoName }) => {
  const { exit } = useApp();
  const [step, setStep] = useState<CreateStep>('select_repo');
  const [error, setError] = useState('');
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
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
    initializeWorkflow();
  }, []);

  const initializeWorkflow = async () => {
    try {
      // Get API keys
      const openRouterKey = getOpenRouterKey();
      const linearKey = getLinearKey();

      if (!openRouterKey || !linearKey) {
        setError('API keys not configured. Please run: relay repo add');
        setStep('error');
        return;
      }

      // Get repositories
      const repos = getAllRepositories();

      if (repos.length === 0) {
        setError('No repositories found. Please run: relay repo add');
        setStep('error');
        return;
      }

      // Select repository
      let repo: Repository | null = null;

      if (repoName) {
        repo = getRepositoryByName(repoName);
        if (!repo) {
          setError(`Repository not found: ${repoName}`);
          setStep('error');
          return;
        }
      } else if (repos.length === 1) {
        repo = repos[0];
      } else {
        // Multiple repos, need to select
        setStep('select_repo');
        return;
      }

      setSelectedRepo(repo);
      await runWorkflow(repo, openRouterKey!, linearKey!);

    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setStep('error');
    }
  };

  const handleRepoSelect = async (repo: Repository) => {
    const openRouterKey = getOpenRouterKey();
    const linearKey = getLinearKey();

    setSelectedRepo(repo);
    await runWorkflow(repo, openRouterKey!, linearKey!);
  };

  const runWorkflow = async (repo: Repository, openRouterKey: string, linearKey: string) => {
    try {
      // Step 1: Fetch Linear context
      setStep('fetching');
      const linearService = new LinearService(linearKey);
      const linearContext = await linearService.getContext();
      setContext(linearContext);

      // Use first team as default
      const defaultTeam = linearContext.teams[0];
      if (!defaultTeam) {
        setError('No teams found in Linear workspace');
        setStep('error');
        return;
      }

      // Step 2: AI Analysis
      setStep('analyzing');
      const aiService = new AIService(openRouterKey);
      const generatedIssue = await aiService.analyzeTask(task, linearContext);
      setAiIssue(generatedIssue);

      // Step 3: Preview
      setStep('preview');

      // Auto-confirm after showing preview for 2 seconds
      setTimeout(async () => {
        await confirmAndCreate(linearService, defaultTeam.id, generatedIssue, repo);
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
    repo: Repository
  ) => {
    try {
      // Step 4: Create issue
      setStep('creating');
      const createdIssue = await linearService.createIssue(teamId, issue);
      const url = createdIssue.url;
      const identifier = createdIssue.identifier;
      const branch = createdIssue.branchName;

      setIssueUrl(url);
      setBranchName(branch);

      // Step 5: Create worktree
      setStep('worktree');
      const worktreePath = await createWorktree(
        repo.path,
        repo.worktree_base,
        branch
      );

      // Save worktree to database
      dbCreateWorktree({
        repo_id: repo.id,
        issue_id: createdIssue.id,
        issue_identifier: identifier,
        issue_title: createdIssue.title,
        branch_name: branch,
        path: worktreePath
      });

      // Step 6: Open editor
      const editor = repo.editor || 'cursor';
      await openInEditor(worktreePath, editor as any);

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

  if (step === 'select_repo') {
    const repos = getAllRepositories();
    return <RepoSelector repos={repos} onSelect={handleRepoSelect} />;
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
