import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import type { RelayConfig } from '../types/index.js';

const CONFIG_DIR = '.relay';
const CONFIG_FILE = 'relay-config.json';

export const getConfigPath = (cwd: string = process.cwd()): string => {
  return resolve(cwd, CONFIG_DIR, CONFIG_FILE);
};

export const getConfigDirPath = (cwd: string = process.cwd()): string => {
  return resolve(cwd, CONFIG_DIR);
};

export const configExists = (cwd: string = process.cwd()): boolean => {
  return existsSync(getConfigPath(cwd));
};

export const loadConfig = (cwd: string = process.cwd()): RelayConfig | null => {
  const configPath = getConfigPath(cwd);

  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    return JSON.parse(content) as RelayConfig;
  } catch (error) {
    console.error('Failed to load config:', error);
    return null;
  }
};

export const saveConfig = (config: RelayConfig, cwd: string = process.cwd()): void => {
  const configDir = getConfigDirPath(cwd);
  const configPath = getConfigPath(cwd);

  // Create .relay directory if it doesn't exist
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true });
  }

  // Write config file
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
};

export const updateConfig = (
  updates: Partial<RelayConfig>,
  cwd: string = process.cwd()
): RelayConfig | null => {
  const existing = loadConfig(cwd);

  if (!existing) {
    return null;
  }

  const updated = { ...existing, ...updates };
  saveConfig(updated, cwd);

  return updated;
};

export const ensureConfig = async (): Promise<RelayConfig | null> => {
  // Try to find config in current directory or parent directories
  let currentDir = process.cwd();
  const root = resolve('/');

  while (currentDir !== root) {
    if (configExists(currentDir)) {
      return loadConfig(currentDir);
    }
    currentDir = dirname(currentDir);
  }

  return null;
};
