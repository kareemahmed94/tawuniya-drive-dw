/**
 * Resource Layer - Export Index
 * Centralized exports for all resources
 * Similar to Laravel's API Resources
 */

// Base
export { BaseResource, ResourceCollection } from './BaseResource';

// User Resources
export { UserResource, UserWithWalletResource, AuthUserResource } from './UserResource';

// Wallet Resources
export {
  WalletResource,
  WalletBalanceResource,
  WalletStatisticsResource,
  PointBalanceResource,
} from './WalletResource';

// Transaction Resources
export {
  TransactionResource,
  TransactionSummaryResource,
} from './TransactionResource';

// Service Resources
export {
  ServiceResource,
  ServiceConfigResource,
  ServiceRulesResource,
} from './ServiceResource';

// Admin Resources
export {
  SystemKPIsResource,
  ServiceAnalyticsResource,
  UserEngagementResource,
  ExpiryAnalyticsResource,
} from './AdminResource';

