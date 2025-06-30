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

- Node.js (v16+)
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

To release a new version of the library:

1. Update the version in package.json:
   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. Create a new release on GitHub:
   - Go to the repository's "Releases" page
   - Click "Draft a new release"
   - Choose the tag that was just created
   - Add release notes
   - Publish the release

3. The GitHub Actions workflow will automatically:
   - Run tests and linting
   - Build the package
   - Publish to npm

Note: You need to set up an NPM_TOKEN secret in your GitHub repository settings. This token should have publish permissions for your npm account.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
