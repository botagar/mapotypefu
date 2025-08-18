/**
 * Example demonstrating parameterized backend configuration using variables during init
 * 
 * This example shows how to use variables during initialization for dynamic backend configuration,
 * which is particularly useful for multi-environment deployments where backend parameters
 * need to be determined at runtime.
 */

import { Tofu } from '../src';
import * as path from 'path';

async function deployWithDynamicBackend() {
  // Environment-specific configuration
  const environment = process.env.ENVIRONMENT || 'dev';
  const region = process.env.AWS_REGION || 'us-west-2';
  const accountId = process.env.AWS_ACCOUNT_ID || '123456789012';
  
  // Create Tofu instance with base variables
  const tofu = new Tofu({
    workingDirectory: path.join(__dirname, 'infrastructure'),
    variables: {
      // Base variables that are always needed
      project_name: 'my-project',
      owner: 'devops-team'
    }
  });

  try {
    console.log(`Deploying to ${environment} environment in ${region}...`);

    // Initialize with environment-specific variables
    // These variables can be used in backend configuration blocks
    console.log('Initializing with dynamic backend configuration...');
    const initResult = await tofu.init({
      // Backend configuration using variables
      backendConfig: {
        bucket: `terraform-state-${accountId}-${region}`,
        key: `${environment}/terraform.tfstate`,
        region: region,
        encrypt: true,
        dynamodb_table: `terraform-locks-${environment}`
      },
      // Additional variables for init that merge with constructor variables
      variables: {
        environment: environment,
        region: region,
        account_id: accountId,
        // These variables can be referenced in terraform configuration
        // for dynamic resource naming, tagging, etc.
        state_bucket: `terraform-state-${accountId}-${region}`,
        lock_table: `terraform-locks-${environment}`
      }
    });
    
    console.log('Initialization completed:', initResult);

    // Generate plan with the merged variables
    console.log('\nGenerating deployment plan...');
    const plan = await tofu.plan();
    console.log(`Plan: ${plan.changes.add} to add, ${plan.changes.change} to change, ${plan.changes.destroy} to destroy`);

    // In a real scenario, you might want to review the plan before applying
    if (plan.changes.add > 0 || plan.changes.change > 0 || plan.changes.destroy > 0) {
      console.log('\nApplying changes...');
      const applyResult = await tofu.apply();
      console.log('Apply completed:', applyResult);

      // Get outputs
      console.log('\nRetrieving outputs...');
      const outputs = await tofu.output({ json: true });
      console.log('Deployment outputs:', JSON.stringify(outputs, null, 2));
    } else {
      console.log('No changes detected, skipping apply.');
    }

  } catch (error) {
    console.error('Deployment failed:', error.message);
    process.exit(1);
  }
}

async function destroyEnvironment() {
  const environment = process.env.ENVIRONMENT || 'dev';
  const region = process.env.AWS_REGION || 'us-west-2';
  const accountId = process.env.AWS_ACCOUNT_ID || '123456789012';

  const tofu = new Tofu({
    workingDirectory: path.join(__dirname, 'infrastructure'),
    autoApprove: true, // Be careful with this in production!
    variables: {
      project_name: 'my-project',
      owner: 'devops-team',
      environment: environment,
      region: region,
      account_id: accountId
    }
  });

  try {
    console.log(`Destroying ${environment} environment...`);
    
    // Initialize with the same backend configuration
    await tofu.init({
      backendConfig: {
        bucket: `terraform-state-${accountId}-${region}`,
        key: `${environment}/terraform.tfstate`,
        region: region,
        encrypt: true,
        dynamodb_table: `terraform-locks-${environment}`
      }
    });

    // Destroy all resources
    const destroyResult = await tofu.destroy();
    console.log('Destroy completed:', destroyResult);

  } catch (error) {
    console.error('Destroy failed:', error.message);
    process.exit(1);
  }
}

// Example usage
if (require.main === module) {
  const action = process.argv[2];
  
  if (action === 'destroy') {
    destroyEnvironment().catch(console.error);
  } else {
    deployWithDynamicBackend().catch(console.error);
  }
}

export { deployWithDynamicBackend, destroyEnvironment };
