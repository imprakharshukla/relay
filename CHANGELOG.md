## [3.0.0](https://github.com/imprakharshukla/relay/compare/v2.0.0...v3.0.0) (2025-10-05)

### ⚠ BREAKING CHANGES

* Database queries now use Drizzle ORM

Changes:
- Add Drizzle ORM and better-sqlite3 dependencies
- Create Drizzle schema with type-safe table definitions
- Update all database queries to use Drizzle ORM syntax
- Change shebang back to #!/usr/bin/env node
- Update field names to camelCase (worktreeBase, repoId, etc.)
- Add better-sqlite3 and drizzle-orm to external dependencies

Benefits:
- Works with both Node.js and Bun runtimes
- Type-safe database queries with IntelliSense
- Better developer experience with Drizzle ORM
- Eliminates Bun-specific dependencies

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>

### Features

* migrate to Drizzle ORM for cross-runtime compatibility ([c07860f](https://github.com/imprakharshukla/relay/commit/c07860fe68b9c6151fa8d32e9ef8d790c2cf841d))

## [2.0.0](https://github.com/imprakharshukla/relay/compare/v1.4.0...v2.0.0) (2025-10-05)

### ⚠ BREAKING CHANGES

* CLI now requires Bun runtime to run

- Replace better-sqlite3 with bun:sqlite to eliminate native binding issues
- Update all database queries from db.prepare() to db.query()
- Change shebang from node to bun
- Add bun:sqlite to external dependencies in tsdown config
- Remove better-sqlite3 and @types/better-sqlite3 from dependencies

This fixes the "Could not locate the bindings file" error when installing
the package globally with bun add -g relay-one.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>

### Bug Fixes

* replace better-sqlite3 with bun:sqlite for global package compatibility ([2038bfc](https://github.com/imprakharshukla/relay/commit/2038bfc77b836c5a42b39e862d4e43cf5bfe5088))

## [1.4.0](https://github.com/imprakharshukla/relay/compare/v1.3.0...v1.4.0) (2025-10-05)

### Features

* refactor to global repository management with SQLite database ([5d81ecc](https://github.com/imprakharshukla/relay/commit/5d81eccecfc7148659d69e758146c9670eae988c))

## [1.3.0](https://github.com/imprakharshukla/relay/compare/v1.2.0...v1.3.0) (2025-10-04)

### Features

* add startup scripts support for worktree initialization ([5a67edf](https://github.com/imprakharshukla/relay/commit/5a67edf5a874616403f5b620e56d738847e8be81))

## [1.2.0](https://github.com/imprakharshukla/relay/compare/v1.1.0...v1.2.0) (2025-10-04)

### Features

* support opening existing issues by ID (e.g., relay ENG-123) ([9a322dc](https://github.com/imprakharshukla/relay/commit/9a322dca7f2d4f1d341bad809a384ae39d425bfc))

## [1.1.0](https://github.com/imprakharshukla/relay/compare/v1.0.1...v1.1.0) (2025-10-04)

### Features

* auto-assign issues to current user and remove AI-generated descriptions ([61292c0](https://github.com/imprakharshukla/relay/commit/61292c07c7ee087fd86de28c34403c633ac4d9dd))

## [1.0.1](https://github.com/imprakharshukla/relay/compare/v1.0.0...v1.0.1) (2025-10-04)

### Bug Fixes

* add ms dependency for build ([1a61ab0](https://github.com/imprakharshukla/relay/commit/1a61ab0d29ce91cd4e0491f1bf101fa19df8764d))

## 1.0.0 (2025-10-04)

### Features

* add markdown rendering and base branch selection ([f8bc486](https://github.com/imprakharshukla/relay/commit/f8bc48653e22d158756e5154649063c72389a894))
* **commands:** add switch, commit, and pr with AI features ([4ddfbb5](https://github.com/imprakharshukla/relay/commit/4ddfbb5ddfbe17ccc654b0f35dd6770a611db01f))

### Bug Fixes

* replace ink-markdown with custom formatter ([0b782e3](https://github.com/imprakharshukla/relay/commit/0b782e3a1be1bb40bb692934d75776c9a5e758b6))
