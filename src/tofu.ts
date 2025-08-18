/**
 * Core OpenTofu CLI wrapper functionality
 */

import { execa } from 'execa';

export interface TofuOptions {
  workingDirectory?: string;
  autoApprove?: boolean;
  variables?: Record<string, string | number | boolean>;
  tofuPath?: string;
}

export interface InitOptions {
  upgrade?: boolean;
  reconfigure?: boolean;
  backendConfigFiles?: string | string[];
  backendConfig?: Record<string, string | number | boolean>;
  backend?: boolean;
  getPlugins?: boolean;
  pluginDir?: string | string[];
  verifyPlugins?: boolean;
  variables?: Record<string, string | number | boolean>;
}

export interface PlanOptions {
  out?: string;
  detailed?: boolean;
  variables?: Record<string, string | number | boolean>;
}

export interface PlanResult {
  summary: string;
  changes: {
    add: number;
    change: number;
    destroy: number;
  };
  raw: string;
}

interface TofuError extends Error {
  all?: string;
}

/**
 * Main Tofu class for interacting with OpenTofu CLI
 */
export class Tofu {
  private options: TofuOptions;

  constructor(options: TofuOptions = {}) {
    this.options = {
      workingDirectory: '.',
      autoApprove: false,
      tofuPath: 'tofu', // Default to 'tofu' in PATH
      ...options,
    };
  }

  /**
   * Initialize a OpenTofu working directory
   */
  async init(options?: InitOptions): Promise<string> {
    const args = ['init'];

    if (options?.upgrade) {
      args.push('-upgrade');
    }

    if (options?.reconfigure) {
      args.push('-reconfigure');
    }

    if (options?.backend === false) {
      args.push('-backend=false');
    }

    if (options?.getPlugins === false) {
      args.push('-get-plugins=false');
    }

    if (options?.verifyPlugins === false) {
      args.push('-verify-plugins=false');
    }

    // Handle backend configuration files first (lower precedence)
    if (options?.backendConfigFiles) {
      this.addBackendConfigFileArgs(args, options.backendConfigFiles);
    }

    // Handle backend configuration CLI arguments second (higher precedence)
    if (options?.backendConfig) {
      this.addBackendConfigArgs(args, options.backendConfig);
    }

    // Handle plugin directories
    if (options?.pluginDir) {
      const pluginDirs = Array.isArray(options.pluginDir) ? options.pluginDir : [options.pluginDir];
      pluginDirs.forEach(dir => {
        args.push(`-plugin-dir=${dir}`);
      });
    }

    // Add variables (merge constructor variables with init-specific variables)
    this.addVariableArgs(args, options?.variables);

    try {
      const { stdout } = await this.runCommand(args);
      return stdout;
    } catch (error: unknown) {
      const tofuError = error as TofuError;
      throw new Error(`Failed to initialize OpenTofu: ${tofuError.message}`);
    }
  }

  /**
   * Generate an execution plan
   */
  async plan(options?: PlanOptions): Promise<PlanResult> {
    const args = ['plan'];

    if (options?.out) {
      args.push(`-out=${options.out}`);
    }

    if (options?.detailed) {
      args.push('-detailed-exitcode');
    }

    // Add variables (merge constructor variables with plan-specific variables)
    this.addVariableArgs(args, options?.variables);

    try {
      const { stdout } = await this.runCommand(args);

      // Parse the plan output to extract changes
      const addMatch = stdout.match(/Plan: (\d+) to add/);
      const changeMatch = stdout.match(/(\d+) to change/);
      const destroyMatch = stdout.match(/(\d+) to destroy/);

      return {
        summary: 'Plan generated successfully',
        changes: {
          add: addMatch ? parseInt(addMatch[1], 10) : 0,
          change: changeMatch ? parseInt(changeMatch[1], 10) : 0,
          destroy: destroyMatch ? parseInt(destroyMatch[1], 10) : 0,
        },
        raw: stdout,
      };
    } catch (error: unknown) {
      const tofuError = error as TofuError;
      throw new Error(`Failed to generate plan: ${tofuError.message}`);
    }
  }

  /**
   * Apply the changes required to reach the desired state
   */
  async apply(options?: { planFile?: string }): Promise<string> {
    const args = ['apply'];

    if (this.options.autoApprove) {
      args.push('-auto-approve');
    }

    if (options?.planFile) {
      args.push(options.planFile);
    } else {
      // Add variables if applying directly (not from plan file)
      this.addVariableArgs(args);
    }

    try {
      const { stdout } = await this.runCommand(args);
      return stdout;
    } catch (error: unknown) {
      const tofuError = error as TofuError;
      throw new Error(`Failed to apply changes: ${tofuError.message}`);
    }
  }

  /**
   * Destroy all resources
   */
  async destroy(): Promise<string> {
    const args = ['destroy'];

    if (this.options.autoApprove) {
      args.push('-auto-approve');
    }

    // Add variables
    this.addVariableArgs(args);

    try {
      const { stdout } = await this.runCommand(args);
      return stdout;
    } catch (error: unknown) {
      const tofuError = error as TofuError;
      throw new Error(`Failed to destroy resources: ${tofuError.message}`);
    }
  }

  /**
   * Output the values of root module outputs
   */
  async output(options?: {
    name?: string;
    json?: boolean;
  }): Promise<string | Record<string, unknown>> {
    const args = ['output'];

    if (options?.name) {
      args.push(options.name);
    }

    if (options?.json) {
      args.push('-json');
    }

    try {
      const { stdout } = await this.runCommand(args);

      if (options?.json) {
        return JSON.parse(stdout);
      }

      return stdout;
    } catch (error: unknown) {
      const tofuError = error as TofuError;
      throw new Error(`Failed to get outputs: ${tofuError.message}`);
    }
  }

  /**
   * Helper method to run OpenTofu commands
   */
  private async runCommand(args: string[]): Promise<{ stdout: string; stderr: string }> {
    try {
      // Ensure tofuPath is not undefined
      const tofuPath = this.options.tofuPath || 'tofu';

      return await execa(tofuPath, args, {
        cwd: this.options.workingDirectory,
        all: true,
      });
    } catch (error: unknown) {
      const tofuError = error as TofuError;
      // Capture and re-throw with stdout/stderr if available
      if (tofuError.all) {
        throw new Error(`${tofuError.message}\n${tofuError.all}`);
      }
      throw error;
    }
  }

  /**
   * Helper method to add variable arguments
   */
  private addVariableArgs(
    args: string[], 
    additionalVariables?: Record<string, string | number | boolean>
  ): void {
    // Merge constructor variables with additional variables
    // Additional variables take precedence over constructor variables
    const mergedVariables = {
      ...this.options.variables,
      ...additionalVariables,
    };

    if (Object.keys(mergedVariables).length > 0) {
      Object.entries(mergedVariables).forEach(([key, value]) => {
        args.push(`-var=${key}=${value}`);
      });
    }
  }

  /**
   * Helper method to add backend configuration file arguments
   */
  private addBackendConfigFileArgs(args: string[], backendConfigFiles: string | string[]): void {
    const files = Array.isArray(backendConfigFiles) ? backendConfigFiles : [backendConfigFiles];
    files.forEach(file => {
      args.push(`-backend-config=${file}`);
    });
  }

  /**
   * Helper method to add backend configuration CLI arguments
   */
  private addBackendConfigArgs(
    args: string[],
    backendConfig: Record<string, string | number | boolean>
  ): void {
    Object.entries(backendConfig).forEach(([key, value]) => {
      args.push(`-backend-config=${key}=${value}`);
    });
  }
}
