# Changelog

All notable changes to CodeAtlas will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### 🎉 Major Release - Multi-Diagram Generation System

This release represents a complete overhaul of the visualization system with comprehensive multi-diagram support, enhanced AI analysis, and significantly improved user experience.

---

## [2.0.0] - 2026-01-11

### ✨ Added

#### Multi-Diagram Generation System
- **Architecture Diagrams**: Component and layered architecture views with professional styling
- **Sequence Diagrams**: Automatic execution flow visualization starting from entry points
- **Class Diagrams**: UML class relationships for object-oriented codebases
- **Data Flow Diagrams**: Visual representation of data movement through systems
- **Flowchart Diagrams**: Control flow and process visualization
- Auto-detection of entry points when not provided by LLM
- Smart diagram type selection based on project structure

#### Enhanced User Interface
- **Tabbed Navigation**: New interface with Diagrams, Overview, and Modules tabs
- **Diagram Type Selector**: Easy switching between multiple diagram views with visual indicators
- **Export Functionality**: 
  - SVG export with Excalidraw compatibility
  - PNG export with 2x quality
  - Mermaid source code export
- **Professional Styling**: 
  - Improved color schemes with semantic colors
  - Better spacing and visual hierarchy
  - Inter font family for better readability
  - Responsive design improvements

#### Core Features
- **FileSelector**: Smart file selection for improved analysis performance
- **Enhanced Type System**: New `Diagram` interface with support for multiple diagram types
- **Test Scripts**: 
  - `test-gemini-models.js` for model comparison
  - `test-llm-validation.js` for endpoint validation
- **Environment Templates**: Added `.env.example` files for easy configuration

#### Documentation
- **Animated GIF Demo**: 21MB optimized demo showing all features
- **Video Demo**: Full demonstration video (demo.mp4.mp4)
- **Contributing Guidelines**: Comprehensive CONTRIBUTING.md
- **Changelog**: Detailed CHANGELOG.md

### 🔧 Fixed

#### Critical Bug Fixes
- **Mermaid Parse Errors**: Fixed "SPACE" token errors by properly escaping node labels and removing problematic multi-line labels
- **JSON Parsing Failures**: 
  - Fixed buffer handling (changed from string concatenation to `Buffer.concat()`)
  - Added truncation detection before parsing attempts
  - Implemented 3-attempt JSON recovery with progressive fixes
- **Token Truncation**: 
  - Increased Ollama token limit from 2,000 to 8,000 (4x increase)
  - Increased Gemini token limit from 8,192 to 65,536 (8x increase)
- **Missing Sequence Diagrams**: Auto-detection ensures diagrams generate even without explicit entry points

#### Performance Improvements
- Better chunk-based analysis for large codebases
- Optimized file scanning with smart selection
- Reduced redundant API calls
- Improved caching strategies

### 🚀 Changed

#### AI Provider Updates
- **Switched to Gemini 2.5-flash**: New default model with 65k output tokens
- **Enhanced Prompts**: Better structured prompts for improved analysis quality
- **Model Configuration**: Unified API key management across all packages

#### Architecture Changes
- Refactored `DiagramGenerator` with modular diagram generation methods
- Improved separation of concerns in diagram generation
- Better error handling and fallback mechanisms
- Enhanced logging throughout the codebase

### 📦 Package Changes

#### @codeatlas/core
- Enhanced `diagramGenerator.ts` with 5+ diagram types
- Improved `ollamaClient.ts` with better JSON parsing and error recovery
- Updated `geminiClient.ts` with increased token limits
- Added `fileSelector.ts` for intelligent file sampling
- Extended `types.ts` with `Diagram` interface

#### @codeatlas/web-app
- Redesigned `ResultsPanel.tsx` with tabbed interface
- Enhanced `DiagramView.tsx` with export options
- Updated `app/api/analyze/route.ts` to generate all diagram types
- Added `.env.example` configuration template
- Improved responsive design across all components

#### @codeatlas/vscode-extension
- Synced diagram generation improvements from core
- Updated type definitions to match core
- Enhanced AI client configurations
- Improved webview integration

### 🔐 Security

- Environment variable templates to prevent credential leaks
- Removed hardcoded API keys from examples
- Added .gitignore rules for sensitive files

### 📊 Statistics

- **17 files changed**
- **+2,507 additions**
- **-1,003 deletions**
- **5 new files created**
- **21MB optimized demo GIF**

---

## [1.0.0] - 2026-01-10

### ✨ Initial Release

#### Core Features
- AI-powered architecture analysis using Ollama and Gemini
- Basic diagram generation with Mermaid.js
- VS Code extension for workspace analysis
- Web application for GitHub repository analysis
- File scanning and context extraction
- Architecture pattern detection

#### Supported Patterns
- MVC (Model-View-Controller)
- Layered Architecture
- Microservices
- Event-Driven
- Client-Server
- Monolithic

#### Components
- `@codeatlas/core`: Shared analysis logic
- `@codeatlas/vscode-extension`: VS Code integration
- `@codeatlas/web-app`: Next.js web application

### 🎯 Initial Capabilities
- Analyze TypeScript/JavaScript codebases
- Generate basic architecture diagrams
- Detect modules and relationships
- Layer-based visualization
- Local analysis with Ollama
- Cloud analysis with Gemini

---

## How to Read This Changelog

### Emoji Legend
- ✨ **Added**: New features
- 🔧 **Fixed**: Bug fixes
- 🚀 **Changed**: Changes in existing functionality
- 📦 **Package Changes**: Specific package updates
- 🔐 **Security**: Security improvements
- 📊 **Statistics**: Metrics and numbers
- 🗑️ **Removed**: Removed features (deprecated)
- 📝 **Documentation**: Documentation updates
- 🎨 **UI/UX**: User interface improvements

### Version Format
- **Major** (X.0.0): Breaking changes or major new features
- **Minor** (0.X.0): New features, backward compatible
- **Patch** (0.0.X): Bug fixes, backward compatible

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute to CodeAtlas.

## Links

- **GitHub**: https://github.com/Time-Open-Source-Foundation/CodeAtlas
- **Issues**: https://github.com/Time-Open-Source-Foundation/CodeAtlas/issues
- **Discussions**: https://github.com/Time-Open-Source-Foundation/CodeAtlas/discussions

---

**Note**: This changelog is automatically updated with each release. For more detailed commit history, please refer to the [GitHub repository](https://github.com/Time-Open-Source-Foundation/CodeAtlas/commits/main).
