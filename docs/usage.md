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

MaPoTypeFu supports partial backend configuration, allowing you to specify backend settings via files and key-value pairs. You can combine both approaches, where CLI arguments take precedence over file settings.

```typescript
// Using backend configuration files
await tofu.init({ 
  backendConfigFiles: 'backend.hcl' 
});

await tofu.init({ 
  backendConfigFiles: ['backend.hcl', 'secrets.hcl'] 
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

// Combining backend config files with CLI arguments (CLI takes precedence)
await tofu.init({ 
  backendConfigFiles: ['base-config.hcl', 'secrets.hcl'],
  backendConfig: {
    bucket: 'override-bucket',  // This overrides any bucket setting in files
    region: 'us-east-1',        // This overrides any region setting in files
    encrypt: true               // This overrides any encrypt setting in files
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
  backendConfigFiles: 'base-backend.hcl',  // Base configuration from file
  backendConfig: {
    bucket: 'production-terraform-state',   // CLI override
    key: 'infrastructure/terraform.tfstate',
    region: 'us-east-1',                    // CLI override
    encrypt: true                           // CLI override
  },
  pluginDir: ['/opt/terraform-plugins', '/custom/plugins'],
  verifyPlugins: true
});
```

**Backend Configuration Precedence:**

When combining backend config files with CLI arguments:
1. **Backend config files** are processed first (lower precedence)
2. **CLI arguments** are processed second (higher precedence)
3. CLI arguments will **override** any conflicting settings from config files

This allows you to have base configuration in files and override specific settings programmatically.

**Example Backend Configuration Files:**

`base-backend.hcl`:
```hcl
bucket = "default-terraform-state-bucket"
key    = "default/terraform.tfstate"
region = "us-west-2"
encrypt = true
dynamodb_table = "terraform-locks"
```

`secrets.hcl`:
```hcl
access_key = "AKIA..."
secret_key = "..."
```

**Combined Usage Example:**
```typescript
// This will use base-backend.hcl for most settings,
// but override bucket and region via CLI arguments
await tofu.init({ 
  backendConfigFiles: ['base-backend.hcl', 'secrets.hcl'],
  backendConfig: {
    bucket: 'production-state-bucket',  // Overrides bucket from file
    region: 'us-east-1'                 // Overrides region from file
    // encrypt and dynamodb_table will come from base-backend.hcl
    // access_key and secret_key will come from secrets.hcl
  }
});
```

### Variables in Initialization

MaPoTypeFu supports passing variables during initialization, which is particularly useful for parameterized backend configurations and dynamic infrastructure setups.

#### Variable Merging Behavior

Variables can be provided in two places:
1. **Constructor variables**: Set when creating the Tofu instance
2. **Init variables**: Passed to the `init()` method

When both are provided, they are merged with init variables taking precedence over constructor variables.

```typescript
// Constructor variables (base configuration)
const tofu = new Tofu({
  workingDirectory: './infrastructure',
  variables: {
    environment: 'dev',
    region: 'us-east-1',
    instance_type: 't3.micro'
  }
});

// Init with additional/override variables
await tofu.init({
  variables: {
    environment: 'prod',        // Overrides constructor value
    backend_bucket: 'my-state-bucket'  // Additional variable
  }
});

// Final merged variables:
// environment: 'prod' (from init - overrides constructor)
// region: 'us-east-1' (from constructor)
// instance_type: 't3.micro' (from constructor)  
// backend_bucket: 'my-state-bucket' (from init)
```

#### Parameterized Backend Configuration

Variables during initialization are especially powerful for dynamic backend configuration:

```typescript
const environment = process.env.ENVIRONMENT || 'dev';
const region = process.env.AWS_REGION || 'us-west-2';
const accountId = process.env.AWS_ACCOUNT_ID;

const tofu = new Tofu({
  workingDirectory: './infrastructure',
  variables: {
    project_name: 'my-project',
    owner: 'devops-team'
  }
});

// Initialize with environment-specific backend and variables
await tofu.init({
  backendConfig: {
    bucket: `terraform-state-${accountId}-${region}`,
    key: `${environment}/terraform.tfstate`,
    region: region,
    encrypt: true,
    dynamodb_table: `terraform-locks-${environment}`
  },
  variables: {
    environment: environment,
    region: region,
    account_id: accountId,
    // These variables can be used in your .tf files
    state_bucket: `terraform-state-${accountId}-${region}`,
    lock_table: `terraform-locks-${environment}`
  }
});
```

#### Multi-Environment Deployment Example

```typescript
async function deployToEnvironment(env: 'dev' | 'staging' | 'prod') {
  const config = {
    dev: {
      region: 'us-east-1',
      instance_type: 't3.micro',
      min_size: 1,
      max_size: 2
    },
    staging: {
      region: 'us-west-2', 
      instance_type: 't3.small',
      min_size: 2,
      max_size: 4
    },
    prod: {
      region: 'us-west-2',
      instance_type: 't3.medium', 
      min_size: 3,
      max_size: 10
    }
  };

  const tofu = new Tofu({
    workingDirectory: './infrastructure',
    autoApprove: env !== 'prod', // Require manual approval for prod
    variables: {
      project_name: 'my-app',
      environment: env
    }
  });

  await tofu.init({
    backendConfig: {
      bucket: `my-terraform-state-${env}`,
      key: `${env}/terraform.tfstate`,
      region: config[env].region
    },
    variables: {
      ...config[env],
      // Override environment to ensure consistency
      environment: env
    }
  });

  const plan = await tofu.plan();
  console.log(`${env} deployment plan:`, plan.changes);
  
  if (env === 'prod') {
    // Manual approval required for production
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const approved = await new Promise<boolean>((resolve) => {
      readline.question('Apply to production? (yes/no): ', (answer) => {
        readline.close();
        resolve(answer.toLowerCase() === 'yes');
      });
    });
    
    if (!approved) {
      console.log('Production deployment cancelled');
      return;
    }
  }
  
  await tofu.apply();
  console.log(`${env} deployment completed`);
}

// Usage
await deployToEnvironment('dev');
await deployToEnvironment('staging');
await deployToEnvironment('prod');
```

#### Planning with Options

```typescript
// Basic plan
const plan = await tofu.plan();

// Save plan to file
const planWithFile = await tofu.plan({ out: 'tfplan' });

// Use detailed exit code
const detailedPlan = await tofu.plan({ detailed: true });

// Plan with specific variables (merged with constructor variables)
const planWithVars = await tofu.plan({
  variables: {
    environment: 'staging',
    instance_count: 3,
    enable_monitoring: true
  }
});

// Combine all options
const comprehensivePlan = await tofu.plan({
  out: 'production.plan',
  detailed: true,
  variables: {
    environment: 'prod',
    region: 'us-west-2',
    instance_type: 't3.large',
    min_capacity: 5,
    max_capacity: 20
  }
});

console.log(`Plan: ${comprehensivePlan.changes.add} to add, ${comprehensivePlan.changes.change} to change, ${comprehensivePlan.changes.destroy} to destroy`);
```

#### Variable Scenarios for Planning

```typescript
// Scenario 1: Different variables for different plan purposes
const tofu = new Tofu({
  workingDirectory: './infrastructure',
  variables: {
    project_name: 'my-app',
    owner: 'devops-team'
  }
});

// Plan for development environment
const devPlan = await tofu.plan({
  variables: {
    environment: 'dev',
    instance_type: 't3.micro',
    replica_count: 1
  }
});

// Plan for production environment (same Tofu instance, different variables)
const prodPlan = await tofu.plan({
  variables: {
    environment: 'prod',
    instance_type: 't3.large',
    replica_count: 5,
    enable_backup: true
  }
});

// Scenario 2: What-if analysis with different configurations
const baseConfig = {
  environment: 'prod',
  region: 'us-west-2'
};

// Plan with current configuration
const currentPlan = await tofu.plan({
  variables: {
    ...baseConfig,
    instance_type: 't3.medium',
    replica_count: 3
  }
});

// Plan with scaled-up configuration
const scaledPlan = await tofu.plan({
  variables: {
    ...baseConfig,
    instance_type: 't3.large',
    replica_count: 10
  }
});

console.log('Current plan changes:', currentPlan.changes);
console.log('Scaled plan changes:', scaledPlan.changes);

// Scenario 3: Feature flag testing
const featurePlan = await tofu.plan({
  variables: {
    environment: 'staging',
    enable_new_feature: true,
    feature_rollout_percentage: 50
  }
});
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
