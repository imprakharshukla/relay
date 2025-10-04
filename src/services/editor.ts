import { execa } from 'execa';
import type { Editor, EditorConfig } from '../types/index.js';

const editorCommands: Record<Editor, EditorConfig> = {
  vscode: {
    command: 'code',
    args: []
  },
  cursor: {
    command: 'cursor',
    args: []
  },
  zed: {
    command: 'zed',
    args: []
  }
};

export const openInEditor = async (
  path: string,
  editor: Editor
): Promise<void> => {
  const config = editorCommands[editor];

  if (!config) {
    throw new Error(`Unknown editor: ${editor}`);
  }

  try {
    await execa(config.command, [...config.args, path], {
      stdio: 'inherit'
    });
  } catch (error) {
    throw new Error(
      `Failed to open ${editor}. Make sure it's installed and available in PATH.`
    );
  }
};

export const isEditorAvailable = async (editor: Editor): Promise<boolean> => {
  const config = editorCommands[editor];

  try {
    await execa(config.command, ['--version']);
    return true;
  } catch {
    return false;
  }
};
