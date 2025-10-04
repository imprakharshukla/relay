#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { Command } from 'commander';
import { Setup } from './commands/setup.js';
import { Create } from './commands/create.js';
import { hasRequiredKeys, setOpenRouterKey, setLinearKey, getOpenRouterKey, getLinearKey } from './utils/storage.js';
import { loadConfig } from './services/config.js';

const program = new Command();

program
  .name('relay')
  .description('AI-powered Linear issue creation with automatic git worktree setup')
  .version('0.1.0');

// Setup command
program
  .command('setup')
  .description('Configure Relay CLI')
  .action(() => {
    render(<Setup />);
  });

// Create issue command (default)
program
  .argument('[task]', 'Task description')
  .option('-t, --team <key>', 'Team key (e.g., ENG)')
  .action((task, options) => {
    if (!task) {
      console.error('Error: Please provide a task description');
      console.log('Usage: relay "your task description"');
      console.log('   or: relay setup  (to configure)');
      process.exit(1);
    }

    if (!hasRequiredKeys()) {
      console.error('Error: API keys not configured. Please run: relay setup');
      process.exit(1);
    }

    const config = loadConfig();
    if (!config) {
      console.error('Error: No configuration found. Please run: relay setup');
      process.exit(1);
    }

    render(<Create task={task} teamKey={options.team} />);
  });

// Auth commands
const auth = program.command('auth').description('Manage authentication');

auth
  .command('set-openrouter')
  .description('Set OpenRouter API key')
  .argument('<key>', 'OpenRouter API key')
  .action((key) => {
    setOpenRouterKey(key);
    console.log('✓ OpenRouter API key saved');
  });

auth
  .command('set-linear')
  .description('Set Linear API key')
  .argument('<key>', 'Linear API key')
  .action((key) => {
    setLinearKey(key);
    console.log('✓ Linear API key saved');
  });

auth
  .command('status')
  .description('Check authentication status')
  .action(() => {
    const openRouterKey = getOpenRouterKey();
    const linearKey = getLinearKey();

    console.log('Authentication Status:');
    console.log(`  OpenRouter: ${openRouterKey ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`  Linear: ${linearKey ? '✓ Configured' : '✗ Not configured'}`);
  });

// Config commands
const config = program.command('config').description('Manage configuration');

config
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const cfg = loadConfig();
    if (!cfg) {
      console.log('No configuration found. Run: relay setup');
      return;
    }

    console.log('Current Configuration:');
    console.log(`  Repo Base: ${cfg.repoBase}`);
    console.log(`  Worktree Base: ${cfg.worktreeBase}`);
    console.log(`  Editor: ${cfg.editor}`);
    if (cfg.defaultTeam) {
      console.log(`  Default Team: ${cfg.defaultTeam}`);
    }
  });

program.parse();
