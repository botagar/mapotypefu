import { Tofu } from '../src/tofu';

/**
 * Example demonstrating various backend configuration options including
 * the new combined approach where CLI arguments take precedence over files
 */
async function demonstrateBackendConfig() {
  console.log('=== Backend Configuration Examples ===\n');

  const tofuWithFile = new Tofu({
    workingDirectory: './infrastructure'
  });

  // Example 1: Using a backend configuration file (legacy approach)
  console.log('1. Using backend configuration file (legacy):');
  try {
    await tofuWithFile.init({ 
      backendConfig: 'backend.hcl' 
    });
    console.log('✓ Initialized with backend config file\n');
  } catch (error) {
    console.log(`✗ Error: ${error}\n`);
  }

  // Example 2: Using separate parameters (recommended approach)
  console.log('2. Using separate backendConfigFiles parameter:');
  try {
    await tofuWithFile.init({ 
      backendConfigFiles: ['backend.hcl', 'secrets.hcl'] 
    });
    console.log('✓ Initialized with separate backend config files parameter\n');
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

  // Example 4: Combining backend config files with CLI arguments (NEW FEATURE)
  console.log('4. Combining backend config files with CLI arguments:');
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

  // Example 5: Environment-specific overrides
  console.log('5. Environment-specific backend configuration:');
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

  // Example 6: Azure backend with file + CLI combination
  console.log('6. Azure backend with combined configuration:');
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

  // Example 8: Backward compatibility test
  console.log('8. Backward compatibility - legacy backendConfig usage:');
  try {
    await tofuWithFile.init({ 
      backendConfig: ['legacy-backend.hcl', 'legacy-secrets.hcl']
    });
    console.log('✓ Backward compatibility maintained\n');
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
`);

// Run the demonstration
demonstrateBackendConfig().catch(console.error);
