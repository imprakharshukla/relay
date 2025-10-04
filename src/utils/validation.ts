import { existsSync } from 'fs';
import { resolve } from 'path';

export const validatePath = (path: string): boolean => {
  try {
    const absolutePath = resolve(path);
    return existsSync(absolutePath);
  } catch {
    return false;
  }
};

export const validateEditor = (editor: string): editor is 'vscode' | 'cursor' | 'zed' => {
  return ['vscode', 'cursor', 'zed'].includes(editor);
};

export const validateApiKey = (key: string): boolean => {
  return key.length > 10 && key.trim() === key;
};

export const isGitRepository = (path: string): boolean => {
  const gitPath = resolve(path, '.git');
  return existsSync(gitPath);
};
