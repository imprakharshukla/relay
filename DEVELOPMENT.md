# Development Guide

## Local Development Setup

### 1. Link the CLI Globally

Link the package globally for local testing:

```bash
bun link
```

This creates a global symlink to your local package, so you can run `relay` from anywhere and it will use your local development version.

### 2. Development Workflows

#### Option A: Direct Run (No Build Required)

Run the CLI directly from source with Bun:

```bash
# Run once
bun run dev

# Run with watch mode (auto-restarts on file changes)
bun run dev:watch
```

Or run directly:

```bash
# Run the CLI with Bun (bypasses build)
bun run src/cli.tsx setup
bun run src/cli.tsx "your task"
```

#### Option B: Build + Watch Mode

Build the project and watch for changes:

```bash
# Build once
bun run build

# Build and watch for changes
bun run build:watch
```

Then in another terminal:

```bash
# Test the built CLI
relay setup
relay "your task"
```

### 3. Quick Test Cycle

After linking, the fastest development cycle is:

**Terminal 1:**
```bash
# Watch and rebuild on changes
bun run build:watch
```

**Terminal 2:**
```bash
# Test your changes
relay "test task"
```

Or for even faster iteration (no build step):

```bash
# Just run directly with Bun
bun run src/cli.tsx "test task"
```

### 4. Unlink When Done

When you're done with development:

```bash
bun unlink
```

## Development Tips

### Testing Changes Quickly

1. **No rebuild needed**: Use `bun run src/cli.tsx` to test changes immediately
2. **With rebuild**: Use `bun run build:watch` + `relay` command in another terminal
3. **Check types**: Use your IDE's TypeScript checking

### Debugging

Add console logs or use Bun's debugger:

```bash
bun --inspect run src/cli.tsx "test"
```

### Common Commands

```bash
# Install dependencies
bun install

# Run from source
bun run dev

# Build
bun run build

# Build and watch
bun run build:watch

# Link globally
bun link

# Unlink
bun unlink

# Test the built CLI
relay --help
```

## Project Structure

```
relay/
├── src/
│   ├── cli.tsx          # Entry point
│   ├── commands/        # Command implementations
│   ├── components/      # Ink UI components
│   ├── services/        # Business logic
│   ├── utils/           # Helpers
│   └── types/           # TypeScript types
├── dist/                # Built output
└── package.json
```
