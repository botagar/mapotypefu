# MaPoTypeFu Usage Guide

This guide explains how to use MaPoTypeFu with your existing OpenTofu configurations.

## Prerequisites

- OpenTofu CLI installed and available in your PATH
- Node.js and npm/pnpm/yarn
- TypeScript project setup

## Installation

```bash
npm install mapotypefu
# or
pnpm add mapotypefu
# or
yarn add mapotypefu
```

## Basic Usage

MaPoTypeFu is designed to work alongside your existing OpenTofu files. It provides a type-safe wrapper around the OpenTofu CLI.

### Initializing the Tofu Client

```typescript
import { Tofu } from 'mapotypefu';

// Create a new Tofu client
const tofu = new Tofu({
  workingDirectory: './infrastructure', // Directory containing your .tf files
  autoApprove: false, // Whether to auto-approve apply/destroy operations
  variables: {
    // Variables to pass to OpenTofu
    environment: 'dev',
    region: 'us-west-2'
  }
});
```

### Basic OpenTofu Operations

```typescript
// Initialize the working directory
await tofu.init();

// Generate a plan
const plan = await tofu.plan();
console.log(`Changes: ${plan.changes.add} to add, ${plan.changes.change} to change, ${plan.changes.destroy} to destroy`);

// Apply changes
const applyResult = await tofu.apply();
console.log(applyResult);

// Get outputs
const outputs = await tofu.output({ json: true });
console.log('Outputs:', outputs);

// Destroy resources
await tofu.destroy();
```

### Advanced Options

#### Initialization with Options

```typescript
// Initialize with upgrade flag
await tofu.init({ upgrade: true });

// Initialize with reconfigure flag
await tofu.init({ reconfigure: true });
```

#### Backend Configuration

MaPoTypeFu supports partial backend configuration, allowing you to specify backend settings via files or key-value pairs:

```typescript
// Using a backend configuration file
await tofu.init({ 
  backendConfig: 'backend.hcl' 
});

// Using multiple backend configuration files
await tofu.init({ 
  backendConfig: ['backend.hcl', 'secrets.hcl'] 
});

// Using key-value pairs for S3 backend
await tofu.init({ 
  backendConfig: {
    bucket: 'my-terraform-state-bucket',
    key: 'prod/terraform.tfstate',
    region: 'us-west-2',
    encrypt: true,
    dynamodb_table: 'terraform-locks'
  }
});

// Using key-value pairs for Azure backend
await tofu.init({ 
  backendConfig: {
    storage_account_name: 'mystorageaccount',
    container_name: 'tfstate',
    key: 'prod.terraform.tfstate',
    resource_group_name: 'myresourcegroup'
  }
});

// Using key-value pairs for GCS backend
await tofu.init({ 
  backendConfig: {
    bucket: 'my-gcs-bucket',
    prefix: 'terraform/state',
    credentials: 'path/to/service-account.json'
  }
});

// Initialize without backend (local state)
await tofu.init({ 
  backend: false 
});

// Initialize with custom plugin directory
await tofu.init({ 
  pluginDir: '/custom/plugins',
  verifyPlugins: false
});

// Complete initialization with all options
await tofu.init({ 
  upgrade: true,
  reconfigure: true,
  backendConfig: {
    bucket: 'production-terraform-state',
    key: 'infrastructure/terraform.tfstate',
    region: 'us-east-1',
    encrypt: true
  },
  pluginDir: ['/opt/terraform-plugins', '/custom/plugins'],
  verifyPlugins: true
});
```

**Example Backend Configuration Files:**

`backend.hcl`:
```hcl
bucket = "my-terraform-state-bucket"
key    = "prod/terraform.tfstate"
region = "us-west-2"
encrypt = true
dynamodb_table = "terraform-locks"
```

`secrets.hcl`:
```hcl
access_key = "AKIA..."
secret_key = "..."
```

#### Planning with Options

```typescript
// Save plan to file
const plan = await tofu.plan({ out: 'tfplan' });

// Use detailed exit code
const detailedPlan = await tofu.plan({ detailed: true });
```

#### Applying a Saved Plan

```typescript
// Apply a previously saved plan
await tofu.apply({ planFile: 'tfplan' });
```

#### Working with Outputs

```typescript
// Get all outputs as JSON
const allOutputs = await tofu.output({ json: true });

// Get a specific output
const specificOutput = await tofu.output({ name: 'vpc_id' });
```

## Integration with Existing OpenTofu Workflow

MaPoTypeFu is designed to complement your existing OpenTofu workflow, not replace it. You'll still write and maintain your `.tf` files as usual, but you can use MaPoTypeFu to:

1. Script OpenTofu operations
2. Integrate OpenTofu into your TypeScript applications
3. Create custom deployment workflows
4. Add type safety to your infrastructure scripts

## Example: Complete Deployment Script

```typescript
import { Tofu } from 'mapotypefu';
import * as fs from 'fs';
import * as path from 'path';

async function deploy(environment: string) {
  // Create environment-specific variables
  const variables = {
    environment,
    region: environment === 'prod' ? 'us-west-2' : 'us-east-1',
    instance_type: environment === 'prod' ? 'm5.large' : 't3.medium'
  };
  
  // Initialize Tofu client
  const tofu = new Tofu({
    workingDirectory: path.join(__dirname, 'infrastructure'),
    variables,
    autoApprove: environment !== 'prod' // Require manual approval for prod
  });
  
  try {
    // Initialize
    await tofu.init();
    
    // Generate plan
    const plan = await tofu.plan();
    console.log(`Plan: ${plan.changes.add} to add, ${plan.changes.change} to change, ${plan.changes.destroy} to destroy`);
    
    // For production, require manual confirmation
    if (environment === 'prod') {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      await new Promise<void>((resolve) => {
        readline.question('Do you want to apply these changes? (yes/no): ', (answer: string) => {
          readline.close();
          if (answer.toLowerCase() !== 'yes') {
            console.log('Deployment cancelled');
            process.exit(0);
          }
          resolve();
        });
      });
    }
    
    // Apply changes
    console.log('Applying changes...');
    const result = await tofu.apply();
    console.log(result);
    
    // Get and save outputs
    const outputs = await tofu.output({ json: true });
    fs.writeFileSync(
      path.join(__dirname, `outputs-${environment}.json`),
      JSON.stringify(outputs, null, 2)
    );
    
    console.log(`Deployment to ${environment} completed successfully`);
    return outputs;
  } catch (error) {
    console.error(`Deployment failed: ${error.message}`);
    throw error;
  }
}

// Run the deployment
deploy(process.argv[2] || 'dev').catch(() => process.exit(1));
```

## Best Practices

1. **Keep your .tf files in version control** - MaPoTypeFu doesn't replace the need for version-controlled infrastructure code
2. **Use workspaces for environment isolation** - Consider using OpenTofu workspaces for managing multiple environments
3. **Handle errors properly** - OpenTofu operations can fail, so make sure to handle errors appropriately
4. **Store state securely** - Use remote state storage (S3, Azure Blob, etc.) for your OpenTofu state files
5. **Automate with caution** - Be careful when automating destructive operations like `destroy`
