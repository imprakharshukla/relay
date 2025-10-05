import React from 'react';
import { Box, Text } from 'ink';
import {
  getAllSettings,
  setOpenRouterKey,
  setLinearKey,
  setDefaultEditor,
  getOpenRouterKey,
  getLinearKey,
  getDefaultEditor
} from '../db/settings.js';

interface ConfigShowProps {
  type: 'show';
}

interface ConfigSetProps {
  type: 'set-key';
  key: 'openrouter' | 'linear';
  value: string;
}

interface ConfigSetEditorProps {
  type: 'set-editor';
  editor: string;
}

type ConfigProps = ConfigShowProps | ConfigSetProps | ConfigSetEditorProps;

export const Config: React.FC<ConfigProps> = (props) => {
  if (props.type === 'show') {
    const openRouterKey = getOpenRouterKey();
    const linearKey = getLinearKey();
    const editor = getDefaultEditor();

    return (
      <Box flexDirection="column">
        <Text bold color="cyan">Configuration</Text>
        <Box marginTop={1} flexDirection="column">
          <Text>OpenRouter: {openRouterKey ? '✓ Configured' : '✗ Not configured'}</Text>
          <Text>Linear: {linearKey ? '✓ Configured' : '✗ Not configured'}</Text>
          <Text>Editor: {editor || 'Not set'}</Text>
        </Box>
      </Box>
    );
  }

  if (props.type === 'set-key') {
    if (props.key === 'openrouter') {
      setOpenRouterKey(props.value);
      return <Text color="green">✓ OpenRouter API key updated</Text>;
    }

    if (props.key === 'linear') {
      setLinearKey(props.value);
      return <Text color="green">✓ Linear API key updated</Text>;
    }
  }

  if (props.type === 'set-editor') {
    setDefaultEditor(props.editor);
    return <Text color="green">✓ Default editor set to: {props.editor}</Text>;
  }

  return <Text color="red">Invalid config command</Text>;
};
