# @flowtorio/flow

The Flow application - a terminal-based workspace for developer tools.

Fast, keyboard-driven interface for Jira, Bitbucket, GitHub, and more.

## Installation

```bash
pnpm install -g @flowtorio/flow
```

## Usage

```bash
flow
```

### Keybindings

**Normal Mode:**
- `r` - Reload Jira issues
- `/` - Enter Command mode
- `f` - Enter Select mode
- `o` - Open selected issue in browser
- `q`, `Ctrl+C`, `Ctrl+D` - Exit

**Command Mode:**
- Type commands like: `reload`, `search`, `filter`
- `ESC` - Back to Normal mode
- `ENTER` - Execute command

**Select Mode:**
- Press marker keys (`a-z`) to select items
- `ESC` - Back to Normal mode

## Configuration

Create a `.flowrc` file or set environment variables:

```bash
export JIRA_HOST="https://your-company.atlassian.net"
export JIRA_EMAIL="your@email.com"
export JIRA_TOKEN="your-api-token"
```

