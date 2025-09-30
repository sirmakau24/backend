# Contributing to Af-Text Backend

Thank you for your interest in contributing to Af-Text! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/aftext.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit: `git commit -m "Add your feature"`
7. Push: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your local configuration
npm run dev
```

## Code Style

- Use TypeScript for all new code
- Follow existing code formatting
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Commit Messages

Use clear and descriptive commit messages:

- `feat: Add new feature`
- `fix: Fix bug in authentication`
- `docs: Update API documentation`
- `refactor: Improve code structure`
- `test: Add unit tests`
- `chore: Update dependencies`

## Pull Request Guidelines

- Provide clear description of changes
- Reference related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Update documentation if needed
- Keep PRs focused on a single feature/fix

## Testing

```bash
# Run tests (when implemented)
npm test

# Run linter
npm run lint
```

## Reporting Issues

When reporting issues, include:

- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version, etc.)
- Error messages and logs

## Feature Requests

We welcome feature requests! Please:

- Check if feature already exists or is planned
- Provide clear use case
- Explain expected behavior
- Consider implementation complexity

## Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

## Questions?

Feel free to open an issue for questions or discussions.

Thank you for contributing! 🎉
