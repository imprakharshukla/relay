# Contributing to Relay CLI

Thank you for your interest in contributing to Relay CLI! This document provides guidelines and instructions for contributing.

## Development Setup

1. **Prerequisites**
   - [Bun](https://bun.sh) v1.0+
   - Node.js v18+ (for compatibility testing)
   - Git 2.5+ (for worktree support)
   - OpenRouter API key (for testing AI features)
   - Linear API key (for testing Linear integration)

2. **Clone and Install**
   ```bash
   git clone https://github.com/yourusername/relay-cli.git
   cd relay-cli
   bun install
   ```

3. **Development**
   ```bash
   # Run in development mode
   bun run dev

   # Build
   bun run build

   # Link locally for testing
   bun link
   ```

## Project Structure

```
relay-cli/
├── src/
│   ├── commands/          # CLI command implementations
│   ├── components/        # Ink React components
│   ├── services/          # Core business logic
│   ├── utils/             # Helper functions
│   ├── types/             # TypeScript type definitions
│   └── cli.tsx            # Main entry point
├── dist/                  # Build output (generated)
└── package.json
```

## Code Style

- **TypeScript**: Use TypeScript for all new code
- **Formatting**: Code is formatted with Prettier (if configured)
- **Naming**:
  - Use `camelCase` for variables and functions
  - Use `PascalCase` for React components and types
  - Use descriptive names

## Making Changes

1. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, readable code
   - Add comments for complex logic
   - Update types as needed

3. **Test Your Changes**
   ```bash
   # Build the project
   bun run build

   # Test locally
   relay setup
   relay "test task"
   ```

4. **Commit**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Use conventional commit messages:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `refactor:` - Code refactoring
   - `chore:` - Maintenance tasks

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

   Then open a Pull Request on GitHub.

## Adding New Features

### Adding a New Command

1. Create a new component in `src/commands/`
2. Implement the Ink UI component
3. Register the command in `src/cli.tsx`

Example:
```typescript
// src/commands/list.tsx
import React from 'react';
import { Text } from 'ink';

export const List: React.FC = () => {
  return <Text>List of issues</Text>;
};

// src/cli.tsx
import { List } from './commands/list.js';

program
  .command('list')
  .description('List your issues')
  .action(() => {
    render(<List />);
  });
```

### Adding a New Service

1. Create a new file in `src/services/`
2. Export a class or functions
3. Add types to `src/types/index.ts` if needed

### Adding a New Component

1. Create a new file in `src/components/`
2. Use Ink's React components
3. Export as a React.FC

## Testing

Currently, Relay CLI uses manual testing. Automated tests are welcome!

### Manual Testing Checklist

- [ ] `relay setup` - Complete setup flow
- [ ] `relay "task"` - Create an issue
- [ ] `relay auth status` - Check auth
- [ ] `relay config show` - Show config
- [ ] Test with different editors (vscode, cursor, zed)
- [ ] Test with different teams
- [ ] Test error cases (invalid API keys, no config, etc.)

## Pull Request Guidelines

- **Keep PRs focused**: One feature/fix per PR
- **Update documentation**: Update README.md if you add new features
- **Describe your changes**: Provide a clear PR description
- **Link issues**: Reference related issues in your PR

## Areas for Contribution

Here are some areas where contributions are especially welcome:

1. **Features**
   - Batch issue creation
   - Issue templates
   - Worktree cleanup command
   - Time tracking integration
   - Analytics dashboard

2. **Improvements**
   - Error handling
   - Loading states and animations
   - Better AI prompts
   - Performance optimizations

3. **Documentation**
   - Improve README
   - Add video tutorials
   - Create examples
   - Write blog posts

4. **Bug Fixes**
   - Check the [Issues](https://github.com/yourusername/relay-cli/issues) page

## Questions?

Feel free to:
- Open an issue for questions
- Join discussions in pull requests
- Reach out to maintainers

Thank you for contributing! 🎉
