import { execa } from 'execa';
import { resolve } from 'path';
import { existsSync } from 'fs';

export const createWorktree = async (
  repoBase: string,
  worktreeBase: string,
  branchName: string,
  baseBranch: string = 'main'
): Promise<string> => {
  // Ensure repo base exists and is a git repo
  if (!existsSync(resolve(repoBase, '.git'))) {
    throw new Error(`${repoBase} is not a git repository`);
  }

  // Check if repository has any commits
  try {
    await execa('git', ['rev-parse', 'HEAD'], { cwd: repoBase });
  } catch {
    throw new Error(
      'Git repository has no commits. Please make an initial commit first:\n' +
      '  git add .\n' +
      '  git commit -m "Initial commit"'
    );
  }

  const worktreePath = resolve(repoBase, worktreeBase, branchName);

  try {
    // Create worktree with new branch based on baseBranch
    await execa('git', ['worktree', 'add', worktreePath, '-b', branchName, baseBranch], {
      cwd: repoBase
    });

    return worktreePath;
  } catch (error: any) {
    if (error.message?.includes('already exists')) {
      throw new Error(`Branch ${branchName} already exists`);
    }
    if (error.message?.includes('invalid reference')) {
      throw new Error(`Base branch '${baseBranch}' does not exist. Please check your config.`);
    }
    throw new Error(`Failed to create worktree: ${error.message}`);
  }
};

export const listWorktrees = async (repoBase: string): Promise<string[]> => {
  try {
    const { stdout } = await execa('git', ['worktree', 'list', '--porcelain'], {
      cwd: repoBase
    });

    const lines = stdout.split('\n');
    const worktrees: string[] = [];

    for (const line of lines) {
      if (line.startsWith('worktree ')) {
        worktrees.push(line.replace('worktree ', ''));
      }
    }

    return worktrees;
  } catch (error) {
    throw new Error('Failed to list worktrees');
  }
};

export const removeWorktree = async (
  repoBase: string,
  worktreePath: string
): Promise<void> => {
  try {
    await execa('git', ['worktree', 'remove', worktreePath], {
      cwd: repoBase
    });
  } catch (error: any) {
    throw new Error(`Failed to remove worktree: ${error.message}`);
  }
};

export const pruneWorktrees = async (repoBase: string): Promise<void> => {
  try {
    await execa('git', ['worktree', 'prune'], {
      cwd: repoBase
    });
  } catch (error) {
    throw new Error('Failed to prune worktrees');
  }
};

export const getCurrentBranch = async (cwd: string): Promise<string> => {
  try {
    const { stdout } = await execa('git', ['branch', '--show-current'], {
      cwd
    });
    return stdout.trim();
  } catch {
    throw new Error('Failed to get current branch');
  }
};
