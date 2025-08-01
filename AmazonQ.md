# MaPoTypeFu Project Summary

## Overview

MaPoTypeFu is a TypeScript library that provides a simple, type-safe wrapper around the Open Tofu CLI. The library allows developers to script and automate their infrastructure operations with TypeScript while continuing to use their existing `.tf` files.

## Key Components

### Tofu Class

The core of the library is the `Tofu` class, which provides methods to interact with the OpenTofu CLI:

- `init()`: Initialize a working directory
- `plan()`: Generate an execution plan
- `apply()`: Apply the changes
- `destroy()`: Destroy all resources
- `output()`: Get output values

### Implementation Details

- Uses `execa` to execute OpenTofu CLI commands
- Provides type-safe interfaces for all method parameters
- Parses command outputs to provide structured data
- Handles errors and provides meaningful error messages

## Project Structure

```
mapotypefu/
├── src/
│   ├── tofu.ts       # Main Tofu class implementation
│   └── index.ts      # Library exports
├── tests/
│   └── tofu.test.ts  # Tests for the Tofu class
├── examples/
│   ├── basic-usage.ts                # Example usage script
│   └── infrastructure/               # Example OpenTofu configuration
│       └── main.tf                   # Example OpenTofu file
├── docs/
│   ├── api.md        # API documentation
│   └── usage.md      # Usage guide
├── package.json      # Project configuration
├── tsconfig.json     # TypeScript configuration
└── README.md         # Project documentation
```

## Development Approach

1. **Focused Scope**: The library focuses solely on providing a TypeScript wrapper around the OpenTofu CLI, without trying to replace or abstract away OpenTofu's configuration language.

2. **Type Safety**: All interfaces and method parameters are fully typed to provide a good developer experience.

3. **Minimal Dependencies**: The library has minimal dependencies, with `execa` being the only runtime dependency.

4. **Testing**: Comprehensive tests using Jest with mocked CLI interactions.

## Contribution Guidelines

### Commit Requirements

Before submitting any commit to the repository, the following steps must be completed:

1. **Run and pass all tests**:
   ```bash
   pnpm test
   ```

2. **Run lint fix**:
   ```bash
   pnpm run lint
   ```

3. **Ensure successful build**:
   ```bash
   pnpm run build
   ```

**Exception**: Commits that contain ONLY documentation changes (README, docs/, comments) may skip these steps.

### Commit Message Convention

This project uses semantic-release for automatic versioning, which relies on conventional commit messages:

- `fix: message` - For bug fixes (creates a PATCH version)
  - Example: `fix: handle error when OpenTofu is not installed`

- `feat: message` - For new features (creates a MINOR version)
  - Example: `feat: add support for workspace commands`

- `feat!: message` or `fix!: message` - For breaking changes (creates a MAJOR version)
  - Example: `feat!: change API for init method`

- Including `BREAKING CHANGE:` in the commit body also triggers a major version
  - Example: 
    ```
    feat: update output parsing
    
    BREAKING CHANGE: Output format has changed from string to object
    ```

- Other prefixes like `docs:`, `chore:`, `style:`, `refactor:`, `perf:`, `test:` are allowed but don't trigger releases
  - Example: `docs: update API documentation`

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes following the commit requirements above
3. Submit a pull request to `main`
4. Ensure CI checks pass
5. Wait for code review and approval

### Important Note for Amazon Q

Do not commit or push any changes without explicit instruction to do so. Always wait for the user to review changes and specifically request to commit and push.

## Next Steps

- Implement more OpenTofu commands (workspace, state, etc.)
- Add support for workspace management
- Improve error handling and output parsing
- Add more examples for common use cases
- Consider adding a simple CLI wrapper
