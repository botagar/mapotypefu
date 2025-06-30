/**
 * Basic usage example for MaPoTypeFu
 * 
 * This example assumes you have a directory called 'infrastructure' with valid OpenTofu files
 */

import { Tofu } from '../src';
import * as path from 'path';

async function main() {
  // Create a new Tofu instance
  const tofu = new Tofu({
    workingDirectory: path.join(__dirname, 'infrastructure'),
    variables: {
      environment: 'dev',
      region: 'us-west-2',
      instance_type: 't3.micro'
    }
  });

  try {
    // Initialize the working directory
    console.log('Initializing OpenTofu...');
    const initResult = await tofu.init();
    console.log(initResult);

    // Generate a plan
    console.log('\nGenerating plan...');
    const plan = await tofu.plan();
    console.log(`Plan: ${plan.changes.add} to add, ${plan.changes.change} to change, ${plan.changes.destroy} to destroy`);

    // Ask for confirmation before applying
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const shouldApply = await new Promise<boolean>((resolve) => {
      readline.question('\nDo you want to apply these changes? (yes/no): ', (answer: string) => {
        readline.close();
        resolve(answer.toLowerCase() === 'yes');
      });
    });

    if (!shouldApply) {
      console.log('Operation cancelled');
      return;
    }

    // Apply the changes
    console.log('\nApplying changes...');
    const applyResult = await tofu.apply();
    console.log(applyResult);

    // Get outputs
    console.log('\nGetting outputs...');
    const outputs = await tofu.output({ json: true });
    console.log('Outputs:', outputs);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
