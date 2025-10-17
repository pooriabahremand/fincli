import { promises as fs } from "fs";

/**
 * Configuration interface for budget allocation
 */
export interface BudgetAllocationConfig {
  investments: number;
  savings: number;
  dailyExpenses: number;
}

/**
 * Main configuration interface
 */
export interface AppConfig {
  budgetAllocation: BudgetAllocationConfig;
  version: string;
  description: string;
}

/**
 * Service for managing application configuration
 */
export class ConfigService {
  private readonly configPath = "./config.json";

  /**
   * Load configuration from file
   * @returns Promise<AppConfig> Application configuration
   */
  async loadConfig(): Promise<AppConfig> {
    try {
      const data = await fs.readFile(this.configPath, "utf-8");
      const config: AppConfig = JSON.parse(data);
      
      // Validate that percentages add up to 100
      const total = config.budgetAllocation.investments + 
                   config.budgetAllocation.savings + 
                   config.budgetAllocation.dailyExpenses;
      
      if (total !== 100) {
        console.warn(`Warning: Budget allocation percentages sum to ${total}%, not 100%. Using default values.`);
        return this.getDefaultConfig();
      }
      
      return config;
    } catch (error) {
      console.warn("Config file not found or invalid, using default configuration.");
      return this.getDefaultConfig();
    }
  }

  /**
   * Save configuration to file
   * @param config Application configuration
   */
  async saveConfig(config: AppConfig): Promise<void> {
    try {
      const data = JSON.stringify(config, null, 2);
      await fs.writeFile(this.configPath, data, "utf-8");
      console.log(`Configuration saved to: ${this.configPath}`);
    } catch (error) {
      console.error("Error saving configuration:", error);
      throw error;
    }
  }

  /**
   * Get default configuration
   * @returns AppConfig Default configuration
   */
  private getDefaultConfig(): AppConfig {
    return {
      budgetAllocation: {
        investments: 30,
        savings: 20,
        dailyExpenses: 50
      },
      version: "1.0.0",
      description: "Budget allocation percentages for FinCLI"
    };
  }

  /**
   * Validate budget allocation percentages
   * @param allocation Budget allocation configuration
   * @returns boolean True if valid
   */
  validateAllocation(allocation: BudgetAllocationConfig): boolean {
    const total = allocation.investments + allocation.savings + allocation.dailyExpenses;
    return total === 100 && 
           allocation.investments >= 0 && 
           allocation.savings >= 0 && 
           allocation.dailyExpenses >= 0;
  }
}
