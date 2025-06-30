# MaPoTypeFu

A TypeScript library wrapper for Open Tofu CLI, providing a type-safe way to interact with your infrastructure as code.

## Overview

MaPoTypeFu provides a simple, type-safe wrapper around the Open Tofu CLI, allowing developers to script and automate their infrastructure operations with TypeScript while continuing to use their existing `.tf` files.

## Features

- Type-safe wrapper around Open Tofu CLI
- Simple API for common Open Tofu operations (init, plan, apply, destroy)
- TypeScript support for improved developer experience
- Works with your existing .tf files

## Installation

```bash
npm install mapotypefu
```

## Usage

```typescript
import { Tofu } from 'mapotypefu';

// Initialize a new OpenTofu project
const tofu = new Tofu({
  workingDirectory: './infrastructure',
  variables: {
    environment: 'dev',
    region: 'us-west-2'
  }
});

// Run OpenTofu operations
async function deployInfrastructure() {
  // Initialize the working directory
  await tofu.init();
  
  // Generate a plan
  const plan = await tofu.plan();
  console.log(`Changes: ${plan.changes.add} to add, ${plan.changes.change} to change, ${plan.changes.destroy} to destroy`);
  
  // Apply the changes
  const result = await tofu.apply();
  console.log(result);
  
  // Get outputs
  const outputs = await tofu.output({ json: true });
  console.log('Outputs:', outputs);
}

deployInfrastructure().catch(console.error);
```

## API

### Tofu Class

The main class for interacting with the OpenTofu CLI.

#### Constructor

```typescript
new Tofu(options?: TofuOptions)
```

Options:
- `workingDirectory`: Directory containing your .tf files (default: '.')
- `autoApprove`: Whether to auto-approve apply/destroy operations (default: false)
- `variables`: Variables to pass to OpenTofu
- `tofuPath`: Path to the OpenTofu executable (default: 'tofu')

#### Methods

- `init(options?)`: Initialize a working directory
- `plan(options?)`: Generate an execution plan
- `apply(options?)`: Apply the changes
- `destroy()`: Destroy all resources
- `output(options?)`: Get output values

## Development

### Prerequisites

- Node.js (v22+)
- TypeScript
- Open Tofu installed locally

### Setup

```bash
git clone https://github.com/botagar/mapotypefu.git
cd mapotypefu
npm install
npm run build
```

### Releasing a New Version

This project uses semantic-release for automatic versioning and publishing. New versions are automatically created based on commit messages:

- `fix: message` - Creates a patch release (e.g., 1.0.0 → 1.0.1)
- `feat: message` - Creates a minor release (e.g., 1.0.0 → 1.1.0)
- `feat!: message` or `fix!: message` or including `BREAKING CHANGE:` in the commit body - Creates a major release (e.g., 1.0.0 → 2.0.0)

When commits are pushed to the main branch, the CI workflow will:
1. Run tests and linting
2. Build the package
3. Analyze commit messages
4. Create a new GitHub release with appropriate version number
5. Generate release notes
6. Publish to npm

Note: You need to set up an NPM_TOKEN secret in your GitHub repository settings. This token should have publish permissions for your npm account.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
