import React, { useState, useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { Spinner } from '../components/Spinner.js';
import { getOpenRouterKey } from '../utils/storage.js';
import { execa } from 'execa';
import { AIService } from '../services/ai.js';
import { extractLinearIssueId } from '../services/pr.js';

type CommitStep =
  | 'init'
  | 'analyzing'
  | 'preview'
  | 'committing'
  | 'complete'
  | 'error';

export const Commit: React.FC = () => {
  const { exit } = useApp();
  const [step, setStep] = useState<CommitStep>('init');
  const [error, setError] = useState('');
  const [commitMessage, setCommitMessage] = useState('');
  const [coAuthors, setCoAuthors] = useState<string[]>([]);
  const [linearIssueId, setLinearIssueId] = useState<string | null>(null);

  useEffect(() => {
    generateCommitMessage();
  }, []);

  useInput((input, key) => {
    if (step === 'preview') {
      if (input === 'y' || key.return) {
        performCommit();
      } else if (input === 'n' || key.escape) {
        exit();
      }
    }
  });

  const generateCommitMessage = async () => {
    try {
      setStep('init');

      const apiKey = getOpenRouterKey();
      if (!apiKey) {
        setError('OpenRouter API key not found. Please run: relay setup');
        setStep('error');
        return;
      }

      // Check if there are staged changes
      const { stdout: statusOutput } = await execa('git', [
        'diff',
        '--cached',
        '--name-only'
      ]);

      if (!statusOutput.trim()) {
        setError('No staged changes. Please stage your changes first with: git add <files>');
        setStep('error');
        return;
      }

      setStep('analyzing');

      // Get staged diff
      const { stdout: diff } = await execa('git', ['diff', '--cached']);

      // Get changed files
      const files = statusOutput.split('\n').filter(Boolean);

      // Get co-authors from git blame
      const authors = new Set<string>();
      for (const file of files.slice(0, 5)) {
        try {
          const { stdout } = await execa('git', [
            'log',
            '-n',
            '3',
            '--pretty=format:%an <%ae>',
            '--',
            file
          ]);
          const fileAuthors = stdout.split('\n').filter(Boolean);
          fileAuthors.forEach((author) => authors.add(author));
        } catch {
          // Skip files with no history
        }
      }

      // Get current user to exclude from co-authors
      const { stdout: currentUser } = await execa('git', [
        'config',
        'user.name'
      ]);
      const { stdout: currentEmail } = await execa('git', [
        'config',
        'user.email'
      ]);
      const currentAuthor = `${currentUser.trim()} <${currentEmail.trim()}>`;

      const coAuthorsList = Array.from(authors)
        .filter((author) => author !== currentAuthor)
        .slice(0, 3);

      setCoAuthors(coAuthorsList);

      // Get current branch for Linear issue
      const { stdout: branch } = await execa('git', [
        'branch',
        '--show-current'
      ]);
      const issueId = extractLinearIssueId(branch);
      setLinearIssueId(issueId);

      // Generate commit message with AI
      const aiService = new AIService(apiKey);
      const prompt = `Generate a conventional commit message for these changes.

CHANGED FILES:
${files.join('\n')}

DIFF:
${diff.slice(0, 3000)}

Guidelines:
- Use conventional commit format: type(scope): message
- Types: feat, fix, refactor, docs, style, test, chore
- Keep the subject line under 50 characters
- Be specific and descriptive
- Focus on WHAT and WHY, not HOW

Generate ONLY the commit message, nothing else.`;

      const { generateText } = await import('ai');
      const { text } = await generateText({
        model: aiService['provider'](aiService['model']),
        prompt,
        temperature: 0.7
      });

      setCommitMessage(text.trim());
      setStep('preview');
    } catch (err: any) {
      setError(err.message || 'Failed to generate commit message');
      setStep('error');
    }
  };

  const performCommit = async () => {
    try {
      setStep('committing');

      // Build full commit message with co-authors and Linear link
      let fullMessage = commitMessage;

      if (linearIssueId) {
        fullMessage += `\n\nLinear: ${linearIssueId}`;
      }

      if (coAuthors.length > 0) {
        fullMessage += '\n\n' + coAuthors.map((author) => `Co-authored-by: ${author}`).join('\n');
      }

      // Perform commit
      await execa('git', ['commit', '-m', fullMessage]);

      setStep('complete');
      setTimeout(() => exit(), 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to commit');
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
    return <Spinner message="Checking staged changes..." />;
  }

  if (step === 'analyzing') {
    return <Spinner message="AI analyzing changes and generating commit message..." />;
  }

  if (step === 'preview') {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold color="cyan">
            Generated Commit Message:
          </Text>
        </Box>

        <Box
          flexDirection="column"
          paddingLeft={2}
          paddingY={1}
          borderStyle="round"
          borderColor="gray"
        >
          <Text>{commitMessage}</Text>

          {linearIssueId && (
            <Box marginTop={1}>
              <Text dimColor>Linear: {linearIssueId}</Text>
            </Box>
          )}

          {coAuthors.length > 0 && (
            <Box marginTop={1} flexDirection="column">
              {coAuthors.map((author, i) => (
                <Text key={i} dimColor>
                  Co-authored-by: {author}
                </Text>
              ))}
            </Box>
          )}
        </Box>

        <Box marginTop={1}>
          <Text>
            <Text color="green">y</Text> to commit,{' '}
            <Text color="red">n</Text> to cancel
          </Text>
        </Box>
      </Box>
    );
  }

  if (step === 'committing') {
    return <Spinner message="Creating commit..." />;
  }

  if (step === 'complete') {
    return (
      <Box flexDirection="column">
        <Text color="green" bold>
          ✓ Commit created successfully!
        </Text>
        <Box marginTop={1}>
          <Text dimColor>{commitMessage.split('\n')[0]}</Text>
        </Box>
      </Box>
    );
  }

  return <Spinner message="Working..." />;
};
