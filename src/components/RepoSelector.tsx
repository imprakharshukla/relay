import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import type { Repository } from '../db/repositories.js';

interface RepoSelectorProps {
  repos: Repository[];
  onSelect: (repo: Repository) => void;
}

export const RepoSelector: React.FC<RepoSelectorProps> = ({ repos, onSelect }) => {
  const items = repos.map((repo) => ({
    label: `${repo.name} (${repo.path})`,
    value: repo
  }));

  return (
    <Box flexDirection="column">
      <Text marginBottom={1}>Select a repository:</Text>
      <SelectInput
        items={items}
        onSelect={(item) => onSelect(item.value as Repository)}
      />
    </Box>
  );
};
