import { Tofu } from '../src/tofu';
import { execa } from 'execa';

// execa is mocked in jest.setup.cjs

describe('Tofu', () => {
  let tofu: Tofu;
  
  beforeEach(() => {
    tofu = new Tofu({
      workingDirectory: './test-dir'
    });
    
    // Reset mocks
    jest.resetAllMocks();
    
    // Default mock implementation
    (execa as jest.Mock).mockResolvedValue({
      stdout: 'Command executed successfully',
      stderr: '',
      all: 'Command executed successfully'
    });
  });

  test('should initialize successfully', async () => {
    (execa as jest.Mock).mockResolvedValueOnce({
      stdout: 'Initialization complete',
      stderr: '',
      all: 'Initialization complete'
    });
    
    const result = await tofu.init();
    expect(result).toBe('Initialization complete');
    expect(execa).toHaveBeenCalledWith('tofu', ['init'], expect.any(Object));
  });

  test('should initialize with options', async () => {
    await tofu.init({ upgrade: true, reconfigure: true });
    expect(execa).toHaveBeenCalledWith('tofu', ['init', '-upgrade', '-reconfigure'], expect.any(Object));
  });

  test('should initialize with backend disabled', async () => {
    await tofu.init({ backend: false });
    expect(execa).toHaveBeenCalledWith('tofu', ['init', '-backend=false'], expect.any(Object));
  });

  test('should initialize with plugin options', async () => {
    await tofu.init({ 
      getPlugins: false, 
      verifyPlugins: false,
      pluginDir: '/custom/plugins'
    });
    expect(execa).toHaveBeenCalledWith('tofu', [
      'init', 
      '-get-plugins=false', 
      '-verify-plugins=false',
      '-plugin-dir=/custom/plugins'
    ], expect.any(Object));
  });

  test('should initialize with multiple plugin directories', async () => {
    await tofu.init({ 
      pluginDir: ['/plugins1', '/plugins2']
    });
    expect(execa).toHaveBeenCalledWith('tofu', [
      'init', 
      '-plugin-dir=/plugins1',
      '-plugin-dir=/plugins2'
    ], expect.any(Object));
  });

  test('should initialize with backend config file', async () => {
    await tofu.init({ backendConfig: 'backend.hcl' });
    expect(execa).toHaveBeenCalledWith('tofu', ['init', '-backend-config=backend.hcl'], expect.any(Object));
  });

  test('should initialize with multiple backend config files', async () => {
    await tofu.init({ backendConfig: ['backend1.hcl', 'backend2.hcl'] });
    expect(execa).toHaveBeenCalledWith('tofu', [
      'init', 
      '-backend-config=backend1.hcl',
      '-backend-config=backend2.hcl'
    ], expect.any(Object));
  });

  test('should initialize with backend config key-value pairs', async () => {
    await tofu.init({ 
      backendConfig: {
        bucket: 'my-terraform-state',
        key: 'prod/terraform.tfstate',
        region: 'us-west-2',
        encrypt: true
      }
    });
    expect(execa).toHaveBeenCalledWith('tofu', [
      'init',
      '-backend-config=bucket=my-terraform-state',
      '-backend-config=key=prod/terraform.tfstate',
      '-backend-config=region=us-west-2',
      '-backend-config=encrypt=true'
    ], expect.any(Object));
  });

  test('should initialize with separate backend config files parameter', async () => {
    await tofu.init({ backendConfigFiles: 'backend.hcl' });
    expect(execa).toHaveBeenCalledWith('tofu', ['init', '-backend-config=backend.hcl'], expect.any(Object));
  });

  test('should initialize with multiple backend config files using separate parameter', async () => {
    await tofu.init({ backendConfigFiles: ['backend1.hcl', 'backend2.hcl'] });
    expect(execa).toHaveBeenCalledWith('tofu', [
      'init', 
      '-backend-config=backend1.hcl',
      '-backend-config=backend2.hcl'
    ], expect.any(Object));
  });

  test('should initialize with combined backend config files and CLI arguments', async () => {
    await tofu.init({ 
      backendConfigFiles: ['backend.hcl', 'secrets.hcl'],
      backendConfig: {
        bucket: 'override-bucket',
        encrypt: true
      }
    });
    expect(execa).toHaveBeenCalledWith('tofu', [
      'init',
      '-backend-config=backend.hcl',
      '-backend-config=secrets.hcl',
      '-backend-config=bucket=override-bucket',
      '-backend-config=encrypt=true'
    ], expect.any(Object));
  });

  test('should prioritize backendConfigFiles over legacy backendConfig for files', async () => {
    await tofu.init({ 
      backendConfigFiles: 'priority.hcl',
      backendConfig: 'ignored.hcl'  // This should be ignored since backendConfigFiles is specified
    });
    expect(execa).toHaveBeenCalledWith('tofu', [
      'init',
      '-backend-config=priority.hcl'
    ], expect.any(Object));
  });

  test('should combine backendConfigFiles with backendConfig key-value pairs', async () => {
    await tofu.init({ 
      backendConfigFiles: 'base-config.hcl',
      backendConfig: {
        region: 'us-east-1',
        encrypt: true
      }
    });
    expect(execa).toHaveBeenCalledWith('tofu', [
      'init',
      '-backend-config=base-config.hcl',
      '-backend-config=region=us-east-1',
      '-backend-config=encrypt=true'
    ], expect.any(Object));
  });

  test('should initialize with mixed backend and other options', async () => {
    await tofu.init({ 
      upgrade: true,
      reconfigure: true,
      backendConfigFiles: 'base-backend.hcl',
      backendConfig: {
        bucket: 'my-state-bucket',
        region: 'us-east-1'
      },
      pluginDir: '/custom/plugins'
    });
    expect(execa).toHaveBeenCalledWith('tofu', [
      'init',
      '-upgrade',
      '-reconfigure',
      '-backend-config=base-backend.hcl',
      '-backend-config=bucket=my-state-bucket',
      '-backend-config=region=us-east-1',
      '-plugin-dir=/custom/plugins'
    ], expect.any(Object));
  });

  test('should generate a plan', async () => {
    (execa as jest.Mock).mockResolvedValueOnce({
      stdout: 'Plan: 1 to add, 2 to change, 3 to destroy.',
      stderr: '',
      all: 'Plan: 1 to add, 2 to change, 3 to destroy.'
    });
    
    const plan = await tofu.plan();
    expect(plan).toHaveProperty('summary');
    expect(plan).toHaveProperty('changes');
    expect(plan.changes).toEqual({
      add: 1,
      change: 2,
      destroy: 3
    });
    expect(execa).toHaveBeenCalledWith('tofu', ['plan'], expect.any(Object));
  });

  test('should plan with output file', async () => {
    await tofu.plan({ out: 'plan.out' });
    expect(execa).toHaveBeenCalledWith('tofu', ['plan', '-out=plan.out'], expect.any(Object));
  });

  test('should apply changes', async () => {
    (execa as jest.Mock).mockResolvedValueOnce({
      stdout: 'Apply complete! Resources: 1 added, 0 changed, 0 destroyed.',
      stderr: '',
      all: 'Apply complete! Resources: 1 added, 0 changed, 0 destroyed.'
    });
    
    const result = await tofu.apply();
    expect(result).toContain('Apply complete');
    expect(execa).toHaveBeenCalledWith('tofu', ['apply'], expect.any(Object));
  });
  
  test('should apply with auto-approve', async () => {
    const tofuWithAutoApprove = new Tofu({
      workingDirectory: './test-dir',
      autoApprove: true
    });
    
    await tofuWithAutoApprove.apply();
    expect(execa).toHaveBeenCalledWith('tofu', ['apply', '-auto-approve'], expect.any(Object));
  });
  
  test('should apply with plan file', async () => {
    await tofu.apply({ planFile: 'plan.out' });
    expect(execa).toHaveBeenCalledWith('tofu', ['apply', 'plan.out'], expect.any(Object));
  });
  
  test('should destroy resources', async () => {
    await tofu.destroy();
    expect(execa).toHaveBeenCalledWith('tofu', ['destroy'], expect.any(Object));
  });
  
  test('should get outputs', async () => {
    (execa as jest.Mock).mockResolvedValueOnce({
      stdout: 'output1 = "value1"\noutput2 = "value2"',
      stderr: '',
      all: 'output1 = "value1"\noutput2 = "value2"'
    });
    
    const result = await tofu.output();
    expect(result).toContain('output1');
    expect(execa).toHaveBeenCalledWith('tofu', ['output'], expect.any(Object));
  });
  
  test('should get JSON outputs', async () => {
    (execa as jest.Mock).mockResolvedValueOnce({
      stdout: '{"output1":"value1","output2":"value2"}',
      stderr: '',
      all: '{"output1":"value1","output2":"value2"}'
    });
    
    const result = await tofu.output({ json: true });
    expect(result).toEqual({
      output1: 'value1',
      output2: 'value2'
    });
    expect(execa).toHaveBeenCalledWith('tofu', ['output', '-json'], expect.any(Object));
  });
  
  test('should get specific output', async () => {
    await tofu.output({ name: 'vpc_id' });
    expect(execa).toHaveBeenCalledWith('tofu', ['output', 'vpc_id'], expect.any(Object));
  });
  
  test('should add variables to commands', async () => {
    const tofuWithVars = new Tofu({
      workingDirectory: './test-dir',
      variables: {
        environment: 'dev',
        region: 'us-west-2',
        count: 5,
        enabled: true
      }
    });
    
    await tofuWithVars.plan();
    
    // Check that all variables were added
    expect(execa).toHaveBeenCalledWith(
      'tofu',
      expect.arrayContaining([
        'plan',
        '-var=environment=dev',
        '-var=region=us-west-2',
        '-var=count=5',
        '-var=enabled=true'
      ]),
      expect.any(Object)
    );
  });
  
  test('should handle command errors', async () => {
    (execa as jest.Mock).mockRejectedValueOnce({
      message: 'Command failed',
      all: 'Error: Invalid configuration'
    });
    
    await expect(tofu.plan()).rejects.toThrow('Failed to generate plan');
  });
});
