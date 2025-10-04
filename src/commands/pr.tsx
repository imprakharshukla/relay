import React, { useState, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import { Spinner } from '../components/Spinner.js';
import { getOpenRouterKey } from '../utils/storage.js';
import { ensureConfig } from '../services/config.js';
import {
  analyzePRContent,
  suggestReviewers,
  generatePRContent,
  createPullRequest,
  getCurrentBranch,
  extractLinearIssueId
} from '../services/pr.js';

type PRStep = 'init' | 'analyzing' | 'generating' | 'creating' | 'complete' | 'error';

export const PR: React.FC = () => {
  const { exit } = useApp();
  const [step, setStep] = useState<PRStep>('init');
  const [error, setError] = useState('');
  const [prUrl, setPrUrl] = useState('');
  const [prTitle, setPrTitle] = useState('');
  const [reviewers, setReviewers] = useState<string[]>([]);

  useEffect(() => {
    runPRCreation();
  }, []);

  const runPRCreation = async () => {
    try {
      // Load config
      setStep('init');
      const config = await ensureConfig();
      if (!config) {
        setError('No configuration found. Please run: relay setup');
        setStep('error');
        return;
      }

      const apiKey = getOpenRouterKey();
      if (!apiKey) {
        setError('OpenRouter API key not found. Please run: relay setup');
        setStep('error');
        return;
      }

      const repoBase = config.repoBase;
      const baseBranch = config.baseBranch || 'main';

      // Get current branch
      const currentBranch = await getCurrentBranch(repoBase);
      if (currentBranch === baseBranch) {
        setError(`You're on ${baseBranch}. Please switch to a feature branch first.`);
        setStep('error');
        return;
      }

      // Analyze PR content
      setStep('analyzing');
      const { commits, diff, files } = await analyzePRContent(
        repoBase,
        baseBranch,
        apiKey
      );

      if (commits.length === 0) {
        setError(`No commits found compared to ${baseBranch}. Nothing to create a PR for.`);
        setStep('error');
        return;
      }

      // Suggest reviewers
      const suggestedReviewers = await suggestReviewers(repoBase, files);
      setReviewers(suggestedReviewers);

      // Generate PR content with AI
      setStep('generating');
      const { title, description } = await generatePRContent(
        commits,
        diff,
        files,
        apiKey
      );

      setPrTitle(title);

      // Add Linear link if available
      const linearIssueId = extractLinearIssueId(currentBranch);
      let finalDescription = description;
      if (linearIssueId) {
        finalDescription = `${description}\n\n---\n\nLinear Issue: ${linearIssueId}`;
      }

      // Create PR via gh CLI
      setStep('creating');
      const prUrlResult = await createPullRequest(
        repoBase,
        title,
        finalDescription,
        baseBranch
      );

      setPrUrl(prUrlResult);
      setStep('complete');

      setTimeout(() => exit(), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to create PR');
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

  if (step === 'analyzing') {
    return <Spinner message="Analyzing commits and changes..." />;
  }

  if (step === 'generating') {
    return <Spinner message="AI generating PR title and description..." />;
  }

  if (step === 'creating') {
    return <Spinner message="Creating pull request via GitHub CLI..." />;
  }

  if (step === 'complete') {
    return (
      <Box flexDirection="column">
        <Text color="green" bold>
          ✓ Pull Request Created!
        </Text>
        <Box marginTop={1}>
          <Text bold>Title: </Text>
          <Text>{prTitle}</Text>
        </Box>
        <Box marginTop={1}>
          <Text bold>URL: </Text>
          <Text color="cyan">{prUrl}</Text>
        </Box>
        {reviewers.length > 0 && (
          <Box marginTop={1} flexDirection="column">
            <Text bold>Suggested Reviewers:</Text>
            {reviewers.slice(0, 3).map((reviewer, i) => (
              <Text key={i} dimColor>
                • {reviewer}
              </Text>
            ))}
          </Box>
        )}
        <Box marginTop={1}>
          <Text dimColor>Closing in 5 seconds...</Text>
        </Box>
      </Box>
    );
  }

  return <Spinner message="Working..." />;
};
