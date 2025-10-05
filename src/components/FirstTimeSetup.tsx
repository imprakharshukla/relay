import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import SelectInput from 'ink-select-input';
import { Spinner } from './Spinner.js';
import {
  setOpenRouterKey,
  setLinearKey,
  setDefaultEditor,
  setDefaultTeamId
} from '../db/settings.js';
import { LinearService } from '../services/linear.js';
import { validateApiKey } from '../utils/validation.js';
import type { Editor } from '../types/index.js';

type SetupStep = 'openrouter' | 'linear' | 'testing' | 'editor' | 'complete';

const editorOptions = [
  { label: 'Cursor', value: 'cursor' },
  { label: 'VS Code', value: 'vscode' },
  { label: 'Zed', value: 'zed' }
];

interface FirstTimeSetupProps {
  onComplete: () => void;
}

export const FirstTimeSetup: React.FC<FirstTimeSetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState<SetupStep>('openrouter');
  const [openRouterKey, setOpenRouterKeyState] = useState('');
  const [linearKey, setLinearKeyState] = useState('');
  const [error, setError] = useState('');

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

        // Test Linear connection and get default team
        try {
          const linearService = new LinearService(linearKey);
          const isValid = await linearService.testConnection();
          if (!isValid) {
            setError('Failed to connect to Linear. Please check your API key.');
            setStep('linear');
            return;
          }

          // Get first team and set as default
          const context = await linearService.getContext();
          if (context.teams.length > 0) {
            setDefaultTeamId(context.teams[0].id);
          }
        } catch (err) {
          setError('Failed to connect to Linear. Please check your API key.');
          setStep('linear');
          return;
        }

        setStep('editor');
        break;

      case 'editor':
        // Editor is selected via SelectInput, handled in onSelect
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
        <Text>You can now add repositories with: relay repo add</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="cyan">
          First Time Setup
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

      {step === 'editor' && (
        <Box flexDirection="column">
          <Text marginBottom={1}>Select your preferred editor:</Text>
          <SelectInput
            items={editorOptions}
            onSelect={(item) => {
              setDefaultEditor(item.value as Editor);
              setStep('complete');
              setTimeout(() => onComplete(), 1500);
            }}
          />
        </Box>
      )}
    </Box>
  );
};
