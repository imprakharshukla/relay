import React, { useEffect, useState } from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import { getLinearKey, getDefaultTeamId } from '../db/settings.js';
import { getAllRepositories } from '../db/repositories.js';
import { LinearService } from '../services/linear.js';
import { createWorktree as createGitWorktree } from '../services/git.js';
import { openInEditor, type Editor } from '../services/editor.js';
import { createWorktree as dbCreateWorktree } from '../db/worktrees.js';
import { RepoSelector } from '../components/RepoSelector.js';
import type { Repository } from '../db/repositories.js';
import { getDefaultEditor } from '../db/settings.js';

interface FetchIssueProps {
  issueIdentifier: string;
  repoName?: string;
}

type Step = 'init' | 'select_repo' | 'fetching' | 'worktree' | 'opening' | 'complete';

export const FetchIssue: React.FC<FetchIssueProps> = ({ issueIdentifier, repoName }) => {
  const [step, setStep] = useState<Step>('init');
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [issueTitle, setIssueTitle] = useState<string>('');
  const [branchName, setBranchName] = useState<string>('');

  useEffect(() => {
    const init = async () => {
      const linearKey = getLinearKey();
      if (!linearKey) {
        setError('Linear API key not found. Run: relay config set-key linear <key>');
        return;
      }

      const repos = getAllRepositories();
      if (repos.length === 0) {
        setError('No repositories found. Add one with: relay repo add');
        return;
      }

      // If repo name is provided, find it
      if (repoName) {
        const repo = repos.find(r => r.name === repoName);
        if (!repo) {
          setError(`Repository "${repoName}" not found`);
          return;
        }
        setSelectedRepo(repo);
        await fetchAndCreate(repo, linearKey);
      } else if (repos.length === 1) {
        // Only one repo, use it
        setSelectedRepo(repos[0]);
        await fetchAndCreate(repos[0], linearKey);
      } else {
        // Multiple repos, need to select
        setStep('select_repo');
      }
    };

    init();
  }, []);

  const fetchAndCreate = async (repo: Repository, linearKey: string) => {
    try {
      setStep('fetching');
      const linearService = new LinearService(linearKey);

      // Fetch the issue from Linear
      const issue = await linearService.getIssue(issueIdentifier);

      if (!issue) {
        setError(`Issue ${issueIdentifier} not found in Linear`);
        return;
      }

      setIssueTitle(issue.title);
      setBranchName(issue.branchName);

      // Create worktree
      setStep('worktree');
      const worktreePath = await createGitWorktree(
        repo.path,
        repo.worktreeBase || '../worktrees',
        issue.branchName
      );

      // Save to database
      dbCreateWorktree({
        repo_id: repo.id,
        issue_id: issue.id,
        issue_identifier: issue.identifier,
        issue_title: issue.title,
        branch_name: issue.branchName,
        path: worktreePath,
      });

      // Open in editor
      setStep('opening');
      const editor = (repo.editor || getDefaultEditor() || 'cursor') as Editor;
      openInEditor(worktreePath, editor);

      setStep('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch issue');
    }
  };

  const handleRepoSelect = async (repo: Repository) => {
    setSelectedRepo(repo);
    const linearKey = getLinearKey()!;
    await fetchAndCreate(repo, linearKey);
  };

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">✗ {error}</Text>
      </Box>
    );
  }

  if (step === 'select_repo') {
    const repos = getAllRepositories();
    return (
      <Box flexDirection="column">
        <Text>Select a repository for {issueIdentifier}:</Text>
        <RepoSelector repos={repos} onSelect={handleRepoSelect} />
      </Box>
    );
  }

  if (step === 'init') {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" />
        </Text>
        <Text> Initializing...</Text>
      </Box>
    );
  }

  if (step === 'fetching') {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" />
        </Text>
        <Text> Fetching issue from Linear...</Text>
      </Box>
    );
  }

  if (step === 'worktree') {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" />
        </Text>
        <Text> Creating worktree for {branchName}...</Text>
      </Box>
    );
  }

  if (step === 'opening') {
    return (
      <Box>
        <Text color="cyan">
          <Spinner type="dots" />
        </Text>
        <Text> Opening editor...</Text>
      </Box>
    );
  }

  if (step === 'complete') {
    return (
      <Box flexDirection="column">
        <Text color="green">✓ Worktree created for {issueIdentifier}</Text>
        <Text dimColor>  Issue: {issueTitle}</Text>
        <Text dimColor>  Branch: {branchName}</Text>
        <Text dimColor>  Repository: {selectedRepo?.name}</Text>
      </Box>
    );
  }

  return null;
};
