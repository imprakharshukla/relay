# Relay CLI 🚀

> AI-powered Linear issue creation with automatic git worktree setup

Relay is a powerful CLI tool that streamlines your development workflow by combining AI-assisted issue creation, Linear integration, and automatic git worktree management. Manage multiple repositories globally from one central database.

## ✨ Features

- 🤖 **AI-Powered Issue Generation**: Uses Grok-4-fast via OpenRouter to analyze your task and create comprehensive Linear issues
- 🗄️ **Global Repository Management**: Centralized SQLite database tracks all your repos and worktrees
- 📋 **Smart Context Awareness**: Automatically selects the right project, labels, and priority
- 🌳 **Automatic Git Worktrees**: Creates isolated worktrees for each issue with Linear-generated branch names
- 💻 **Editor Integration**: Automatically opens your preferred editor (VS Code, Cursor, or Zed)
- ⚡ **Built with Bun**: Lightning-fast startup and execution
- 🎨 **Beautiful CLI UI**: Interactive setup and real-time feedback with Ink
- 🌍 **Work from Anywhere**: No per-directory config needed - manage everything globally

## 📦 Installation

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

## 🚀 Quick Start

### 1. Add Your First Repository

```bash
cd ~/Code/my-app
relay repo add
```

**First time setup includes:**

- OpenRouter API Key (get one at [openrouter.ai](https://openrouter.ai/))
- Linear API Key (get one at [linear.app/settings/api](https://linear.app/settings/api))
- Default editor preference
- Auto-detects your Linear team

**Adds repository with:**

- Repository name (auto-suggests from folder)
- Git repository path
- Worktree base directory

### 2. Create an Issue

From anywhere on your machine:

```bash
relay "fix button styling"
# or
relay create "fix button styling"
```

**Relay will:**

1. ✅ Let you select a repository (if you have multiple)
2. 📊 Fetch Linear context (projects, labels, teams)
3. 🤖 AI analyzes your task
4. 📝 Create detailed Linear issue
5. 🌲 Set up git worktree
6. 🚀 Open your editor

### 3. Open an Existing Issue

```bash
relay ENG-123
# or
relay open ENG-123
```

Opens the worktree for an existing Linear issue instantly.

## 📚 Commands

### Repository Management

```bash
# Add a repository (includes first-time setup)
relay repo add

# List all repositories
relay repo list

# Edit repository settings
relay repo edit my-app --editor cursor
relay repo edit my-app --worktree-base ../worktrees

# Remove a repository
relay repo remove my-app
```

### Issue Creation

```bash
# Create issue (selects repo interactively if multiple)
relay "add dark mode"
relay create "add dark mode"

# Specify repository
relay create "add dark mode" -r my-app
relay create "add dark mode" --repo my-app

# Open existing issue by ID
relay ENG-123
relay open ENG-123
```

### Worktree Management

```bash
# List all worktrees across all repos
relay list

# List worktrees for specific repo
relay list -r my-app
relay list --repo my-app

# Open a worktree by issue ID
relay open ENG-123

# Clean up old worktrees interactively
relay cleanup
```

### Configuration

```bash
# Show current configuration
relay config show

# Update API keys
relay config set-key openrouter sk-or-...
relay config set-key linear lin_api_...

# Change default editor
relay config set-editor cursor
relay config set-editor vscode
relay config set-editor zed
```

## 🏗️ How It Works

### Global Architecture

Relay uses a **centralized SQLite database** (`~/.relay/relay.db`) to manage:

- All your repositories
- Active worktrees across all repos
- API keys and global settings

**No more per-directory configs!** Everything is managed globally.

### Workflow Example

```bash
# Day 1: Setup
cd ~/Code/my-app
relay repo add
# → Sets up API keys, adds my-app

# Day 2: Add another repo
cd ~/Code/another-project
relay repo add
# → Quick add (API keys already configured)

# Day 3: Work from anywhere
cd ~/Downloads
relay "fix login bug"
# → Select repo: my-app
# → Creates issue ENG-123
# → Sets up worktree
# → Opens Cursor

relay list
# → See all your worktrees across all repos

relay open ENG-123
# → Opens that worktree instantly
```

## ⚙️ Configuration

### Global Database

All data stored in `~/.relay/relay.db`:

- API keys (OpenRouter, Linear)
- Default editor preference
- Repository configurations
- Worktree tracking

### Per-Repository Settings

Each repository can have:

- Custom editor (overrides global)
- Custom worktree base path
- Repository-specific metadata

Edit with:

```bash
relay repo edit <name> --editor cursor
```

## 🎯 Advanced Fecladeatures

### AI Model Configuration

The CLI uses `x-ai/grok-4-fast` by default. To use a different model, edit `src/services/ai.ts`:

```typescript
constructor(apiKey: string, model: string = 'x-ai/grok-4-fast') {
```

### Custom Worktree Paths

Per-repository worktree configuration:

```bash
relay repo edit my-app --worktree-base ~/worktrees
```

### Multiple Repositories

Relay is designed for managing multiple projects:

- Each repo has its own settings
- Worktrees are tracked per-repo
- Global view of all work across projects

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT © Prakhar Shukla

## 🙏 Acknowledgments

- Built with [Ink](https://github.com/vadimdemedes/ink) for beautiful CLI UIs
- Powered by [Vercel AI SDK](https://github.com/vercel/ai) and [OpenRouter](https://openrouter.ai/)
- Linear integration via [@linear/sdk](https://github.com/linear/linear)
- Fast builds with [tsdown](https://github.com/sxzz/tsdown)
- Database with [better-sqlite3](https://github.com/WiseLibs/better-sqlite3)

## 💬 Support

- 🐛 [Report a bug](https://github.com/imprakharshukla/relay/issues)
- 💡 [Request a feature](https://github.com/imprakharshukla/relay/issues)
- 📖 [Documentation](https://github.com/imprakharshukla/relay#readme)

---

Made with ❤️ using Bun and TypeScript
