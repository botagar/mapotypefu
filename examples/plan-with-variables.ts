/**
 * Example demonstrating plan method with variables for scenario analysis
 * 
 * This example shows how to use variables during planning for:
 * - What-if analysis with different configurations
 * - Multi-environment planning
 * - Feature flag testing
 * - Cost estimation scenarios
 */

import { Tofu } from '../src';
import * as path from 'path';

interface EnvironmentConfig {
  environment: string;
  region: string;
  instance_type: string;
  min_capacity: number;
  max_capacity: number;
  enable_monitoring: boolean;
  enable_backup: boolean;
}

async function compareEnvironmentPlans() {
  console.log('=== Environment Comparison Planning ===\n');

  // Base Tofu instance with common variables
  const tofu = new Tofu({
    workingDirectory: path.join(__dirname, 'infrastructure'),
    variables: {
      project_name: 'my-web-app',
      owner: 'platform-team',
      cost_center: 'engineering'
    }
  });

  // Environment configurations
  const environments: EnvironmentConfig[] = [
    {
      environment: 'dev',
      region: 'us-east-1',
      instance_type: 't3.micro',
      min_capacity: 1,
      max_capacity: 2,
      enable_monitoring: false,
      enable_backup: false
    },
    {
      environment: 'staging',
      region: 'us-west-2',
      instance_type: 't3.small',
      min_capacity: 2,
      max_capacity: 4,
      enable_monitoring: true,
      enable_backup: false
    },
    {
      environment: 'prod',
      region: 'us-west-2',
      instance_type: 't3.large',
      min_capacity: 5,
      max_capacity: 20,
      enable_monitoring: true,
      enable_backup: true
    }
  ];

  try {
    // Initialize once (could use environment-specific backend config)
    await tofu.init();

    // Generate plans for each environment
    for (const config of environments) {
      console.log(`Planning for ${config.environment} environment...`);
      
      const plan = await tofu.plan({
        out: `${config.environment}.plan`,
        variables: config
      });

      console.log(`${config.environment.toUpperCase()} Plan Results:`);
      console.log(`  - Resources to add: ${plan.changes.add}`);
      console.log(`  - Resources to change: ${plan.changes.change}`);
      console.log(`  - Resources to destroy: ${plan.changes.destroy}`);
      console.log(`  - Plan saved to: ${config.environment}.plan\n`);
    }

  } catch (error) {
    console.error('Planning failed:', error.message);
    process.exit(1);
  }
}

async function whatIfAnalysis() {
  console.log('=== What-If Analysis ===\n');

  const tofu = new Tofu({
    workingDirectory: path.join(__dirname, 'infrastructure'),
    variables: {
      project_name: 'cost-optimization-analysis',
      environment: 'prod'
    }
  });

  const scenarios = [
    {
      name: 'Current Configuration',
      variables: {
        instance_type: 't3.medium',
        replica_count: 3,
        storage_size: 100,
        enable_cdn: false
      }
    },
    {
      name: 'Cost Optimized',
      variables: {
        instance_type: 't3.small',
        replica_count: 2,
        storage_size: 50,
        enable_cdn: true // CDN can reduce compute load
      }
    },
    {
      name: 'Performance Optimized',
      variables: {
        instance_type: 't3.xlarge',
        replica_count: 5,
        storage_size: 500,
        enable_cdn: true
      }
    },
    {
      name: 'High Availability',
      variables: {
        instance_type: 't3.large',
        replica_count: 10,
        storage_size: 200,
        enable_cdn: true,
        multi_az: true,
        enable_auto_scaling: true
      }
    }
  ];

  try {
    await tofu.init();

    console.log('Analyzing different configuration scenarios...\n');

    for (const scenario of scenarios) {
      console.log(`Scenario: ${scenario.name}`);
      
      const plan = await tofu.plan({
        variables: scenario.variables
      });

      console.log(`  Changes: +${plan.changes.add} ~${plan.changes.change} -${plan.changes.destroy}`);
      
      // In a real scenario, you might parse the plan output for cost estimates
      // or resource counts to help with decision making
      console.log(`  Configuration: ${JSON.stringify(scenario.variables, null, 2)}\n`);
    }

  } catch (error) {
    console.error('What-if analysis failed:', error.message);
    process.exit(1);
  }
}

async function featureFlagTesting() {
  console.log('=== Feature Flag Testing ===\n');

  const tofu = new Tofu({
    workingDirectory: path.join(__dirname, 'infrastructure'),
    variables: {
      project_name: 'feature-testing',
      environment: 'staging',
      region: 'us-west-2'
    }
  });

  const featureConfigurations = [
    {
      name: 'Baseline (no new features)',
      variables: {
        enable_new_api: false,
        enable_caching: false,
        enable_monitoring_v2: false
      }
    },
    {
      name: 'New API Only',
      variables: {
        enable_new_api: true,
        enable_caching: false,
        enable_monitoring_v2: false,
        api_instance_count: 2
      }
    },
    {
      name: 'New API + Caching',
      variables: {
        enable_new_api: true,
        enable_caching: true,
        enable_monitoring_v2: false,
        api_instance_count: 2,
        cache_node_type: 'cache.t3.micro'
      }
    },
    {
      name: 'All Features Enabled',
      variables: {
        enable_new_api: true,
        enable_caching: true,
        enable_monitoring_v2: true,
        api_instance_count: 3,
        cache_node_type: 'cache.t3.small',
        monitoring_retention_days: 30
      }
    }
  ];

  try {
    await tofu.init();

    console.log('Testing feature flag combinations...\n');

    for (const config of featureConfigurations) {
      console.log(`Configuration: ${config.name}`);
      
      const plan = await tofu.plan({
        variables: config.variables
      });

      console.log(`  Infrastructure changes: +${plan.changes.add} ~${plan.changes.change} -${plan.changes.destroy}`);
      console.log(`  Features: ${Object.entries(config.variables)
        .filter(([key, value]) => key.startsWith('enable_') && value === true)
        .map(([key]) => key.replace('enable_', ''))
        .join(', ') || 'none'}\n`);
    }

  } catch (error) {
    console.error('Feature flag testing failed:', error.message);
    process.exit(1);
  }
}

async function interactivePlanning() {
  console.log('=== Interactive Planning ===\n');

  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise((resolve) => {
      readline.question(prompt, resolve);
    });
  };

  try {
    // Collect user input
    const environment = await question('Environment (dev/staging/prod): ');
    const region = await question('AWS Region (us-east-1/us-west-2): ');
    const instanceType = await question('Instance type (t3.micro/t3.small/t3.medium): ');
    const replicaCount = parseInt(await question('Number of replicas: '), 10);
    const enableMonitoring = (await question('Enable monitoring? (y/n): ')).toLowerCase() === 'y';

    readline.close();

    const tofu = new Tofu({
      workingDirectory: path.join(__dirname, 'infrastructure'),
      variables: {
        project_name: 'interactive-deployment'
      }
    });

    await tofu.init();

    console.log('\nGenerating plan with your configuration...');
    
    const plan = await tofu.plan({
      variables: {
        environment,
        region,
        instance_type: instanceType,
        replica_count: replicaCount,
        enable_monitoring: enableMonitoring
      }
    });

    console.log('\n=== Plan Results ===');
    console.log(`Resources to add: ${plan.changes.add}`);
    console.log(`Resources to change: ${plan.changes.change}`);
    console.log(`Resources to destroy: ${plan.changes.destroy}`);
    console.log('\nConfiguration:');
    console.log(`  Environment: ${environment}`);
    console.log(`  Region: ${region}`);
    console.log(`  Instance Type: ${instanceType}`);
    console.log(`  Replica Count: ${replicaCount}`);
    console.log(`  Monitoring: ${enableMonitoring ? 'enabled' : 'disabled'}`);

  } catch (error) {
    console.error('Interactive planning failed:', error.message);
    readline.close();
    process.exit(1);
  }
}

// Example usage
if (require.main === module) {
  const mode = process.argv[2] || 'compare';
  
  switch (mode) {
    case 'compare':
      compareEnvironmentPlans().catch(console.error);
      break;
    case 'whatif':
      whatIfAnalysis().catch(console.error);
      break;
    case 'features':
      featureFlagTesting().catch(console.error);
      break;
    case 'interactive':
      interactivePlanning().catch(console.error);
      break;
    default:
      console.log('Usage: node plan-with-variables.js [compare|whatif|features|interactive]');
      process.exit(1);
  }
}

export { compareEnvironmentPlans, whatIfAnalysis, featureFlagTesting, interactivePlanning };
