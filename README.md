# Relay CLI

> AI-powered Linear issue creation with automatic git worktree setup

Relay is a powerful CLI tool that streamlines your development workflow by combining AI-assisted issue creation, Linear integration, and automatic git worktree management. Just describe your task in natural language, and Relay handles the rest.

## Features

- **AI-Powered Issue Generation**: Uses Grok-4 via OpenRouter to analyze your task and create comprehensive Linear issues
- **Smart Context Awareness**: Automatically selects the right project, labels, and priority based on your task description
- **Automatic Git Worktrees**: Creates isolated worktrees for each issue with the Linear-generated branch name
- **Interactive Issue Switcher**: Quickly switch between your assigned Linear issues with worktree management
- **Smart Commit Messages**: AI-generated conventional commit messages with co-author detection
- **AI-Powered PR Creation**: Generate comprehensive pull requests with auto-linked Linear issues
- **Editor Integration**: Automatically opens your preferred editor (VS Code, Cursor, or Zed)
- **Built with Bun**: Lightning-fast startup and execution
- **Beautiful CLI UI**: Interactive setup and real-time feedback with Ink

## Installation

### Using Bun (Recommended)

```bash
bun add -g relay-one
```

### Using npm

```bash
npm install -g relay-one
```

### From Source

```bash
git clone https://github.com/imprakharshukla/relay.git
cd relay
bun install
bun run build
bun link
```

## Quick Start

### 1. Setup

Run the interactive setup wizard:

```bash
relay setup
```

You'll be prompted for:
- **OpenRouter API Key**: Get one at [openrouter.ai](https://openrouter.ai/)
- **Linear API Key**: Get one at [linear.app/settings/api](https://linear.app/settings/api)
- **Git Repository Path**: Your project's base directory
- **Worktree Base Path**: Where to create worktrees (e.g., `../worktrees`)
- **Preferred Editor**: Choose between VS Code, Cursor, or Zed

### 2. Create an Issue

Simply describe your task:

```bash
relay "fixing component library button styling"
```

Relay will:
1. Analyze your task with AI
2. Select the appropriate project and labels
3. Create a detailed Linear issue
4. Set up a git worktree
5. Open your editor in the worktree

### 3. Advanced Usage

Specify a team:

```bash
relay "add authentication" --team ENG
```

## Commands

### Main Commands

```bash
# Create an issue (default command)
relay "your task description"
relay "your task" --team TEAMKEY

# Interactive setup
relay setup

# Show version
relay --version

# Show help
relay --help
```

### Workflow Commands

```bash
# Switch between assigned issues
relay switch

# Create a pull request with AI-generated content
relay pr

# Create a commit with AI-generated conventional commit message
relay commit
```

### Authentication

```bash
# Set OpenRouter API key
relay auth set-openrouter sk-or-...

# Set Linear API key
relay auth set-linear lin_api_...

# Check auth status
relay auth status
```

### Configuration

```bash
# Show current configuration
relay config show
```

## How It Works

1. **Context Gathering**: Relay fetches all available teams, projects, and labels from your Linear workspace

2. **AI Analysis**: Using Grok-4-fast (or your chosen model), Relay analyzes your task description and generates:
   - A concise, action-oriented title
   - Comprehensive description with acceptance criteria
   - Best matching project
   - Relevant labels (2-5)
   - Appropriate priority level

3. **Issue Creation**: The AI-generated issue is created in Linear with all metadata

4. **Worktree Setup**: A new git worktree is created using Linear's branch name format

5. **Editor Launch**: Your configured editor opens automatically in the new worktree

## Workflow Commands

### Switch Between Issues

```bash
relay switch
```

Interactively switch between your assigned Linear issues:
- Fetches all issues assigned to you
- Displays them in an interactive list
- Checks if a worktree already exists for the selected issue
- Creates a new worktree if needed or switches to the existing one
- Opens your configured editor in the worktree

Perfect for quickly jumping between multiple tasks!

### Create Pull Requests

```bash
relay pr
```

AI-powered pull request creation:
- Analyzes all commits on your current branch
- Generates a comprehensive PR title and description
- Automatically links the Linear issue from your branch name
- Suggests reviewers based on file history
- Creates the PR via GitHub CLI

Requires [GitHub CLI](https://cli.github.com/) to be installed and authenticated.

### Smart Commits

```bash
relay commit
```

AI-generated conventional commit messages:
- Analyzes your staged changes
- Generates a conventional commit message (feat, fix, refactor, etc.)
- Automatically detects co-authors from file history
- Links the Linear issue from your branch name
- Shows a preview before committing

Make sure to stage your changes with `git add` before running this command.

## Configuration

Configuration is stored in `.relay/relay-config.json` at your repository root:

```json
{
  "repoBase": "/path/to/your/repo",
  "editor": "cursor",
  "worktreeBase": "../worktrees",
  "defaultTeam": "TEAM-ID"
}
```

API keys are stored securely in your system's configuration directory using [conf](https://github.com/sindresorhus/conf).

## Development

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- Node.js v18+ (for compatibility)
- Git 2.5+ (for worktree support)

### Setup

```bash
# Clone the repository
git clone https://github.com/imprakharshukla/relay.git
cd relay

# Install dependencies
bun install

# Run in development mode
bun run dev

# Build
bun run build

# Link locally
bun link
```

### Project Structure

```
relay-cli/
├── src/
│   ├── commands/          # Command implementations
│   │   ├── create.tsx     # Issue creation flow
│   │   ├── setup.tsx      # Setup wizard
│   │   ├── pr.tsx         # PR creation
│   │   ├── switch.tsx     # Issue switcher
│   │   └── commit.tsx     # Smart commits
│   ├── components/        # Ink UI components
│   │   ├── Spinner.tsx
│   │   └── IssuePreview.tsx
│   ├── services/          # Core services
│   │   ├── ai.ts          # OpenRouter/AI integration
│   │   ├── linear.ts      # Linear API wrapper
│   │   ├── git.ts         # Git worktree operations
│   │   ├── pr.ts          # PR generation
│   │   ├── config.ts      # Config management
│   │   └── editor.ts      # Editor launcher
│   ├── utils/             # Utilities
│   │   ├── storage.ts     # Secure key storage
│   │   └── validation.ts  # Input validation
│   ├── types/             # TypeScript types
│   └── cli.tsx            # CLI entry point
├── package.json
├── tsconfig.json
└── tsdown.config.ts
```

## API Keys

### OpenRouter

1. Visit [openrouter.ai](https://openrouter.ai/)
2. Sign up or log in
3. Go to API Keys section
4. Create a new key
5. Add credits to your account

### Linear

1. Go to [linear.app/settings/api](https://linear.app/settings/api)
2. Create a new Personal API Key
3. Copy the key (starts with `lin_api_`)

## Roadmap

- [ ] **Batch Issue Creation**: Create multiple related issues from one description
- [ ] **Issue Templates**: Define custom templates for different issue types
- [ ] **AI Chat Mode**: Interactive chat for refining issues
- [ ] **Time Tracking**: Auto-start Linear time tracking
- [ ] **Analytics**: View your productivity metrics
- [ ] **Custom AI Models**: Support for different LLMs
- [ ] **Issue Linking**: Auto-link related issues
- [ ] **Worktree Cleanup**: Interactive cleanup of old worktrees

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgments

- Built with [Ink](https://github.com/vadimdemedes/ink) for beautiful CLI UIs
- Powered by [Vercel AI SDK](https://github.com/vercel/ai) and [OpenRouter](https://openrouter.ai/)
- Linear integration via [@linear/sdk](https://github.com/linear/linear)
- Fast builds with [tsdown](https://github.com/sxzz/tsdown)

## Support

- [Report a bug](https://github.com/imprakharshukla/relay/issues)
- [Request a feature](https://github.com/imprakharshukla/relay/issues)
- [Documentation](https://github.com/imprakharshukla/relay#readme)

---

Made by Prakhar Shukla
