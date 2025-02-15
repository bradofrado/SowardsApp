# Budget Automation Cron Jobs

## Problem Statement

Currently, budget updates are triggered in the `getBudgets` function, which is not ideal for automation. We need to:

1. Move the budget update logic to a scheduled job
2. Create a new automated transfer system for budget items with cadence amounts

## Requirements

### Functional Requirements

1. Budget Update Job

   - Move existing logic from `getBudgets` to a scheduled job
   - Create new budget items for expired periods
   - Support all cadence types (weekly, monthly, yearly, eventually, fixed)

2. Automated Transfer Job
   - Process all budget items with cadenceAmount > 0
   - Transfer min(cadenceAmount, targetAmount - amount)
   - Use makeExpenseTransaction with null 'from' field
   - Both jobs run first day of each month

### Non-Functional Requirements

1. Reliability

   - Wrap user operations in transactions
   - Log failures separately from successes
   - Handle database connection properly

2. Maintainability
   - Add proper testing infrastructure
   - Implement monitoring
   - Structured logging

## Design Decisions

### 1. File Structure

packages/api/src/
services/
budget-updates.ts # New file for cron job logic
budget.ts # Existing file, remove update logic
repositories/
budget/
user-vacation.ts # New file for user queries
cron/
handlers.ts # Cron job implementations

### 2. Key Interfaces

typescript
// user-vacation.ts
interface UserVacationRepository {
getAllActiveUserVacations(): Promise<UserVacation[]>
}
// budget-updates.ts
interface BudgetUpdateService {
updateExpiredBudgets(userVacation: UserVacation): Promise<void>
processAutomatedTransfers(userVacation: UserVacation): Promise<void>
}
// Logging
interface CronJobLog {
jobType: 'budget-update' | 'transfer'
userVacationId: string
success: boolean
itemsProcessed: number
error?: string
}

## Technical Design

### 1. Core Components

#### UserVacation Repository

typescript
export const getAllActiveUserVacations = async (db: Db) => {
return db.userVacation.findMany({
include: {
budgets: {
include: {
budgetItems: true
}
}
}
});
};

#### Budget Update Service

typescript
export const updateExpiredBudgets = async (
db: Db,
userVacation: UserVacation
) => {
return db.$transaction(async (tx) => {
// Existing logic from getBudgets
});
};
export const processAutomatedTransfers = async (
db: Db,
userVacation: UserVacation
) => {
return db.$transaction(async (tx) => {
const budgetItems = await getBudgetItemsOfType({
db: tx,
userId: userVacation.id,
type: "expense"
});
for (const item of budgetItems) {
if (item.cadenceAmount <= 0) continue;
const transferAmount = Math.min(
item.cadenceAmount,
item.targetAmount - item.amount
);
if (transferAmount <= 0) continue;
await makeExpenseTransaction({
db: tx,
from: null,
to: item,
amount: transferAmount,
date: new Date()
});
}
});
};

### 2. Integration Points

#### Vercel Cron Configuration

json
{
"crons": [{
"path": "/api/cron/budget-updates",
"schedule": "0 0 1 "
}]
}

#### API Routes

typescript
export default async function handler(
req: NextApiRequest,
res: NextApiResponse
) {
try {
const users = await getAllActiveUserVacations(prisma);
for (const user of users) {
try {
await updateExpiredBudgets(prisma, user);
await processAutomatedTransfers(prisma, user);
// Log success
} catch (error) {
// Log error for this user
continue;
}
}
res.status(200).json({ success: true });
} catch (error) {
// Log critical error
res.status(500).json({ success: false });
}
}

## Testing Strategy

### Integration Tests

typescript
describe('Budget Update Cron', () => {
it('should update expired budgets', async () => {
// Setup test data
// Run job
// Verify updates
});
it('should process automated transfers', async () => {
// Setup test data
// Run job
// Verify transfers
});
});

## Observability

### Logging

- Job start/completion
- Per-user success/failure
- Transfer amounts and budget updates
- Error details (non-sensitive)

### Monitoring

- Job execution success/failure
- Number of users processed
- Number of updates/transfers
- Error rate

## Dependencies

### Runtime Dependencies

- Existing packages (db, model)
- Prisma Client
- Logging solution (TBD)

### Development Dependencies

- Jest
- ts-jest
- @types/jest
