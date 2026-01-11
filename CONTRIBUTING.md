# Contributing to CodeAtlas

Thank you for your interest in contributing to CodeAtlas! This document provides guidelines and instructions for contributing to the project.

## 🎯 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- VS Code (recommended for extension development)
- Ollama (for local AI testing) or Gemini API key

### Initial Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/CodeAtlas.git
   cd CodeAtlas
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build All Packages**
   ```bash
   npm run build
   ```

4. **Set Up Environment Variables**
   ```bash
   # For web app
   cp packages/web-app/.env.example packages/web-app/.env.local
   # Add your API keys
   
   # For VS Code extension
   cp packages/vscode-extension/.env.example packages/vscode-extension/.env
   # Add your API keys
   ```

## 📁 Project Structure

```
CodeAtlas/
├── packages/
│   ├── core/              # Shared core logic
│   │   ├── src/
│   │   │   ├── diagramGenerator.ts
│   │   │   ├── ollamaClient.ts
│   │   │   ├── geminiClient.ts
│   │   │   └── types.ts
│   │   └── tests/
│   ├── vscode-extension/  # VS Code extension
│   │   ├── src/
│   │   └── docs/
│   └── web-app/          # Next.js web application
│       ├── app/
│       ├── components/
│       └── lib/
├── demo/                 # Demo assets
├── CONTRIBUTING.md
├── CHANGELOG.md
└── README.md
```

## 🔧 Development Workflow

### Running the Project

**Web App (Development Mode)**
```bash
cd packages/web-app
npm run dev
# Open http://localhost:3000
```

**VS Code Extension**
```bash
cd packages/vscode-extension
npm run watch
# Press F5 in VS Code to launch Extension Development Host
```

**Core Package (Build)**
```bash
cd packages/core
npm run build
npm run test
```

### Making Changes

1. **Create a Feature Branch**
   ```bash
   git checkout -b feat/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Branch Naming Convention**
   - `feat/` - New features
   - `fix/` - Bug fixes
   - `docs/` - Documentation updates
   - `refactor/` - Code refactoring
   - `test/` - Test additions/updates
   - `chore/` - Maintenance tasks

3. **Make Your Changes**
   - Write clean, readable code
   - Follow existing code style
   - Add comments for complex logic
   - Update types as needed

4. **Test Your Changes**
   ```bash
   # Run tests
   npm test
   
   # Test with real repositories
   # Web app: Use the UI at localhost:3000
   # Extension: Use the Extension Development Host
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new diagram type for state machines"
   ```

### Commit Message Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples:**
```bash
feat(core): add ER diagram generation support
fix(web-app): resolve diagram rendering issue on mobile
docs: update installation instructions
refactor(extension): simplify file scanning logic
```

## 🎨 Code Style Guidelines

### TypeScript/JavaScript

- Use TypeScript for type safety
- Use `const` for immutable values, `let` for mutable
- Use arrow functions for callbacks
- Use async/await over promises chains
- Add JSDoc comments for public APIs

```typescript
/**
 * Generate multiple diagrams from architecture analysis
 * @param analysis - The architecture analysis result
 * @returns Array of diagrams with different types
 */
static generateAllDiagrams(analysis: ArchitectureAnalysis): Diagram[] {
    // Implementation
}
```

### React/Next.js

- Use functional components with hooks
- Use TypeScript interfaces for props
- Keep components small and focused
- Use meaningful component names

```typescript
interface DiagramViewProps {
    diagram: string;
    title?: string;
}

export default function DiagramView({ diagram, title }: DiagramViewProps) {
    // Implementation
}
```

### File Naming

- React components: `PascalCase.tsx` (e.g., `DiagramView.tsx`)
- Utilities: `camelCase.ts` (e.g., `fileScanner.ts`)
- Types: `types.ts` or `*.types.ts`
- Tests: `*.test.ts` or `*.spec.ts`

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific package
cd packages/core
npm test

# Run tests in watch mode
npm test -- --watch
```

### Writing Tests

- Write unit tests for core logic
- Write integration tests for AI clients
- Test edge cases and error handling
- Mock external dependencies

```typescript
describe('DiagramGenerator', () => {
    it('should generate architecture diagram', () => {
        const analysis = createMockAnalysis();
        const diagrams = DiagramGenerator.generateAllDiagrams(analysis);
        expect(diagrams).toHaveLength(1);
        expect(diagrams[0].type).toBe('architecture');
    });
});
```

## 📝 Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Include parameter descriptions and return types
- Add usage examples for complex functions

### README Updates

- Update README.md when adding new features
- Add screenshots/GIFs for visual features
- Update installation steps if needed

## 🐛 Reporting Bugs

### Before Submitting

1. Check existing issues to avoid duplicates
2. Test with the latest version
3. Gather relevant information

### Bug Report Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Windows 11]
- Node version: [e.g., 18.0.0]
- Package version: [e.g., 1.0.0]

**Screenshots/Logs**
If applicable
```

## 💡 Feature Requests

### Proposing New Features

1. **Open a Discussion** first for major features
2. **Create an Issue** with:
   - Clear description of the feature
   - Use cases and benefits
   - Possible implementation approach
3. **Wait for Feedback** before starting implementation

## 🔍 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] Branch is up to date with main

### Submitting a PR

1. **Push Your Branch**
   ```bash
   git push origin feat/your-feature-name
   ```

2. **Create Pull Request**
   - Use a clear, descriptive title
   - Fill out the PR template
   - Link related issues
   - Add screenshots/GIFs for UI changes

3. **PR Template**
   ```markdown
   ## 🎯 Description
   Brief description of changes
   
   ## 🔗 Related Issues
   Closes #123
   
   ## 📝 Changes
   - Added X feature
   - Fixed Y bug
   - Updated Z documentation
   
   ## 🧪 Testing
   How to test the changes
   
   ## 📸 Screenshots
   (if applicable)
   
   ## ✅ Checklist
   - [ ] Tests pass
   - [ ] Documentation updated
   - [ ] No breaking changes
   ```

### Review Process

1. Automated checks will run
2. Maintainers will review your code
3. Address feedback and make changes
4. Once approved, your PR will be merged

## 🌟 Areas to Contribute

### High Priority

- 🎨 **New Diagram Types**: State diagrams, ER diagrams, deployment diagrams
- 🤖 **AI Improvements**: Better prompts, more AI providers support
- 🎯 **Language Support**: Support for more programming languages
- 📱 **Mobile UI**: Better responsive design for web app

### Good First Issues

Look for issues tagged with `good-first-issue` or `help-wanted`

### Ideas for Contribution

- Improve documentation
- Add more test coverage
- Fix bugs
- Optimize performance
- Add accessibility features
- Translate documentation

## 🛠️ Development Tips

### Debugging

**VS Code Extension**
```typescript
// Use VS Code's built-in debugger
console.log('[CodeAtlas]', data);
```

**Web App**
```bash
# Enable verbose logging
DEBUG=* npm run dev
```

**Core Package**
```typescript
// Add debug logging
logger.info('Processing analysis...', { moduleCount });
```

### Testing with Real Repos

Test your changes with various repository types:
- Small repos (<100 files)
- Medium repos (100-1000 files)
- Different languages (TypeScript, Python, Java, etc.)
- Different architectures (MVC, Layered, Microservices)

## 📞 Getting Help

- **Discord/Slack**: [Join our community](#)
- **Discussions**: Use GitHub Discussions for questions
- **Issues**: For bug reports and feature requests
- **Email**: contact@codeatlas.dev

## 🎉 Recognition

Contributors are recognized in:
- CHANGELOG.md
- GitHub contributors page
- Release notes

Thank you for contributing to CodeAtlas! 🚀
