# Contributing to WispChat Referral System

Thank you for your interest in contributing to the WispChat Referral System for Easy Access Newtelecom!

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/wispchat-referral-system.git
   cd wispchat-referral-system
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file:
   ```bash
   cp .env.example .env
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Development Guidelines

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Add comments for complex logic
- Follow existing code patterns

### Commit Messages

Use clear and descriptive commit messages:
- `feat: Add new feature`
- `fix: Fix bug in user registration`
- `docs: Update API documentation`
- `refactor: Improve code structure`
- `test: Add tests for referral logic`

### Branch Naming

- `feature/your-feature-name`
- `fix/bug-description`
- `docs/documentation-update`

## Testing

Before submitting a PR:

1. Test your changes manually
2. Run the demo script:
   ```bash
   npm start  # In one terminal
   ./demo.sh  # In another terminal
   ```

3. Ensure no errors in the console

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the API_DOCS.md if you change API endpoints
3. Ensure your code has no syntax errors
4. Create a Pull Request with a clear description

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Code refactoring

## Testing
How did you test your changes?

## Related Issues
Closes #(issue number)
```

## Code Review

All submissions require review. We'll review your PR and may request changes.

## Feature Requests

For major changes, please open an issue first to discuss what you'd like to change.

## Questions?

Feel free to open an issue with the `question` label.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
