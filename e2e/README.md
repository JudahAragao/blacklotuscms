# E2E Testing

## Setup
```bash
# Install Playwright
pnpm exec playwright install

# Run tests
pnpm exec playwright test
```

## Configuration
See `playwright.config.ts` (to be created).

## Test Structure
```
e2e/
├── auth/
│   ├── login.spec.ts
│   └── registration.spec.ts
├── posts/
│   ├── create.spec.ts
│   ├── edit.spec.ts
│   └── delete.spec.ts
├── media/
│   ├── upload.spec.ts
│   └── delete.spec.ts
├── admin/
│   ├── dashboard.spec.ts
│   └── settings.spec.ts
└── public/
    ├── home.spec.ts
    └── post.spec.ts
```

## Running Tests
```bash
# All tests
pnpm test:e2e

# Specific file
pnpm exec playwright test e2e/auth/login.spec.ts

# Headed mode (visible browser)
pnpm exec playwright test --headed

# Debug mode
pnpm exec playwright test --debug
```
