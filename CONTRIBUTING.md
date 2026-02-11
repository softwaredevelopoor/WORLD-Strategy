# Contributing to WORLD Strategy

Thank you for your interest in contributing to WORLD Strategy! This document outlines the process and guidelines.

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). All contributors are expected to follow this code.

## How to Contribute

### Reporting Issues

1. Check [existing issues](https://github.com/softwaredevelopoor/WORLD-Strategy/issues) first
2. Include:
   - Clear description of the issue
   - Steps to reproduce
   - Expected vs. actual behavior
   - System info (OS, Node version, etc.)
3. Label appropriately: `bug`, `feature`, `docs`, etc.

### Feature Requests

1. Open a discussion or issue with title: `[FEATURE] <description>`
2. Explain the use case and proposed solution
3. Link any relevant issues or context

### Code Contributions

#### Setup

```bash
git clone https://github.com/softwaredevelopoor/WORLD-Strategy.git
cd WORLD-Strategy
pnpm install

# Create feature branch
git checkout -b feature/your-feature-name
```

#### Development

- Use TypeScript. No JavaScript in the source.
- Follow the existing code structure and naming conventions.
- Add tests for new functionality.
- Update docs if APIs or behaviors change.

#### Testing

```bash
# Unit tests
pnpm test

# Keeper Integration tests
cd keeper && pnpm test:integration

# Program (Anchor) tests
cd program && anchor test
```

#### Building

```bash
# Keeper
cd keeper && pnpm build

# Program
cd program && anchor build

# Dashboard
cd dashboard && pnpm build
```

#### Submitting a PR

1. **Commit messages**: Clear, atomic commits
   ```
   feat: add allocation cooldown timer
   fix: resolve oracle price staleness
   docs: update nav methodology
   ```

2. **PR Description**: Use the template in `.github/`
   - Describe what and why
   - Reference related issues
   - Mention any breaking changes

3. **Review**: Expect 1-2 reviewers; address feedback

4. **Merge**: PR is merged to `main` after approval and CI passes

## Development Workflow

### Keeper Bot

```bash
cd keeper
pnpm dev              # Run in DRY_RUN=true
pnpm test            # Unit tests
pnpm build           # Compile
```

### Smart Contract (Solana/Anchor)

```bash
cd program
anchor test          # Run tests against local validator
anchor build         # Compile
anchor deploy        # Deploy (requires keys)
```

### Dashboard

```bash
cd dashboard
pnpm dev             # Dev server at http://localhost:3000
pnpm test            # Jest tests
pnpm build           # Build for production
```

## Documentation Standards

- Use Markdown
- Include code examples where helpful
- Keep sentences clear and concise
- Update README.md if user-facing changes
- Add comments to complex logic

## Git Workflow

- `main` branch is always stable
- Feature branches off `main`
- Rebase before PR (or squash on merge if messy)
- No force-pushing to `main`

## Questions?

- Open an issue with `[QUESTION]` prefix
- Check [faq.md](docs/faq.md)
- Reach out on Discord/Twitter (add links)

---

Thank you for making WORLD Strategy better! 🌍
