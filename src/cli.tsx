#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { RepoAdd } from './commands/repo-add.js';
import { RepoList } from './commands/repo-list.js';
import { RepoRemove } from './commands/repo-remove.js';
import { RepoEdit } from './commands/repo-edit.js';
import { CreateIssue } from './commands/create-issue.js';
import { WorktreeList } from './commands/worktree-list.js';
import { WorktreeOpen } from './commands/worktree-open.js';
import { WorktreeCleanup } from './commands/worktree-cleanup.js';
import { Config } from './commands/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

const program = new Command();

program
  .name('relay')
  .description('AI-powered Linear issue creation with automatic git worktree setup')
  .version(packageJson.version);

// Repository management
const repo = program.command('repo').description('Manage repositories');

repo
  .command('add')
  .description('Add a new repository (includes first-time setup)')
  .action(() => {
    render(<RepoAdd />);
  });

repo
  .command('list')
  .description('List all repositories')
  .action(() => {
    render(<RepoList />);
  });

repo
  .command('remove <name>')
  .description('Remove a repository')
  .action((name) => {
    render(<RepoRemove name={name} />);
  });

repo
  .command('edit <name>')
  .description('Edit repository settings')
  .option('--editor <editor>', 'Set editor (cursor, vscode, zed)')
  .option('--worktree-base <path>', 'Set worktree base path')
  .action((name, options) => {
    render(<RepoEdit name={name} editor={options.editor} worktreeBase={options.worktreeBase} />);
  });

// Create issue command (primary command)
program
  .command('create <task>')
  .description('Create a Linear issue with AI and set up worktree')
  .option('-r, --repo <name>', 'Repository name')
  .action((task, options) => {
    render(<CreateIssue task={task} repoName={options.repo} />);
  });

// Worktree management
program
  .command('list')
  .description('List all worktrees')
  .option('-r, --repo <name>', 'Filter by repository name')
  .action((options) => {
    render(<WorktreeList repoName={options.repo} />);
  });

program
  .command('open <issue>')
  .description('Open a worktree by issue identifier (e.g., ENG-123)')
  .action((issue) => {
    render(<WorktreeOpen issueIdentifier={issue} />);
  });

program
  .command('cleanup')
  .description('Remove old worktrees interactively')
  .action(() => {
    render(<WorktreeCleanup />);
  });

// Configuration
const configCmd = program.command('config').description('Manage configuration');

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    render(<Config type="show" />);
  });

configCmd
  .command('set-key <key> <value>')
  .description('Set API key (openrouter or linear)')
  .action((key, value) => {
    if (key !== 'openrouter' && key !== 'linear') {
      console.error('Error: key must be "openrouter" or "linear"');
      process.exit(1);
    }
    render(<Config type="set-key" key={key as 'openrouter' | 'linear'} value={value} />);
  });

configCmd
  .command('set-editor <editor>')
  .description('Set default editor (cursor, vscode, zed)')
  .action((editor) => {
    render(<Config type="set-editor" editor={editor} />);
  });

// Default action: relay "task" or relay ENG-123
program
  .argument('[task]', 'Task description or issue ID (e.g., ENG-123)')
  .option('-r, --repo <name>', 'Repository name')
  .action((task, options) => {
    if (!task) {
      // No arguments, show help
      program.help();
    } else {
      // Check if input looks like an issue ID (e.g., ENG-123, TEAM-456)
      const issueIdPattern = /^[A-Z]+-\d+$/i;
      if (issueIdPattern.test(task)) {
        // Open existing issue
        render(<WorktreeOpen issueIdentifier={task.toUpperCase()} />);
      } else {
        // Create new issue
        render(<CreateIssue task={task} repoName={options.repo} />);
      }
    }
  });

program.parse();
