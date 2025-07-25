import { Tofu } from '../src/tofu';

/**
 * Example demonstrating various backend configuration options
 */
async function demonstrateBackendConfig() {
  console.log('=== Backend Configuration Examples ===\n');

  // Example 1: Using a backend configuration file
  console.log('1. Using backend configuration file:');
  const tofuWithFile = new Tofu({
    workingDirectory: './infrastructure'
  });

  try {
    await tofuWithFile.init({ 
      backendConfig: 'backend.hcl' 
    });
    console.log('✓ Initialized with backend config file\n');
  } catch (error) {
    console.log(`✗ Error: ${error}\n`);
  }

  // Example 2: Using multiple backend configuration files
  console.log('2. Using multiple backend configuration files:');
  try {
    await tofuWithFile.init({ 
      backendConfig: ['backend.hcl', 'secrets.hcl'] 
    });
    console.log('✓ Initialized with multiple backend config files\n');
  } catch (error) {
    console.log(`✗ Error: ${error}\n`);
  }

  // Example 3: Using key-value pairs for S3 backend
  console.log('3. Using key-value pairs for S3 backend:');
  try {
    await tofuWithFile.init({ 
      backendConfig: {
        bucket: 'my-terraform-state-bucket',
        key: 'prod/terraform.tfstate',
        region: 'us-west-2',
        encrypt: true,
        dynamodb_table: 'terraform-locks'
      }
    });
    console.log('✓ Initialized with S3 backend configuration\n');
  } catch (error) {
    console.log(`✗ Error: ${error}\n`);
  }

  // Example 4: Using key-value pairs for Azure backend
  console.log('4. Using key-value pairs for Azure backend:');
  try {
    await tofuWithFile.init({ 
      backendConfig: {
        storage_account_name: 'mystorageaccount',
        container_name: 'tfstate',
        key: 'prod.terraform.tfstate',
        resource_group_name: 'myresourcegroup'
      }
    });
    console.log('✓ Initialized with Azure backend configuration\n');
  } catch (error) {
    console.log(`✗ Error: ${error}\n`);
  }

  // Example 5: Using key-value pairs for GCS backend
  console.log('5. Using key-value pairs for GCS backend:');
  try {
    await tofuWithFile.init({ 
      backendConfig: {
        bucket: 'my-gcs-bucket',
        prefix: 'terraform/state',
        credentials: 'path/to/service-account.json'
      }
    });
    console.log('✓ Initialized with GCS backend configuration\n');
  } catch (error) {
    console.log(`✗ Error: ${error}\n`);
  }

  // Example 6: Disable backend and use custom plugin directory
  console.log('6. Disable backend with custom plugin directory:');
  try {
    await tofuWithFile.init({ 
      backend: false,
      pluginDir: '/custom/plugins',
      verifyPlugins: false
    });
    console.log('✓ Initialized without backend, using custom plugins\n');
  } catch (error) {
    console.log(`✗ Error: ${error}\n`);
  }

  // Example 7: Complete configuration with all options
  console.log('7. Complete configuration example:');
  try {
    await tofuWithFile.init({ 
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
    console.log('✓ Initialized with complete configuration\n');
  } catch (error) {
    console.log(`✗ Error: ${error}\n`);
  }
}

// Example backend configuration files content
console.log('=== Example Backend Configuration Files ===\n');

console.log('backend.hcl:');
console.log(`bucket = "my-terraform-state-bucket"
key    = "prod/terraform.tfstate"
region = "us-west-2"
encrypt = true
dynamodb_table = "terraform-locks"
`);

console.log('secrets.hcl:');
console.log(`access_key = "AKIA..."
secret_key = "..."
`);

// Run the demonstration
demonstrateBackendConfig().catch(console.error);
