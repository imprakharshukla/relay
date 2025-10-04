import React, { useState, useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { Spinner } from '../components/Spinner.js';
import { setOpenRouterKey, setLinearKey } from '../utils/storage.js';
import { saveConfig } from '../services/config.js';
import { LinearService } from '../services/linear.js';
import { validatePath, validateApiKey, isGitRepository } from '../utils/validation.js';
import type { Editor } from '../types/index.js';

type SetupStep = 'openrouter' | 'linear' | 'repoBase' | 'editor' | 'worktreeBase' | 'testing' | 'complete';

const editorOptions = [
  { label: 'VS Code', value: 'vscode' },
  { label: 'Cursor', value: 'cursor' },
  { label: 'Zed', value: 'zed' }
];

export const Setup: React.FC = () => {
  const { exit } = useApp();
  const [step, setStep] = useState<SetupStep>('openrouter');
  const [openRouterKey, setOpenRouterKeyState] = useState('');
  const [linearKey, setLinearKeyState] = useState('');
  const [repoBase, setRepoBase] = useState(process.cwd());
  const [worktreeBase, setWorktreeBase] = useState('../worktrees');
  const [selectedEditor, setSelectedEditor] = useState<Editor>('cursor');
  const [error, setError] = useState('');
  const [testing, setTesting] = useState(false);

  useInput((input, key) => {
    if (key.escape) {
      exit();
    }
  });

  const handleSubmit = async () => {
    setError('');

    switch (step) {
      case 'openrouter':
        if (!validateApiKey(openRouterKey)) {
          setError('Invalid API key. Please enter a valid OpenRouter API key.');
          return;
        }
        setOpenRouterKey(openRouterKey);
        setStep('linear');
        break;

      case 'linear':
        if (!validateApiKey(linearKey)) {
          setError('Invalid API key. Please enter a valid Linear API key.');
          return;
        }
        setLinearKey(linearKey);
        setStep('testing');
        setTesting(true);

        // Test Linear connection
        try {
          const linearService = new LinearService(linearKey);
          const isValid = await linearService.testConnection();
          if (!isValid) {
            setError('Failed to connect to Linear. Please check your API key.');
            setStep('linear');
            setTesting(false);
            return;
          }
        } catch (err) {
          setError('Failed to connect to Linear. Please check your API key.');
          setStep('linear');
          setTesting(false);
          return;
        }

        setTesting(false);
        setStep('repoBase');
        break;

      case 'repoBase':
        if (!validatePath(repoBase)) {
          setError('Invalid path. Please enter a valid directory path.');
          return;
        }
        if (!isGitRepository(repoBase)) {
          setError('Not a git repository. Please enter a valid git repository path.');
          return;
        }
        setStep('worktreeBase');
        break;

      case 'worktreeBase':
        setStep('editor');
        break;

      case 'editor':
        // Save configuration
        saveConfig({
          repoBase,
          editor: selectedEditor,
          worktreeBase
        }, repoBase);
        setStep('complete');
        setTimeout(() => exit(), 2000);
        break;
    }
  };

  if (step === 'testing') {
    return <Spinner message="Testing Linear connection..." />;
  }

  if (step === 'complete') {
    return (
      <Box flexDirection="column">
        <Text color="green">✓ Setup complete!</Text>
        <Text>Configuration saved to .relay/relay-config.json</Text>
        <Text dimColor>You can now use: relay "your task description"</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          Relay CLI Setup
        </Text>
      </Box>

      {error && (
        <Box marginBottom={1}>
          <Text color="red">✗ {error}</Text>
        </Box>
      )}

      {step === 'openrouter' && (
        <Box flexDirection="column">
          <Text>Enter your OpenRouter API key:</Text>
          <Text dimColor>(Get one at https://openrouter.ai/)</Text>
          <Box marginTop={1}>
            <Text>API Key: </Text>
            <TextInput
              value={openRouterKey}
              onChange={setOpenRouterKeyState}
              onSubmit={handleSubmit}
              placeholder="sk-or-..."
              mask="*"
            />
          </Box>
        </Box>
      )}

      {step === 'linear' && (
        <Box flexDirection="column">
          <Text>Enter your Linear API key:</Text>
          <Text dimColor>(Get one at https://linear.app/settings/api)</Text>
          <Box marginTop={1}>
            <Text>API Key: </Text>
            <TextInput
              value={linearKey}
              onChange={setLinearKeyState}
              onSubmit={handleSubmit}
              placeholder="lin_api_..."
              mask="*"
            />
          </Box>
        </Box>
      )}

      {step === 'repoBase' && (
        <Box flexDirection="column">
          <Text>Git repository base path:</Text>
          <Text dimColor>(Press Enter to use current directory, or type a different path)</Text>
          <Box marginTop={1}>
            <Text color="cyan">{repoBase}</Text>
          </Box>
          <Box marginTop={1}>
            <Text>Path: </Text>
            <TextInput
              value={repoBase}
              onChange={setRepoBase}
              onSubmit={handleSubmit}
              placeholder={process.cwd()}
            />
          </Box>
        </Box>
      )}

      {step === 'worktreeBase' && (
        <Box flexDirection="column">
          <Text>Worktree base directory (relative to repo):</Text>
          <Text dimColor>(Press Enter to use default, or type a different path)</Text>
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

      {step === 'editor' && (
        <Box flexDirection="column">
          <Text marginBottom={1}>Select your preferred editor:</Text>
          <SelectInput
            items={editorOptions}
            onSelect={(item) => {
              setSelectedEditor(item.value as Editor);
              handleSubmit();
            }}
          />
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>Press ESC to cancel</Text>
      </Box>
    </Box>
  );
};
