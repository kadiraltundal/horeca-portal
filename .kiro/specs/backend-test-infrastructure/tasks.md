# Implementation Plan

# Backend Test Infrastructure - Task List

## Overview

Market QR backend uygulaması için eksiksiz test altyapısı kurulumu. 29 NestJS modülü için Jest configuration, unit testler (service + controller) ve E2E testler oluşturulacak. %80+ test coverage hedefine ulaşılacak.

## Tasks

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Test Infrastructure Missing Verification
  - **IMPORTANT**: Write this property-based test BEFORE implementing the fix
  - **GOAL**: Surface counterexamples that demonstrate test infrastructure is completely missing
  - **Scoped PBT Approach**: Scope the property to concrete failing cases - npm test command fails, no .spec.ts files exist, jest.config.js missing
  - Test that test infrastructure is absent (from Bug Condition in design):
    - `npm test` command exits with code 1 (no tests found error)
    - backend/src/modules/ directory contains 0 .spec.ts files
    - jest.config.js file does not exist
    - test/ directory for e2e tests does not exist
    - test coverage is 0%
  - Run test on UNFIXED code - expect FAILURE (this confirms the bug exists)
  - Document counterexamples found (e.g., "npm test returns exit code 1 with 'No tests found' error")
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Backend Functionality Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for non-buggy inputs (existing backend functionality):
    - Run `npm run dev` and verify backend starts successfully
    - Test sample API endpoints (GET /health, POST /auth/login, GET /products) and record responses
    - Run `npm run build` and verify dist/ folder is created
    - Verify JWT token generation and validation works
    - Test database CRUD operations through API
    - Verify authentication guards work correctly
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - API endpoints return same status codes and response structures
    - Build process completes successfully
    - Development mode hot-reload works
    - Authentication mechanism unchanged
    - Database operations function correctly
    - Other npm scripts (lint, start:prod) work as expected
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 3. Setup complete test infrastructure for 29 NestJS modules

  - [ ] 3.1 Configure Jest for NestJS
    - Create `apps/backend/jest.config.js` with proper configuration
    - Setup moduleNameMapper for TypeScript path aliases (@modules, @common, @config)
    - Configure testRegex to match .spec.ts files
    - Setup collectCoverageFrom to include src/**/*.ts
    - Set coverageThreshold to global 80%
    - Configure testEnvironment as 'node'
    - Add transform configuration for ts-jest
    - _Bug_Condition: isBugCondition(backendProject) where NOT fileExists(jest.config.js) AND testFileCount == 0_
    - _Expected_Behavior: Test infrastructure fully operational - npm test executes all tests, coverage >= 80%_
    - _Preservation: Backend build and dev scripts continue working unchanged_
    - _Requirements: 1.3, 2.3, 2.4_

  - [ ] 3.2 Setup E2E test infrastructure
    - Create `apps/backend/test/` directory
    - Create `apps/backend/test/jest-e2e.json` configuration
    - Configure e2e specific settings (testRegex: .e2e-spec.ts, maxWorkers: 1, testTimeout: 30000)
    - Create `apps/backend/test/app.e2e-spec.ts` for health check test
    - Create `apps/backend/test/auth.e2e-spec.ts` for authentication flow test
    - _Bug_Condition: NOT directoryExists(test/) AND e2e tests cannot run_
    - _Expected_Behavior: npm run test:e2e executes e2e tests successfully_
    - _Preservation: API endpoints behavior unchanged_
    - _Requirements: 1.8, 2.8_

  - [ ] 3.3 Update package.json dependencies and scripts
    - Verify/add jest dependency (^29.7.0)
    - Verify/add ts-jest dependency (^29.1.0)
    - Verify/add @types/jest dependency (^29.5.0)
    - Verify @nestjs/testing is in devDependencies
    - Update scripts section:
      - "test": "jest"
      - "test:watch": "jest --watch"
      - "test:cov": "jest --coverage"
      - "test:e2e": "jest --config ./test/jest-e2e.json"
    - _Bug_Condition: Test scripts fail or return exit code != 0_
    - _Expected_Behavior: All test scripts execute successfully_
    - _Preservation: Other npm scripts (dev, build, lint) unchanged_
    - _Requirements: 1.4, 2.4_

  - [ ] 3.4 Create common test utilities
    - Create `apps/backend/src/common/test/test-utils.ts`
    - Implement createMockPrismaService() factory function
    - Implement createMockConfigService() factory function
    - Implement createMockJwtService() factory function
    - Implement test data builders (createTestUser, createTestProduct, createTestOrder)
    - _Bug_Condition: No reusable test utilities exist_
    - _Expected_Behavior: Common mocks available for all test files_
    - _Preservation: No impact on runtime code_
    - _Requirements: 2.2, 2.5_

  - [ ] 3.5 Write unit tests for auth module
    - Create `apps/backend/src/modules/auth/auth.service.spec.ts`
    - Create `apps/backend/src/modules/auth/auth.controller.spec.ts`
    - Create `apps/backend/src/modules/auth/jwt.strategy.spec.ts`
    - Test login, register, token validation, password hashing
    - Mock PrismaService and JwtService dependencies
    - Achieve 80%+ coverage for auth module
    - _Bug_Condition: Auth module has 0 test files_
    - _Expected_Behavior: Auth tests pass, coverage >= 80%_
    - _Preservation: JWT authentication mechanism unchanged_
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.6 Write unit tests for users module
    - Create `apps/backend/src/modules/users/users.service.spec.ts`
    - Create `apps/backend/src/modules/users/users.controller.spec.ts`
    - Test CRUD operations (create, findAll, findOne, update, delete)
    - Mock PrismaService dependency
    - Test error handling (user not found, validation errors)
    - Achieve 80%+ coverage for users module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.7 Write unit tests for products module
    - Create `apps/backend/src/modules/products/products.service.spec.ts`
    - Create `apps/backend/src/modules/products/products.controller.spec.ts`
    - Test product CRUD operations
    - Test barcode generation and validation
    - Mock PrismaService dependency
    - Achieve 80%+ coverage for products module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.8 Write unit tests for categories module
    - Create `apps/backend/src/modules/categories/categories.service.spec.ts`
    - Create `apps/backend/src/modules/categories/categories.controller.spec.ts`
    - Test category CRUD operations
    - Test hierarchical category relationships
    - Achieve 80%+ coverage for categories module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.9 Write unit tests for stores module
    - Create `apps/backend/src/modules/stores/stores.service.spec.ts`
    - Create `apps/backend/src/modules/stores/stores.controller.spec.ts`
    - Test store CRUD operations
    - Test store configuration management
    - Achieve 80%+ coverage for stores module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.10 Write unit tests for inventory module
    - Create `apps/backend/src/modules/inventory/inventory.service.spec.ts`
    - Create `apps/backend/src/modules/inventory/inventory.controller.spec.ts`
    - Test inventory tracking operations
    - Test stock level calculations
    - Test low stock alerts
    - Achieve 80%+ coverage for inventory module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.11 Write unit tests for orders module
    - Create `apps/backend/src/modules/orders/orders.service.spec.ts`
    - Create `apps/backend/src/modules/orders/orders.controller.spec.ts`
    - Test order creation and management
    - Test order status transitions
    - Test order total calculations
    - Achieve 80%+ coverage for orders module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.12 Write unit tests for payments module
    - Create `apps/backend/src/modules/payments/payments.service.spec.ts`
    - Create `apps/backend/src/modules/payments/payments.controller.spec.ts`
    - Test payment processing
    - Test payment status tracking
    - Test refund handling
    - Achieve 80%+ coverage for payments module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.13 Write unit tests for analytics module
    - Create `apps/backend/src/modules/analytics/analytics.service.spec.ts`
    - Test analytics data aggregation
    - Test report generation
    - Test metrics calculations
    - Achieve 80%+ coverage for analytics module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.14 Write unit tests for notifications module
    - Create `apps/backend/src/modules/notifications/notifications.service.spec.ts`
    - Create `apps/backend/src/modules/notifications/notifications.controller.spec.ts`
    - Test notification creation and delivery
    - Test notification status tracking
    - Mock external notification services
    - Achieve 80%+ coverage for notifications module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.15 Write unit tests for qr module
    - Create `apps/backend/src/modules/qr/qr.service.spec.ts`
    - Create `apps/backend/src/modules/qr/qr.controller.spec.ts`
    - Test QR code generation
    - Test QR code validation
    - Test table mapping
    - Achieve 80%+ coverage for qr module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.16 Write unit tests for organizations module
    - Create `apps/backend/src/modules/organizations/organizations.service.spec.ts`
    - Create `apps/backend/src/modules/organizations/organizations.controller.spec.ts`
    - Test organization CRUD operations
    - Test organization-user relationships
    - Achieve 80%+ coverage for organizations module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.17 Write unit tests for batches module
    - Create `apps/backend/src/modules/batches/batches.service.spec.ts`
    - Create `apps/backend/src/modules/batches/batches.controller.spec.ts`
    - Test batch creation and tracking
    - Test batch expiration logic
    - Achieve 80%+ coverage for batches module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.18 Write unit tests for pricing module
    - Create `apps/backend/src/modules/pricing/pricing.service.spec.ts`
    - Create `apps/backend/src/modules/pricing/pricing.controller.spec.ts`
    - Test price calculations
    - Test discount applications
    - Test price history tracking
    - Achieve 80%+ coverage for pricing module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.19 Write unit tests for promotions module
    - Create `apps/backend/src/modules/promotions/promotions.service.spec.ts`
    - Create `apps/backend/src/modules/promotions/promotions.controller.spec.ts`
    - Test promotion creation and management
    - Test promotion validation and application
    - Test promotion expiration logic
    - Achieve 80%+ coverage for promotions module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.20 Write unit tests for loyalty module
    - Create `apps/backend/src/modules/loyalty/loyalty.service.spec.ts`
    - Create `apps/backend/src/modules/loyalty/loyalty.controller.spec.ts`
    - Test loyalty points calculations
    - Test rewards management
    - Test tier management
    - Achieve 80%+ coverage for loyalty module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.21 Write unit tests for customers module
    - Create `apps/backend/src/modules/customers/customers.service.spec.ts`
    - Create `apps/backend/src/modules/customers/customers.controller.spec.ts`
    - Test customer CRUD operations
    - Test customer search and filtering
    - Achieve 80%+ coverage for customers module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.22 Write unit tests for media module
    - Create `apps/backend/src/modules/media/media.service.spec.ts`
    - Create `apps/backend/src/modules/media/media.controller.spec.ts`
    - Test file upload handling
    - Test media storage operations
    - Test media retrieval and serving
    - Achieve 80%+ coverage for media module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.23 Write unit tests for cms module
    - Create `apps/backend/src/modules/cms/cms.service.spec.ts`
    - Create `apps/backend/src/modules/cms/cms.controller.spec.ts`
    - Test content management operations
    - Test content publishing workflow
    - Achieve 80%+ coverage for cms module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.24 Write unit tests for scan module
    - Create `apps/backend/src/modules/scan/scan.service.spec.ts`
    - Create `apps/backend/src/modules/scan/scan.controller.spec.ts`
    - Test QR code scanning logic
    - Test scan event tracking
    - Achieve 80%+ coverage for scan module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.25 Write unit tests for audit module
    - Create `apps/backend/src/modules/audit/audit.service.spec.ts`
    - Create `apps/backend/src/modules/audit/audit.controller.spec.ts`
    - Test audit log creation
    - Test audit log querying and filtering
    - Achieve 80%+ coverage for audit module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.26 Write unit tests for scheduler module
    - Create `apps/backend/src/modules/scheduler/scheduler.service.spec.ts`
    - Test scheduled job execution
    - Test job scheduling and cancellation
    - Test cron expression parsing
    - Achieve 80%+ coverage for scheduler module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.27 Write unit tests for dashboard module
    - Create `apps/backend/src/modules/dashboard/dashboard.service.spec.ts`
    - Create `apps/backend/src/modules/dashboard/dashboard.controller.spec.ts`
    - Test dashboard metrics aggregation
    - Test real-time data updates
    - Achieve 80%+ coverage for dashboard module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.28 Write unit tests for suppliers module
    - Create `apps/backend/src/modules/suppliers/suppliers.service.spec.ts`
    - Create `apps/backend/src/modules/suppliers/suppliers.controller.spec.ts`
    - Test supplier CRUD operations
    - Test supplier contact management
    - Achieve 80%+ coverage for suppliers module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.29 Write unit tests for stock-movement module
    - Create `apps/backend/src/modules/stock-movement/stock-movement.service.spec.ts`
    - Create `apps/backend/src/modules/stock-movement/stock-movement.controller.spec.ts`
    - Test stock movement tracking
    - Test movement history queries
    - Achieve 80%+ coverage for stock-movement module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.30 Write unit tests for purchase-order module
    - Create `apps/backend/src/modules/purchase-order/purchase-order.service.spec.ts`
    - Create `apps/backend/src/modules/purchase-order/purchase-order.controller.spec.ts`
    - Test purchase order creation and management
    - Test purchase order status tracking
    - Achieve 80%+ coverage for purchase-order module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.31 Write unit tests for refund module
    - Create `apps/backend/src/modules/refund/refund.service.spec.ts`
    - Create `apps/backend/src/modules/refund/refund.controller.spec.ts`
    - Test refund request processing
    - Test refund approval workflow
    - Achieve 80%+ coverage for refund module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.32 Write unit tests for cash-drawer module
    - Create `apps/backend/src/modules/cash-drawer/cash-drawer.service.spec.ts`
    - Create `apps/backend/src/modules/cash-drawer/cash-drawer.controller.spec.ts`
    - Test cash drawer operations
    - Test cash balance calculations
    - Achieve 80%+ coverage for cash-drawer module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.33 Write unit tests for z-report module
    - Create `apps/backend/src/modules/z-report/z-report.service.spec.ts`
    - Create `apps/backend/src/modules/z-report/z-report.controller.spec.ts`
    - Test Z-report generation
    - Test daily sales summary calculations
    - Achieve 80%+ coverage for z-report module
    - _Requirements: 1.2, 2.2, 2.5_

  - [ ] 3.34 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Test Infrastructure Fully Operational
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - Run bug condition exploration test from step 1
    - Verify that:
      - `npm test` command runs successfully with exit code 0
      - All .spec.ts files are discovered and executed
      - jest.config.js exists and is properly configured
      - test/ directory exists with e2e tests
      - Test coverage report shows >= 80% coverage
    - **EXPECTED OUTCOME**: Test PASSES (confirms test infrastructure is complete)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ] 3.35 Verify preservation tests still pass
    - **Property 2: Preservation** - Backend Functionality Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - Verify that:
      - Backend starts successfully with `npm run dev`
      - All API endpoints return same responses
      - `npm run build` creates dist/ folder successfully
      - JWT authentication works unchanged
      - Database operations function correctly
      - Other npm scripts work as expected
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Run `npm test` and verify all unit tests pass
  - Run `npm run test:cov` and verify coverage >= 80% globally
  - Run `npm run test:e2e` and verify e2e tests pass
  - Run `npm run build` and verify production build succeeds
  - Run `npm run dev` and verify backend starts successfully
  - Test sample API endpoints manually to confirm functionality preserved
  - Ensure all tests pass, ask the user if questions arise

## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": "wave-1",
      "name": "Exploration and Preservation",
      "tasks": ["1", "2"]
    },
    {
      "id": "wave-2",
      "name": "Infrastructure Setup",
      "tasks": ["3.1", "3.2", "3.3"],
      "dependsOn": ["wave-1"]
    },
    {
      "id": "wave-3",
      "name": "Test Utilities",
      "tasks": ["3.4"],
      "dependsOn": ["wave-2"]
    },
    {
      "id": "wave-4",
      "name": "Module Tests",
      "tasks": ["3.5", "3.6", "3.7", "3.8", "3.9", "3.10", "3.11", "3.12", "3.13", "3.14", "3.15", "3.16", "3.17", "3.18", "3.19", "3.20", "3.21", "3.22", "3.23", "3.24", "3.25", "3.26", "3.27", "3.28", "3.29", "3.30", "3.31", "3.32", "3.33"],
      "dependsOn": ["wave-3"]
    },
    {
      "id": "wave-5",
      "name": "Verification",
      "tasks": ["3.34", "3.35"],
      "dependsOn": ["wave-4"]
    },
    {
      "id": "wave-6",
      "name": "Final Checkpoint",
      "tasks": ["4"],
      "dependsOn": ["wave-5"]
    }
  ]
}
```

## Notes

- Bu bugfix, test infrastructure'ın tamamen eksik olması sorununu çözüyor
- Bugfix workflow metodolojisi kullanılıyor (Bug Condition → Property → Preservation)
- Task 1: Exploration test UNFIXED code'da FAIL etmeli (bug'ı tespit eder)
- Task 2: Preservation tests UNFIXED code'da PASS etmeli (baseline behavior)
- Task 3.5-3.33: 29 modül için paralel olarak testler yazılabilir
- Task 3.34: Exploration test FIXED code'da PASS etmeli (fix validation)
- Task 3.35: Preservation tests FIXED code'da hala PASS etmeli (no regression)
- %80+ coverage hedefi her modül için geçerli
