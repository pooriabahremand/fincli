import { promises as fs } from 'fs';
import { MonthlyAccounting, ExpenseWithAmount } from './types.js';

/**
 * Service for managing accounting reports
 */
export class ReportService {
  private readonly reportsDir = './reports';

  /**
   * Generate and save a monthly accounting report
   * @param accounting Monthly accounting data
   */
  async generateReport(accounting: MonthlyAccounting): Promise<void> {
    const reportPath = `${this.reportsDir}/${accounting.filename}.txt`;
    
    // Separate expenses by priority groups
    const criticalExpenses = accounting.expenses.filter(e => e.priority <= 2);
    const discretionaryExpenses = accounting.expenses.filter(e => e.priority >= 3);

    const reportContent = this.formatReport(
      accounting.filename,
      accounting.totalBudget,
      criticalExpenses,
      discretionaryExpenses,
      accounting.allocation
    );

    try {
      await fs.writeFile(reportPath, reportContent, 'utf-8');
      console.log(`Report saved to: ${reportPath}`);
    } catch (error) {
      console.error('Error saving report:', error);
      throw error;
    }
  }

  /**
   * Format the report content as plain text
   */
  private formatReport(
    filename: string,
    totalBudget: number,
    criticalExpenses: ExpenseWithAmount[],
    discretionaryExpenses: ExpenseWithAmount[],
    allocation: any
  ): string {
    let report = `Monthly Accounting – ${filename}\n`;
    report += `Total budget: ${totalBudget.toLocaleString()} tomans\n\n`;

    report += `Priority 1 & 2 (Critical / Essential)\n`;
    report += `-------------------------------------\n`;
    for (const expense of criticalExpenses) {
      report += `• ${expense.name} – ${expense.amount.toLocaleString()}\n`;
    }
    report += `\n`;

    report += `Priority 3–5 (Postponable / Comfort / Luxury)\n`;
    report += `---------------------------------------------\n`;
    for (const expense of discretionaryExpenses) {
      report += `• ${expense.name} – ${expense.amount.toLocaleString()}\n`;
    }
    report += `\n`;

    report += `Allocation Summary\n`;
    report += `------------------\n`;
    report += `Investments (30%): ${allocation.investments.toLocaleString()}\n`;
    report += `Savings      (20%): ${allocation.savings.toLocaleString()}\n`;
    report += `Daily use    (50%): ${allocation.dailyExpenses.toLocaleString()}  (after other expenses → ${allocation.dailyExpensesRemaining.toLocaleString()})\n`;

    return report;
  }

  /**
   * List all report files in the reports directory
   * @returns Promise<string[]> Array of report filenames
   */
  async listReports(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.reportsDir);
      return files.filter(file => file.endsWith('.txt'));
    } catch (error) {
      console.error('Error listing reports:', error);
      return [];
    }
  }

  /**
   * Read a specific report file
   * @param filename Report filename
   * @returns Promise<string> Report content
   */
  async readReport(filename: string): Promise<string> {
    try {
      const reportPath = `${this.reportsDir}/${filename}`;
      return await fs.readFile(reportPath, 'utf-8');
    } catch (error) {
      console.error('Error reading report:', error);
      throw error;
    }
  }

  /**
   * Update a report file with new content
   * @param filename Report filename
   * @param content New content
   */
  async updateReport(filename: string, content: string): Promise<void> {
    try {
      const reportPath = `${this.reportsDir}/${filename}`;
      await fs.writeFile(reportPath, content, 'utf-8');
      console.log(`Report updated: ${reportPath}`);
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  }
}

