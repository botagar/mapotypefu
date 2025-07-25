import { Tofu } from '../src/tofu';

/**
 * Example demonstrating backend configuration options with the clean API
 * where backendConfigFiles and backendConfig are separate parameters
 */
async function demonstrateBackendConfig() {
  console.log('=== Backend Configuration Examples ===\n');

  const tofuWithFile = new Tofu({
    workingDirectory: './infrastructure'
  });

  // Example 1: Using backend configuration files
  console.log('1. Using backend configuration files:');
  try {
    await tofuWithFile.init({ 
      backendConfigFiles: ['backend.hcl', 'secrets.hcl'] 
    });
    console.log('✓ Initialized with backend config files\n');
  } catch (error) {
    console.log(`✗ Error: ${error}\n`);
  }

  // Example 2: Using key-value pairs for S3 backend
  console.log('2. Using key-value pairs for S3 backend:');
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

  // Example 3: Combining backend config files with CLI arguments
  console.log('3. Combining backend config files with CLI arguments:');
  try {
    await tofuWithFile.init({ 
      backendConfigFiles: ['base-config.hcl', 'secrets.hcl'],
      backendConfig: {
        bucket: 'override-bucket',  // This overrides any bucket setting in files
        region: 'us-east-1',        // This overrides any region setting in files
        encrypt: true               // This overrides any encrypt setting in files
      }
    });
    console.log('✓ Initialized with combined backend configuration (CLI takes precedence)\n');
  } catch (error) {
    console.log(`✗ Error: ${error}\n`);
  }

  // Example 4: Environment-specific overrides
  console.log('4. Environment-specific backend configuration:');
  const environment = 'production'; // Could be from process.env.NODE_ENV
  try {
    await tofuWithFile.init({ 
      backendConfigFiles: 'base-backend.hcl',  // Base configuration
      backendConfig: {
        key: `${environment}/terraform.tfstate`,           // Environment-specific key
        bucket: `${environment}-terraform-state-bucket`,   // Environment-specific bucket
        dynamodb_table: `${environment}-terraform-locks`   // Environment-specific lock table
      }
    });
    console.log('✓ Initialized with environment-specific backend configuration\n');
  } catch (error) {
    console.log(`✗ Error: ${error}\n`);
  }

  // Example 5: Azure backend with file + CLI combination
  console.log('5. Azure backend with combined configuration:');
  try {
    await tofuWithFile.init({ 
      backendConfigFiles: 'azure-base.hcl',
      backendConfig: {
        key: 'prod.terraform.tfstate',
        resource_group_name: 'prod-resources'  // Override for production
      }
    });
    console.log('✓ Initialized with Azure backend (combined configuration)\n');
  } catch (error) {
    console.log(`✗ Error: ${error}\n`);
  }

  // Example 6: GCS backend with key-value pairs only
  console.log('6. GCS backend with key-value pairs:');
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

  // Example 7: Complete configuration with all options
  console.log('7. Complete configuration example:');
  try {
    await tofuWithFile.init({ 
      upgrade: true,
      reconfigure: true,
      backendConfigFiles: 'base-backend.hcl',
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

  // Example 8: Disable backend (local state)
  console.log('8. Disable backend for local state:');
  try {
    await tofuWithFile.init({ 
      backend: false,
      pluginDir: '/custom/plugins',
      verifyPlugins: false
    });
    console.log('✓ Initialized without backend, using local state\n');
  } catch (error) {
    console.log(`✗ Error: ${error}\n`);
  }
}

// Example backend configuration files content
console.log('=== Example Backend Configuration Files ===\n');

console.log('base-backend.hcl:');
console.log(`bucket = "default-terraform-state-bucket"
key    = "default/terraform.tfstate"
region = "us-west-2"
encrypt = true
dynamodb_table = "terraform-locks"
`);

console.log('secrets.hcl:');
console.log(`access_key = "AKIA..."
secret_key = "..."
`);

console.log('azure-base.hcl:');
console.log(`storage_account_name = "defaultstorageaccount"
container_name = "tfstate"
key = "default.terraform.tfstate"
`);

console.log('=== Backend Configuration Precedence ===\n');
console.log(`When combining files and CLI arguments:
1. Backend config files are processed first (lower precedence)
2. CLI arguments are processed second (higher precedence)
3. CLI arguments override conflicting settings from files

Example:
- base-backend.hcl sets bucket = "default-bucket"
- CLI argument sets bucket = "override-bucket"
- Result: bucket = "override-bucket" (CLI wins)

Clean API Design:
- backendConfigFiles: string | string[] - for backend config files
- backendConfig: Record<string, string | number | boolean> - for CLI arguments
- No ambiguity, clear separation of concerns
`);

// Run the demonstration
demonstrateBackendConfig().catch(console.error);
