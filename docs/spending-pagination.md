# Spending Page Pagination Feature

## Problem Statement

Currently, the spending page loads all transactions at once, which can lead to performance issues with large datasets. We need to implement pagination to improve load times and user experience by loading and displaying transactions in smaller chunks.

## Requirements

### Functional Requirements

1. Backend API Support

   - Modify `getTransactions` to support both paginated and non-paginated results via TypeScript overloads
   - Create new `getPaginatedSpendingRecords` function with start/count parameters
   - Return total count of records for pagination UI
   - Maintain consistent date descending order

2. Pagination Component

   - Display navigation buttons: First, Last, and page numbers
   - Show 5 page numbers centered around current page
   - Show ellipsis (...) when pages are skipped
   - Support page number clicks and first/last navigation

3. SpendingForm Integration
   - Default to 50 items per page
   - Store current page in URL search parameters using `useQueryState`
   - Reset pagination when filters are applied
   - Only implement pagination for "All" view
   - Handle invalid page numbers gracefully

### Non-Functional Requirements

1. Type Safety

   - Maintain existing TypeScript types for non-paginated API calls
   - Add new types for paginated responses

2. Performance
   - Minimize unnecessary re-renders in pagination component
   - Efficient state management for page transitions

## Design Decisions

1. API Structure

   - Use TypeScript overloads for `getTransactions` to maintain backward compatibility
   - Create separate `getPaginatedSpendingRecords` for cleaner implementation
   - Return type: `{ total: number; records: SpendingRecord[] }`

2. Pagination Strategy

   - Offset-based pagination using start/count
   - No cursor-based pagination needed
   - No dynamic page size configuration

3. State Management
   - Use URL search parameters for page state
   - Reset to page 1 on filter changes
   - Ignore pagination in "Group By Account" view

## Technical Design

### 1. Core Components

#### a. API Layer

```typescript
// Type definitions
interface PaginatedResponse<T> {
  total: number;
  records: T[];
}

// getTransactions overloads
function getTransactions(userId: string): Promise<SpendingRecord[]>;
function getTransactions(
  userId: string,
  pagination: { start: number; count: number }
): Promise<PaginatedResponse<SpendingRecord>>;

// New paginated records function
function getPaginatedSpendingRecords({
  db,
  userId,
  start,
  count,
}: {
  db: Db;
  userId: string;
  start: number;
  count: number;
}): Promise<PaginatedResponse<SpendingRecord>>;
```

#### b. Pagination Component

```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
```

#### c. SpendingForm Integration

```typescript
interface SpendingFormProps {
  transactions: SpendingRecord[] | PaginatedResponse<SpendingRecord>;
  categories: CategoryBudget[];
  accounts: AccountBase[];
  isPaginated?: boolean;
}
```

### 2. Integration Points

1. Page Component

   - Extract page from URL params
   - Pass pagination params to `getTransactions`
   - Pass paginated data to SpendingForm

2. SpendingForm Component

   - Handle both paginated and non-paginated data
   - Integrate Pagination component
   - Update URL state on page changes

3. Database Layer
   - Use Prisma's `skip` and `take` operators for pagination
   - Use Prisma's `count` method for total records
   - Ensure proper indexing on date field for efficient sorting and pagination

## Implementation Plan

1. Phase 1: Backend Implementation

   - Implement `getPaginatedSpendingRecords`
   - Add TypeScript overloads to `getTransactions`
   - Add tests for pagination logic

2. Phase 2: Frontend Components

   - Create reusable Pagination component
   - Add pagination state management
   - Implement URL parameter handling

3. Phase 3: Integration
   - Update SpendingForm to handle paginated data
   - Integrate pagination with filtering
   - Add error handling

## Progress Tracking

### Phase 1: Backend Implementation (✅ Complete)

- [x] Create `PaginatedResponse` type
- [x] Implement `getPaginatedSpendingRecords`
- [x] Add TypeScript overloads to `getTransactions`
- [x] Add pagination tests

### Phase 2: Frontend Components (✅ Complete)

- [x] Create Pagination component
- [x] Add page number generation logic
- [x] Implement URL state management
- [x] Add pagination component tests

### Phase 3: Integration (🟡 In Progress)

- [x] Update SpendingForm props and types
- [x] Integrate pagination with "All" view
- [ ] Add filter reset logic
- [ ] Add error handling for invalid pages
- [ ] Update page component to handle pagination

## Testing Strategy

### Unit Tests

1. API Layer

   - Test both overloads of `getTransactions`
   - Verify correct counting of total records
   - Test edge cases (empty results, invalid pages)

2. Pagination Component
   - Test page number generation logic
   - Verify correct ellipsis placement
   - Test boundary conditions (first/last pages)

### Integration Tests

1. End-to-end flow
   - Verify URL state updates
   - Test filter interaction with pagination
   - Verify data consistency across page changes

## Observability

### Logging

- Log pagination parameters for debugging
- Track invalid page requests
- Monitor response times for paginated queries

### Metrics

- Track average page size
- Monitor pagination query performance
- Track user navigation patterns

## Future Considerations

### Potential Enhancements

1. Add loading states during page transitions
2. Implement cursor-based pagination for better performance
3. Add configurable page sizes
4. Cache previously loaded pages
5. Add keyboard navigation support

### Known Limitations

1. No real-time updates during pagination
2. Limited to offset-based pagination
3. Fixed page size
4. No optimization for Plaid API calls

## Dependencies

### Runtime Dependencies

- Existing Prisma setup
- React Query (optional for caching)
- URL state management utilities

### Development Dependencies

- TypeScript
- Testing libraries
- Development tools remain unchanged
