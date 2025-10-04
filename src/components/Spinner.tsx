import React from 'react';
import { Box, Text } from 'ink';
import SpinnerComponent from 'ink-spinner';

interface SpinnerProps {
  message?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <Box>
      <Text color="cyan">
        <SpinnerComponent type="dots" />
      </Text>
      <Text> {message}</Text>
    </Box>
  );
};
