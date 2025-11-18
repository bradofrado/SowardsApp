# SowardsApp - Project Documentation

This is a monorepo containing three Next.js applications: Budget, Vacations, and Recipes. The project uses a turborepo structure with shared packages for common functionality.

## Project Structure

```
SowardsApp/
├── apps/
│   ├── budget/          # Budget tracking and financial management app
│   ├── recipes/         # Recipe management and collection app
│   └── vacations/       # Vacation planning and event management app
├── packages/
│   ├── api/            # Shared tRPC API routers and services
│   ├── db/             # Prisma schema and database client
│   ├── model/          # Zod schemas and TypeScript types
│   ├── next-utils/     # Shared Next.js utilities and API setup
│   └── ui/             # Shared UI components (shadcn/ui based)
└── devops/             # Docker and deployment configurations
```

## Technology Stack

### Core Technologies
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Package Manager**: pnpm (monorepo with workspaces)
- **Build System**: Turborepo
- **Database**: MongoDB (via Prisma)
- **ORM**: Prisma
- **API Layer**: tRPC
- **UI Library**: React + shadcn/ui (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS
- **Form Management**: React Hook Form + Zod validation
- **State Management**: React Query (via tRPC hooks)

### Key Dependencies
- `@trpc/server` & `@trpc/client` - Type-safe API layer
- `@prisma/client` - Database ORM
- `zod` - Runtime type validation and schema definition
- `next-auth` - Authentication (if applicable)
- `sonner` - Toast notifications
- `lucide-react` - Icon library

## Application Overview

### 1. Budget App
Financial tracking and budget management application with:
- Monthly budget tracking
- Income and expense categorization
- Plaid integration for bank account connections
- Spending goals and savings tracking
- Transaction management

### 2. Recipes App
Recipe collection and management application with:
- Recipe CRUD operations
- Recipe categories and organization
- Recipe import from URLs (web scraping)
- Ingredient and instruction management
- Recipe search and filtering

### 3. Vacations App
Vacation and event planning application with:
- Group vacation planning
- Event scheduling and management
- Shared itineraries
- User collaboration features

## Architecture Patterns

### Data Fetching Strategy

**IMPORTANT**: The preferred pattern for data fetching is to use Server Components with direct database access.

#### Preferred: Server Components with Direct Prisma Access
```tsx
// app/recipes/page.tsx (Server Component)
import { prisma } from "db/lib/prisma";

export default async function RecipesPage() {
  // Fetch data directly on the server
  const recipes = await prisma.recipe.findMany({
    where: { isPublic: true },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      {recipes.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
```

**Benefits:**
- No client-side JavaScript for data fetching
- Better performance (data fetched on server)
- Automatic request deduplication
- No loading states needed
- SEO-friendly

#### When to Use tRPC

tRPC should be used for:

1. **Mutations** - All data modifications (create, update, delete)
```tsx
"use client";

export function CreateRecipeForm() {
  const createRecipe = api.recipe.createRecipe.useMutation({
    onSuccess: () => router.refresh(), // Revalidate server data
  });

  // Form submission logic...
}
```

2. **Client-Side Queries** - Only when server component data fetching is not possible:
   - Real-time data updates
   - User-interactive filters/search
   - Infinite scroll/pagination
   - Client-side only features

3. **Dynamic User Interactions**
```tsx
"use client";

export function RecipeSearch() {
  const [search, setSearch] = useState("");
  const { data } = api.recipe.search.useQuery(
    { query: search },
    { enabled: search.length > 2 }
  );
}
```

### API Layer (tRPC)

The API layer is organized in `packages/api/src/routers/`:
- Each feature has its own router file
- Routers export a tRPC router object
- All routers are combined in the main `appRouter`

Example router structure:
```typescript
// packages/api/src/routers/recipe.ts
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const recipeRouter = createTRPCRouter({
  getRecipes: protectedProcedure
    .input(z.object({ categoryId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.recipe.findMany({
        where: { categoryId: input.categoryId },
      });
    }),

  createRecipe: protectedProcedure
    .input(createRecipeSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.recipe.create({ data: input });
    }),
});
```

### Database Schema (Prisma)

Database schema is defined in `packages/db/prisma/schema.prisma`:
- MongoDB is used as the database
- All models use ObjectId for primary keys
- Shared schema across all three applications
- Each app's data is isolated by userId

Common patterns:
- `@map("snake_case")` for field names
- `@default(now())` for timestamps
- Relations using `@relation` with proper references

### Type Safety (Zod + TypeScript)

Zod schemas are defined in `packages/model/src/`:
- Each feature has a dedicated schema file
- Schemas are used for both validation and type inference
- Types are exported for use throughout the application

Example:
```typescript
// packages/model/src/recipe.ts
export const recipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  ingredients: z.array(z.string()),
  // ... other fields
});

export type Recipe = z.infer<typeof recipeSchema>;

export const createRecipeSchema = recipeSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
```

## Code Organization Guidelines

### Component Structure

**Decompose components into small, isolated, focused units.**

#### File Organization
```
app/
├── recipe/
│   ├── [id]/
│   │   ├── page.tsx              # Main page (Server Component)
│   │   ├── actions.ts            # Server actions
│   │   └── components/
│   │       ├── RecipeHeader.tsx
│   │       ├── RecipeIngredients.tsx
│   │       ├── RecipeInstructions.tsx
│   │       └── RecipeNotes.tsx
│   └── components/
│       ├── RecipeCard.tsx
│       ├── RecipeFilters.tsx
│       └── RecipeSearch.tsx
```

#### Component Size Guidelines

**DO**: Create small, single-responsibility components
```tsx
// components/RecipeHeader.tsx
interface RecipeHeaderProps {
  title: string;
  category?: string;
  imageUrl?: string;
}

export function RecipeHeader({ title, category, imageUrl }: RecipeHeaderProps) {
  return (
    <div>
      {imageUrl && <img src={imageUrl} alt={title} />}
      <h1>{title}</h1>
      {category && <span>{category}</span>}
    </div>
  );
}
```

**DON'T**: Create monolithic components with multiple responsibilities
```tsx
// ❌ Bad: Everything in one component
export function RecipePage() {
  // 500+ lines of code handling:
  // - Data fetching
  // - Form state
  // - Validation
  // - UI rendering
  // - Event handlers
  return <div>{/* massive JSX tree */}</div>;
}
```

#### Action Files

Extract server actions into dedicated files:
```typescript
// app/recipe/actions.ts
"use server";

import { prisma } from "db/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteRecipe(recipeId: string) {
  await prisma.recipe.delete({
    where: { id: recipeId },
  });

  revalidatePath("/recipes");
}

export async function toggleRecipePublic(recipeId: string, isPublic: boolean) {
  await prisma.recipe.update({
    where: { id: recipeId },
    data: { isPublic },
  });

  revalidatePath(`/recipe/${recipeId}`);
}
```

### Service Layer

Business logic should be extracted into service files:
```typescript
// packages/api/src/services/recipe/scrape-website.ts
export class RecipeScraper {
  async scrapeRecipe(url: string): Promise<Recipe | null> {
    // Scraping logic...
  }

  private extractFromJsonLd($: cheerio.CheerioAPI): Recipe | null {
    // Extraction logic...
  }
}
```

### Utility Functions

Keep utility functions in dedicated files:
```typescript
// app/lib/utils/time.ts
export function parseIsoTime(isoTime?: string): number | undefined {
  if (!isoTime) return undefined;
  const regex = /PT(\d+)M/;
  const match = regex.exec(isoTime);
  return match?.[1] ? parseInt(match[1]) : undefined;
}
```

## Development Workflow

### Running the Project

```bash
# Install dependencies
pnpm install

# Run all apps in development mode
pnpm dev

# Run specific app
cd apps/recipes && pnpm dev

# Database operations
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema changes to database
pnpm db:studio    # Open Prisma Studio

# Build all apps
pnpm build

# Lint and type check
pnpm lint
pnpm typecheck
```

### Database Migrations

When updating the Prisma schema:
1. Update `packages/db/prisma/schema.prisma`
2. Run `pnpm db:generate` to update TypeScript types
3. Run `pnpm db:push` to push changes to the database (development)
4. Restart dev servers to pick up new types

### Adding New Features

1. **Define the schema** in `packages/model/src/`
2. **Update Prisma schema** in `packages/db/prisma/schema.prisma`
3. **Create tRPC router** in `packages/api/src/routers/`
4. **Build UI components** in the relevant app
5. **Create server components** for pages with direct data access
6. **Add client components** only when interactivity is needed

## Best Practices

### Server vs Client Components

**Default to Server Components** unless you need:
- Event handlers (onClick, onChange, etc.)
- React hooks (useState, useEffect, etc.)
- Browser-only APIs
- Real-time updates

Mark client components explicitly:
```tsx
"use client"; // Only add when necessary

export function InteractiveButton() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Error Handling

Use proper error handling in tRPC procedures:
```typescript
scrapeRecipeFromUrl: protectedProcedure
  .input(z.object({ url: z.string().url() }))
  .mutation(async ({ input, ctx }) => {
    const scrapedRecipe = await scraper.scrapeRecipe(input.url);

    if (!scrapedRecipe) {
      throw new Error("Failed to scrape recipe from URL");
    }

    return ctx.prisma.recipe.create({ data: scrapedRecipe });
  }),
```

### Type Safety

Always use proper TypeScript types:
- Import types from `model` package
- Use Zod schemas for validation
- Avoid `any` types
- Use proper type guards when needed

### Component Props

Use TypeScript interfaces for component props:
```tsx
interface RecipeCardProps {
  recipe: Recipe;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function RecipeCard({ recipe, onDelete, showActions = true }: RecipeCardProps) {
  // Component implementation
}
```

### Testing Strategy

- Unit test utility functions and services
- Integration test tRPC procedures
- E2E test critical user flows
- Use proper test isolation with test databases

## Authentication & Authorization

- Authentication is handled via NextAuth (or similar)
- User context is available in tRPC procedures via `ctx.session`
- All protected routes use `protectedProcedure` in tRPC
- Client-side protection via middleware and route guards

## Styling Guidelines

- Use Tailwind CSS utility classes
- Follow shadcn/ui component patterns
- Keep consistent spacing (rem units)
- Use theme tokens for colors
- Responsive design with mobile-first approach

```tsx
<Card className="p-8 border-border bg-card">
  <h2 className="text-2xl font-semibold text-foreground mb-6">
    Ingredients
  </h2>
</Card>
```

## Package Dependencies

Each package should:
- Have minimal dependencies
- Export clear public APIs
- Maintain internal implementation details as private
- Use workspace protocol for internal dependencies

```json
{
  "dependencies": {
    "db": "workspace:*",
    "model": "workspace:*",
    "next-utils": "workspace:*"
  }
}
```

## Deployment

- Each app can be deployed independently
- Shared packages are bundled during build
- Environment variables managed via `.env` files
- Docker configurations available in `devops/`

## Contributing

When adding new features:
1. Follow the existing patterns and structure
2. Keep components small and focused
3. Prefer server components for data fetching
4. Use tRPC for mutations and client-side queries only
5. Add proper TypeScript types
6. Update this documentation if adding new patterns

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Turborepo Documentation](https://turbo.build/repo/docs)
