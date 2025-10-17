import { promises as fs } from "fs";
import { MonthlyAccounting, ExpenseWithAmount } from "./types";

/**
 * Service for managing accounting reports
 */
export class ReportService {
  private readonly reportsDir = "./reports";
  private readonly textDir = "./reports/reports";
  private readonly jsonDir = "./reports/json";

  private async ensureDirs(): Promise<void> {
    await fs.mkdir(this.reportsDir, { recursive: true });
    await fs.mkdir(this.textDir, { recursive: true });
    await fs.mkdir(this.jsonDir, { recursive: true });
  }

  /**
   * Generate and save a monthly accounting report
   * @param accounting Monthly accounting data
   */
  async generateReport(accounting: MonthlyAccounting): Promise<void> {
    await this.ensureDirs();
    const reportPath = `${this.textDir}/${accounting.filename}.txt`;
    const jsonPath = `${this.jsonDir}/${accounting.filename}.json`;

    // Separate expenses by priority groups
    const criticalExpenses = accounting.expenses.filter((e) => e.priority <= 2);
    const discretionaryExpenses = accounting.expenses.filter(
      (e) => e.priority >= 3
    );

    const reportContent = this.formatReport(
      accounting.filename,
      accounting.totalBudget,
      criticalExpenses,
      discretionaryExpenses,
      accounting.allocation
    );

    try {
      await fs.writeFile(reportPath, reportContent, "utf-8");
      console.log(`Report saved to: ${reportPath}`);
      // Persist structured data alongside the text report
      await fs.writeFile(jsonPath, JSON.stringify(accounting, null, 2), "utf-8");
    } catch (error) {
      console.error("Error saving report:", error);
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
      await this.ensureDirs();
      const files = await fs.readdir(this.textDir);
      return files.filter((file) => file.endsWith(".txt"));
    } catch (error) {
      console.error("Error listing reports:", error);
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
      await this.ensureDirs();
      const reportPath = `${this.textDir}/${filename}`;
      return await fs.readFile(reportPath, "utf-8");
    } catch (error) {
      console.error("Error reading report:", error);
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
      await this.ensureDirs();
      const reportPath = `${this.textDir}/${filename}`;
      await fs.writeFile(reportPath, content, "utf-8");
      console.log(`Report updated: ${reportPath}`);
    } catch (error) {
      console.error("Error updating report:", error);
      throw error;
    }
  }

  /**
   * Load structured accounting from JSON if available; otherwise parse from text.
   * @param reportTxtFilename e.g., "july-2025-accounting.txt"
   */
  async loadAccounting(reportTxtFilename: string): Promise<MonthlyAccounting> {
    await this.ensureDirs();
    const base = reportTxtFilename.replace(/\.txt$/i, "");
    const jsonPath = `${this.jsonDir}/${base}.json`;
    const txtPath = `${this.textDir}/${base}.txt`;

    // Try JSON first
    try {
      const json = await fs.readFile(jsonPath, "utf-8");
      return JSON.parse(json) as MonthlyAccounting;
    } catch {
      // Fallback to parsing text
    }

    const txt = await fs.readFile(txtPath, "utf-8");
    return this.parseTextReport(base, txt);
  }

  /**
   * Save structured accounting JSON and regenerate the .txt report.
   */
  async saveAccounting(accounting: MonthlyAccounting): Promise<void> {
    await this.generateReport(accounting);
  }

  /**
   * Compute next versioned filename based on existing text/json files.
   * Input base should be without version and extension.
   */
  async nextVersionName(base: string): Promise<string> {
    await this.ensureDirs();
    const textFiles = await fs.readdir(this.textDir);
    const jsonFiles = await fs.readdir(this.jsonDir);
    const all = [...textFiles, ...jsonFiles];
    let maxV = 0;
    const re = new RegExp(`^${this.escapeRegExp(base)}-v(\\d+)\\.(txt|json)$`);
    for (const f of all) {
      const m = f.match(re);
      if (m) {
        const v = parseInt(m[1], 10);
        if (!isNaN(v)) maxV = Math.max(maxV, v);
      }
    }
    return `${base}-v${maxV + 1}`;
  }

  /**
   * Bump an existing versioned name like name-v3 to the next available name.
   */
  async bumpVersionName(versionedName: string): Promise<string> {
    const m = versionedName.match(/^(.*)-v(\d+)$/);
    if (!m) {
      return this.nextVersionName(versionedName);
    }
    const base = m[1];
    let v = parseInt(m[2], 10) || 0;
    await this.ensureDirs();
    const textFiles = await fs.readdir(this.textDir);
    const jsonFiles = await fs.readdir(this.jsonDir);
    const existing = new Set([
      ...textFiles.map((f) => f.replace(/\.txt$/, "")),
      ...jsonFiles.map((f) => f.replace(/\.json$/, "")),
    ]);
    let candidate = `${base}-v${v + 1}`;
    while (existing.has(candidate)) {
      v++;
      candidate = `${base}-v${v + 1}`;
    }
    return candidate;
  }

  /**
   * Parse legacy text report into a structured MonthlyAccounting approximation.
   * Priorities are inferred from sections; tags are omitted.
   */
  private parseTextReport(filename: string, content: string): MonthlyAccounting {
    // Extract total budget
    const totalLine = content
      .split(/\r?\n/)
      .find((l) => l.toLowerCase().startsWith("total budget:"));
    const totalBudget = totalLine
      ? this.parseAmount(totalLine.replace(/^[^:]*:\s*/, ""))
      : 0;

    // Determine sections
    const lines = content.split(/\r?\n/);
    let section: "critical" | "discretionary" | null = null;
    const expenses: ExpenseWithAmount[] = [] as any;
    for (const line of lines) {
      if (line.includes("Priority 1 & 2")) section = "critical";
      else if (line.includes("Priority 3–5") || line.includes("Priority 3-5")) section = "discretionary";
      else if (line.trim().startsWith("•")) {
        const m = line.replace(/^•\s*/, "").split(" – ");
        if (m.length === 2) {
          const name = m[0].trim();
          const amount = this.parseAmount(m[1]);
          const priority = section === "critical" ? 2 : 3;
          expenses.push({ name, amount, priority, tags: [] });
        }
      }
    }

    // Minimal allocation; callers should recompute using BudgetCalculator
    return {
      filename,
      totalBudget,
      expenses,
      // Temporary values; expected to be recalculated by caller
      allocation: {
        investments: 0,
        savings: 0,
        dailyExpenses: 0,
        dailyExpensesRemaining: 0,
      },
    } as MonthlyAccounting;
  }

  private parseAmount(text: string): number {
    const numeric = text.replace(/[^0-9]/g, "");
    const parsed = parseInt(numeric || "0", 10);
    return isNaN(parsed) ? 0 : parsed;
  }

  private escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
