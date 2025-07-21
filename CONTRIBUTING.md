# Contributing to XiansAi Platform Community Edition

Thank you for your interest in contributing to the XiansAi Platform! This document provides guidelines for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Process](#contributing-process)
- [Release Process](#release-process)
- [Issue Guidelines](#issue-guidelines)
- [Pull Request Guidelines](#pull-request-guidelines)

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. We are committed to providing a welcoming and inspiring community for all.

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose
- Git
- GitHub account
- Basic understanding of the XiansAi platform

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/community-edition.git
   cd community-edition
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/flowmaxer-ai/community-edition.git
   ```
4. **Start the platform**:
   ```bash
   ./start-all.sh
   ```

## 🔄 Contributing Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and test thoroughly

3. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub

## 🚢 Release Process

### For Maintainers

The release process is automated using our release scripts:

#### 1. Prepare Release Notes

```bash
# Create release notes template
./scripts/create-release-notes.sh v2.1.0

# Edit the generated file: ./releases/v2.1.0.md
```

#### 2. Run Release Script

```bash
# Test the release process
./release.sh v2.1.0 --dry-run

# Create actual release
./release.sh v2.1.0
```

#### 3. Release Types

- **Stable Release**: `./release.sh v2.1.0`
- **Pre-release**: `./release.sh v2.1.0-beta.1 --prerelease`
- **Draft Release**: `./release.sh v2.1.0 --draft`

### Release Checklist

- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Breaking changes are documented
- [ ] Migration guide is provided (if needed)
- [ ] Docker images are tested
- [ ] Release notes are comprehensive
- [ ] Version follows semantic versioning

### Versioning Guidelines

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version: Incompatible API changes
- **MINOR** version: New functionality (backward compatible)
- **PATCH** version: Bug fixes (backward compatible)
- **Pre-release**: Alpha, beta, or release candidate versions

## 🐛 Issue Guidelines

### Before Creating an Issue

1. **Search existing issues** to avoid duplicates
2. **Check the documentation** and troubleshooting guides
3. **Test with the latest version**

### Creating Good Issues

- **Use descriptive titles**
- **Provide context and environment details**
- **Include steps to reproduce**
- **Add relevant logs and screenshots**
- **Use appropriate labels**

### Issue Templates

- **Bug Report**: For reporting bugs and unexpected behavior
- **Feature Request**: For suggesting new features or improvements
- **Documentation**: For documentation improvements
- **Question**: For support and general questions

## 🔧 Pull Request Guidelines

### Before Submitting

- [ ] Code follows project conventions
- [ ] Tests pass locally
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] No merge conflicts with main branch

### PR Requirements

- **Descriptive title and description**
- **Link to related issues**
- **Test coverage for new features**
- **Documentation updates**
- **Screenshots for UI changes**

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat: add new authentication method
fix: resolve Docker startup issue
docs: update README with new features
chore: update dependencies
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation updates
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/updates
- `chore`: Maintenance tasks

## 🧪 Testing

### Local Testing

```bash
# Start the platform
./start-all.sh

# Run specific tests (if available)
# Add your testing commands here

# Test different configurations
./start-all.sh -v v2.1.0 -e staging
```

### Testing Releases

```bash
# Test release process
./release.sh v2.1.0 --dry-run

# Test with specific version
./start-all.sh -v v2.1.0
```

## 📝 Documentation

### Documentation Standards

- **Clear and concise** language
- **Code examples** for technical content
- **Screenshots** for UI features
- **Step-by-step** instructions
- **Updated** with each change

### Types of Documentation

- **README**: Project overview and quick start
- **API Documentation**: Endpoint documentation
- **User Guides**: Feature usage instructions
- **Developer Guides**: Technical implementation details
- **Release Notes**: Change documentation

## 🏷️ Labels and Milestones

### Common Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements or additions to docs
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed
- `question`: Further information is requested

### Milestones

- Used for organizing issues and PRs by release version
- Help track progress towards release goals

## 🎯 Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For questions and community discussions
- **Documentation**: Check existing docs and guides

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to the XiansAi Platform Community Edition! 🎉 