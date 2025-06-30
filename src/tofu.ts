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
  async init(options?: { upgrade?: boolean; reconfigure?: boolean }): Promise<string> {
    const args = ['init'];

    if (options?.upgrade) {
      args.push('-upgrade');
    }

    if (options?.reconfigure) {
      args.push('-reconfigure');
    }

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
  async plan(options?: { out?: string; detailed?: boolean }): Promise<PlanResult> {
    const args = ['plan'];

    if (options?.out) {
      args.push(`-out=${options.out}`);
    }

    if (options?.detailed) {
      args.push('-detailed-exitcode');
    }

    // Add variables if specified
    this.addVariableArgs(args);

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
  private addVariableArgs(args: string[]): void {
    if (this.options.variables) {
      Object.entries(this.options.variables).forEach(([key, value]) => {
        args.push(`-var=${key}=${value}`);
      });
    }
  }
}
