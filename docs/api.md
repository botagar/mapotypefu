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
async init(options?: { upgrade?: boolean, reconfigure?: boolean }): Promise<string>
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| options.upgrade | boolean | false | Whether to upgrade modules and plugins |
| options.reconfigure | boolean | false | Reconfigure the backend, ignoring any saved configuration |

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
