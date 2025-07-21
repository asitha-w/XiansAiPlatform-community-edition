# XiansAi Platform Community Edition - Documentation

Welcome to the XiansAi Platform Community Edition documentation!

## 📚 Documentation Index

### User Documentation
- **[Main README](../README.md)** - Getting started and quick setup
- **[Contributing Guide](../CONTRIBUTING.md)** - How to contribute to the project

### Developer Documentation
- **[Release Guide](RELEASE_GUIDE.md)** - Complete release process for maintainers

### Process Documentation
- **Release Process**: Automated release management
- **Version Management**: Semantic versioning strategy
- **Testing Guidelines**: Quality assurance practices

## 🚀 Quick Links

### For Users
- [Quick Start Guide](../README.md#-quick-start)
- [Configuration Options](../README.md#-configuration)
- [Access URLs](../README.md#access-the-applications)

### For Contributors
- [Development Setup](../CONTRIBUTING.md#development-setup)
- [Pull Request Guidelines](../CONTRIBUTING.md#pull-request-guidelines)
- [Issue Guidelines](../CONTRIBUTING.md#issue-guidelines)

### For Maintainers
- [Release Process](RELEASE_GUIDE.md#-quick-release-process)
- [Version Strategy](RELEASE_GUIDE.md#-versioning-strategy)
- [Testing Checklist](RELEASE_GUIDE.md#-testing-before-release)

## 📖 Release Documentation

### Release Files Structure
```
releases/
├── v2.1.0.md          # Release notes for v2.1.0 (example)
└── TEMPLATE.md        # Template for new release notes

scripts/
└── create-release-notes.sh  # Helper script for release notes

.github/workflows/
└── release.yml        # Automated release workflow
```

### Release Scripts
- **`./release.sh`** - Main release script
- **`./scripts/create-release-notes.sh`** - Release notes template generator

## 🛠️ Available Scripts

### Platform Management
- `./start-all.sh` - Start the platform
- `./stop-all.sh` - Stop all services
- `./reset-all.sh` - Reset and cleanup

### Release Management
- `./release.sh v2.1.0` - Create a release
- `./scripts/create-release-notes.sh v2.1.0` - Generate release notes template

## 📋 Support

For questions and support:
- **Issues**: [GitHub Issues](https://github.com/flowmaxer-ai/community-edition/issues)
- **Discussions**: [GitHub Discussions](https://github.com/flowmaxer-ai/community-edition/discussions)
- **Documentation**: This documentation directory

---

**Note**: This documentation is continuously updated. Please check for the latest version in the repository. 