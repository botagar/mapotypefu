# MaPoTypeFu API Reference

## Tofu Class

The main class for interacting with the OpenTofu CLI.

### Constructor

```typescript
new Tofu(options?: TofuOptions)
```

#### TofuOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| workingDirectory | string | '.' | Directory containing OpenTofu configuration files |
| autoApprove | boolean | false | Whether to automatically approve apply/destroy operations |
| variables | Record<string, string \| number \| boolean> | undefined | Variables to pass to OpenTofu |
| tofuPath | string | 'tofu' | Path to the OpenTofu executable |

### Methods

#### init

Initialize a OpenTofu working directory.

```typescript
async init(options?: InitOptions): Promise<string>
```

#### InitOptions

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| upgrade | boolean | false | Whether to upgrade modules and plugins |
| reconfigure | boolean | false | Reconfigure the backend, ignoring any saved configuration |
| backendConfigFiles | string \| string[] | undefined | Backend configuration file(s) |
| backendConfig | Record<string, string \| number \| boolean> | undefined | Backend configuration key-value pairs (CLI arguments) |
| backend | boolean | true | Whether to configure the backend |
| getPlugins | boolean | true | Whether to download plugins |
| pluginDir | string \| string[] | undefined | Directory(ies) containing plugin binaries |
| verifyPlugins | boolean | true | Whether to verify plugin signatures |
| variables | Record<string, string \| number \| boolean> | undefined | Variables to pass to OpenTofu during initialization (merged with constructor variables) |

**Variable Merging Behavior:**

Variables passed to the `init` method are merged with variables from the constructor. Init-specific variables take precedence over constructor variables when there are conflicts.

```typescript
const tofu = new Tofu({
  variables: {
    environment: 'dev',
    region: 'us-east-1'
  }
});

// Init variables override constructor variables
await tofu.init({
  variables: {
    environment: 'prod', // Overrides constructor value
    bucket_name: 'my-state-bucket' // Additional variable
  }
});
// Results in: environment=prod, region=us-east-1, bucket_name=my-state-bucket
```

**Backend Configuration Examples:**

```typescript
// Using backend configuration files
await tofu.init({ backendConfigFiles: 'backend.hcl' });
await tofu.init({ backendConfigFiles: ['backend.hcl', 'secrets.hcl'] });

// Using key-value pairs for backend configuration
await tofu.init({ 
  backendConfig: {
    bucket: 'my-terraform-state',
    key: 'prod/terraform.tfstate',
    region: 'us-west-2',
    encrypt: true
  }
});

// Using variables for parameterized backend configuration
const environment = 'prod';
const region = 'us-west-2';
await tofu.init({
  backendConfig: {
    bucket: `terraform-state-${environment}`,
    key: `${environment}/terraform.tfstate`,
    region: region
  },
  variables: {
    environment: environment,
    region: region,
    state_bucket: `terraform-state-${environment}`
  }
});

// Combining backend config files with CLI arguments (CLI takes precedence)
await tofu.init({ 
  backendConfigFiles: ['base-config.hcl', 'secrets.hcl'],
  backendConfig: {
    bucket: 'override-bucket',  // This will override any bucket setting in files
    encrypt: true               // This will override any encrypt setting in files
  }
});

// Complete example with precedence
await tofu.init({ 
  backendConfigFiles: 'backend.hcl',  // Base configuration from file
  backendConfig: {
    region: 'us-east-1',              // CLI argument overrides file setting
    encrypt: true                     // CLI argument overrides file setting
  }
});

// Disable backend configuration
await tofu.init({ backend: false });

// Custom plugin directory
await tofu.init({ pluginDir: '/custom/plugins' });

// Multiple plugin directories
await tofu.init({ pluginDir: ['/plugins1', '/plugins2'] });
```

**Backend Configuration Precedence:**

When both `backendConfigFiles` and `backendConfig` are specified:
1. Backend config files are processed first (lower precedence)
2. CLI arguments from `backendConfig` are processed second (higher precedence)
3. CLI arguments will override any conflicting settings from config files

Returns: A promise that resolves to the output of the init command.

#### plan

Generate an execution plan.

```typescript
async plan(options?: { out?: string, detailed?: boolean }): Promise<PlanResult>
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| options.out | string | undefined | Path to save the plan file |
| options.detailed | boolean | false | Return detailed exit code |

Returns: A promise that resolves to a PlanResult object.

```typescript
interface PlanResult {
  summary: string;
  changes: {
    add: number;
    change: number;
    destroy: number;
  };
  raw: string;
}
```

#### apply

Apply the changes required to reach the desired state.

```typescript
async apply(options?: { planFile?: string }): Promise<string>
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| options.planFile | string | undefined | Path to a previously saved plan file |

Returns: A promise that resolves to the output of the apply command.

#### destroy

Destroy all managed resources.

```typescript
async destroy(): Promise<string>
```

Returns: A promise that resolves to the output of the destroy command.

#### output

Output the values of root module outputs.

```typescript
async output(options?: { name?: string, json?: boolean }): Promise<string | Record<string, any>>
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| options.name | string | undefined | Name of a specific output to retrieve |
| options.json | boolean | false | Whether to parse the output as JSON |

Returns: A promise that resolves to the output values as a string or parsed JSON object.
