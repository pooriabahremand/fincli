# FinCLI - Your Personal Finance Manager

FinCLI is a self-contained command-line interface (CLI) application to manage monthly finances. It guides you through setting a monthly budget, recording expenses by priority, allocating your budget, and generating versioned reports in both text and JSON formats.

## Features

- Interactive welcome screen with clear actions
- Create new accounting with dynamic expense input (predefined + custom)
- **Configurable budget allocation** - customize percentages for Investments, Savings, and Daily Expenses
- Generate reports as plain text and structured JSON
- Edit past accountings interactively:
  - Show current budget when changing budget
  - Show current amount when editing each expense
  - Rename expenses, change amounts, add new expenses
  - Recalculate allocation and save as a new version
- Versioned reports: `name-v1`, `name-v2`, ...
- Separate storage directories: `./reports/reports` for `.txt` and `./reports/json` for `.json`
- Clear criteria explanation for expense priorities

## Requirements

- Node.js (LTS recommended)

## Installation

```bash
git clone <repository-url>
cd fincli
npm install
```

## Running

```bash
npm start
```

This launches the interactive CLI.

## Directory Setup

No manual setup is required. The app will create these directories if they don't exist:

- `./reports/reports` for text reports
- `./reports/json` for JSON reports

Configuration and data files:
- `./config.json` - budget allocation percentages (auto-created with defaults)
- `./expenses.json` - base expense definitions

## Usage Walkthrough

### Create a new accounting

- Enter total budget (thousands of tomans). For example, `5000` → `5,000,000 tomans`.
- For each predefined expense: confirm if it applies, then enter amount (thousands).
- Add custom expenses if needed (name, priority 1–5, amount).
- Enter a base filename (without version). The app saves as the next version, e.g. `name-v1`.
- Outputs:
  - Text: `./reports/reports/name-v1.txt`
  - JSON: `./reports/json/name-v1.json`

### Edit past accountings

- Pick a report from the list (.txt files under `./reports/reports`).
- The app loads structured data (prefers JSON; falls back to parsing text).
- You can:
  - Change total budget (prompt shows current amount)
  - For each expense, see current amount and choose to rename and/or change amount
  - Add new expenses
- Allocation is recalculated using current configuration.
- Edits are saved as a new version (e.g., editing `name-v1` creates `name-v2`).

### Configure budget allocation

- Select "Configure budget allocation" from the main menu.
- View current percentages (default: Investments 30%, Savings 20%, Daily Expenses 50%).
- Enter new percentages for each category (must sum to exactly 100%).
- Configuration is saved to `./config.json` and used for all future calculations.

## Versioning Rules

- Create flow: You provide a base name (e.g., `my-report`). The app picks the next available version across both text and JSON directories, e.g., `my-report-v1`.
- Edit flow: The app bumps the current version (`my-report-v1` → `my-report-v2`) and saves the updated accounting under both directories.

## Expense Priorities

- Priorities 1 & 2: Critical / Essential expenses (must be paid first)
- Priorities 3–5: Discretionary expenses (postponable / comfort / luxury)

## Project Structure

```
fincli/
├── src/
│   ├── cli.ts
│   ├── expenseService.ts
│   ├── reportService.ts
│   ├── budgetCalculator.ts
│   ├── configService.ts
│   └── types.ts
├── reports/
│   ├── reports/        # text reports (.txt)
│   └── json/           # structured reports (.json)
├── config.json         # budget allocation configuration
├── expenses.json        # base expenses (name, priority, tags)
├── package.json
├── tsconfig.json
└── README.md
```

## Commands

- `npm start`: Run the CLI (TypeScript via ts-node)
- `npm run build`: Compile to JavaScript (`dist/`)
- `npm run lint`: Run ESLint

## Development Notes

- Interactive prompts are powered by `@inquirer/prompts`.
- File I/O uses Node `fs/promises`.
- Budget allocation is centralized in `src/budgetCalculator.ts` and uses configuration from `src/configService.ts`.
- Reports are generated via `src/reportService.ts` and include JSON persistence and versioning.
- Configuration is managed by `src/configService.ts` with validation to ensure percentages sum to 100%.

## Contributing

Issues and PRs are welcome. Please keep code readable, typed, and linted.

## License

MIT

