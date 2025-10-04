import React from 'react';
import { Box, Text } from 'ink';
import type { AIGeneratedIssue } from '../types/index.js';

interface IssuePreviewProps {
  issue: AIGeneratedIssue;
  projectName?: string;
  labelNames: string[];
}

const priorityLabels = ['No priority', 'Urgent', 'High', 'Normal', 'Low'];

// Simple function to render markdown-like text with basic formatting
const renderFormattedText = (text: string) => {
  const lines = text.split('\n');

  return lines.map((line, index) => {
    // Headers
    if (line.startsWith('### ')) {
      return (
        <Text key={index} bold color="cyan">
          {line.replace('### ', '')}
        </Text>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <Text key={index} bold color="green">
          {line.replace('## ', '')}
        </Text>
      );
    }
    if (line.startsWith('# ')) {
      return (
        <Text key={index} bold color="blue">
          {line.replace('# ', '')}
        </Text>
      );
    }

    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      return (
        <Text key={index} dimColor>
          {line}
        </Text>
      );
    }

    // Empty lines
    if (line.trim() === '') {
      return <Text key={index}> </Text>;
    }

    // Regular text
    return <Text key={index}>{line}</Text>;
  });
};

export const IssuePreview: React.FC<IssuePreviewProps> = ({
  issue,
  projectName,
  labelNames
}) => {
  return (
    <Box flexDirection="column" paddingY={1}>
      <Box marginBottom={1}>
        <Text bold color="green">
          ✓ Issue Preview
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="cyan">Title:</Text>
        <Text>{issue.title}</Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        <Text bold color="cyan">Description:</Text>
        <Box flexDirection="column" paddingLeft={2}>
          {renderFormattedText(issue.description)}
        </Box>
      </Box>

      {projectName && (
        <Box marginBottom={1}>
          <Text bold>Project: </Text>
          <Text color="cyan">{projectName}</Text>
        </Box>
      )}

      {labelNames.length > 0 && (
        <Box marginBottom={1}>
          <Text bold>Labels: </Text>
          <Text color="yellow">{labelNames.join(', ')}</Text>
        </Box>
      )}

      <Box marginBottom={1}>
        <Text bold>Priority: </Text>
        <Text color="magenta">{priorityLabels[issue.priority]}</Text>
      </Box>
    </Box>
  );
};
