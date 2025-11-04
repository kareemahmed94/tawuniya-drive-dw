# Resource Layer - Laravel-Style API Resources

## 📚 Overview

The **Resource Layer** provides a clean transformation layer between your services and API responses, similar to Laravel's API Resources. This pattern ensures consistent data formatting, type conversion, and field mapping.

## 🎯 Purpose

- **Data Transformation**: Convert database models to clean API responses
- **Type Conversion**: Handle Decimal → number, Date → ISO string
- **Field Filtering**: Remove sensitive fields (passwords, internal IDs)
- **Consistent Formatting**: Ensure all endpoints return data in the same format
- **Separation of Concerns**: Keep business logic separate from presentation logic

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Repository  │ ──> │   Service   │ ──> │  Resource   │ ──> │  API Route  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
   Raw Data         Business Logic     Transformation      JSON Response
```

## 📁 Structure

```
src/core/resources/
├── BaseResource.ts           # Abstract base class
├── ResourceCollection.ts     # Collection transformer
├── UserResource.ts           # User transformations
├── WalletResource.ts         # Wallet transformations
├── TransactionResource.ts    # Transaction transformations
├── ServiceResource.ts        # Service transformations
├── AdminResource.ts          # Admin analytics resources
└── index.ts                  # Centralized exports
```

## 🚀 Quick Start

### 1. Basic Resource Usage

```typescript
// In your service
import { UserResource } from '../resources';

async getUser(id: string) {
  const user = await this.userRepository.findById(id);
  
  // Transform using resource
  return new UserResource(user).toArray();
}
```

### 2. Collection Usage

```typescript
import { ResourceCollection, TransactionResource } from '../resources';

async getTransactions(userId: string) {
  const transactions = await this.transactionRepository.findByUserId(userId);
  
  // Transform collection
  return new ResourceCollection(transactions, TransactionResource).toArray();
}
```

### 3. With Pagination

```typescript
async getTransactions(userId: string, page: number) {
  const result = await this.transactionRepository.findByUserId(userId, { page });
  
  return new ResourceCollection(result.transactions, TransactionResource)
    .withPagination(result.pagination);
}
```

## 📝 Creating a New Resource

### Step 1: Define the Resource Class

```typescript
import { BaseResource } from './BaseResource';
import { Product } from '@prisma/client';

export class ProductResource extends BaseResource<Product> {
  toArray() {
    return {
      id: this.data.id,
      name: this.data.name,
      price: this.toNumber(this.data.price),
      createdAt: this.formatDate(this.data.createdAt),
      // Only include if product is active
      discount: this.when(this.data.isActive, this.data.discount),
      // Only include if not null
      description: this.whenNotNull(this.data.description),
    };
  }
}
```

### Step 2: Use in Service

```typescript
@injectable()
export class ProductService {
  async getProduct(id: string) {
    const product = await this.productRepository.findById(id);
    return new ProductResource(product).toArray();
  }
  
  async getProducts() {
    const products = await this.productRepository.findAll();
    return new ResourceCollection(products, ProductResource).toArray();
  }
}
```

## 🛠️ Helper Methods

### `toNumber(value)`
Converts Prisma Decimal to JavaScript number
```typescript
price: this.toNumber(this.data.price)
// Decimal(10.99) → 10.99
```

### `formatDate(date)`
Converts Date to ISO string
```typescript
createdAt: this.formatDate(this.data.createdAt)
// Date(2024-01-01) → "2024-01-01T00:00:00.000Z"
```

### `when(condition, value)`
Conditionally include a field
```typescript
discount: this.when(this.data.isActive, this.data.discount)
// Only included if isActive is true
```

### `whenNotNull(value)`
Include field only if not null/undefined
```typescript
description: this.whenNotNull(this.data.description)
// Only included if description exists
```

### `merge(attributes)`
Merge additional attributes
```typescript
return this.merge({
  fullName: `${this.data.firstName} ${this.data.lastName}`
});
```

## 📋 Real-World Examples

### Example 1: User with Nested Wallet

```typescript
export class AuthUserResource extends BaseResource<
  User & { wallet?: Wallet | null }
> {
  toArray() {
    return {
      id: this.data.id,
      email: this.data.email,
      name: this.data.name,
      wallet: this.data.wallet ? {
        balance: this.toNumber(this.data.wallet.balance),
        totalEarned: this.toNumber(this.data.wallet.totalEarned),
      } : null,
    };
  }
}
```

### Example 2: Transaction with Service Info

```typescript
export class TransactionResource extends BaseResource<
  Transaction & { service?: Service }
> {
  toArray() {
    return {
      id: this.data.id,
      points: this.toNumber(this.data.points),
      type: this.data.type,
      createdAt: this.formatDate(this.data.createdAt),
      service: this.whenNotNull(this.data.service ? {
        name: this.data.service.name,
        category: this.data.service.category,
      } : undefined),
    };
  }
}
```

### Example 3: Admin Analytics

```typescript
export class SystemKPIsResource extends BaseResource<SystemKPIs> {
  toArray() {
    return {
      totalUsers: this.data.totalUsers,
      activeUsers: this.data.activeUsers,
      avgPointsPerUser: Math.round(this.data.avgPointsPerUser * 100) / 100,
    };
  }
}
```

## ✅ Best Practices

### DO ✅

1. **Use resources for all external API responses**
   ```typescript
   return new UserResource(user).toArray();
   ```

2. **Handle type conversions in resources**
   ```typescript
   balance: this.toNumber(this.data.balance)
   ```

3. **Remove sensitive data**
   ```typescript
   // Don't include password, internal IDs, etc.
   ```

4. **Use semantic names**
   ```typescript
   export class UserWithWalletResource // Clear intent
   ```

5. **Keep resources simple**
   - One resource per entity type
   - Clear transformation logic

### DON'T ❌

1. **Don't put business logic in resources**
   ```typescript
   // ❌ BAD - Business logic belongs in services
   calculateDiscount() { ... }
   ```

2. **Don't access database in resources**
   ```typescript
   // ❌ BAD - Keep resources stateless
   async fetchRelatedData() { ... }
   ```

3. **Don't nest resources too deeply**
   ```typescript
   // ❌ BAD - Can cause performance issues
   user: new UserResource(
     transaction: new TransactionResource(
       service: new ServiceResource(...)))
   ```

4. **Don't skip transformation**
   ```typescript
   // ❌ BAD - Always use resources
   return user;  // Raw database object
   
   // ✅ GOOD
   return new UserResource(user).toArray();
   ```

## 🔄 Data Flow Example

```typescript
// 1. Controller/Route receives request
export async function GET(req: NextRequest) {
  
  // 2. Call service method
  const result = await walletService.getWallet(userId);
  
  // 3. Service gets data from repository
  // walletService:
  async getWallet(userId: string) {
    const wallet = await this.walletRepository.findByUserId(userId);
    
    // 4. Transform using resource before returning
    return new WalletResource(wallet).toArray();
  }
  
  // 5. Return transformed data
  return NextResponse.json(result);
}
```

## 🎨 TypeScript Benefits

Resources provide full type safety:

```typescript
// Input type from Prisma
type UserInput = User & { wallet?: Wallet | null };

// Output type from resource
type UserOutput = {
  id: string;
  email: string;
  name: string;
  wallet: { balance: number } | null;
};

// Type-safe transformation
export class UserResource extends BaseResource<UserInput, UserOutput> {
  toArray(): UserOutput {
    return { /* ... */ };
  }
}
```

## 📊 Performance Considerations

1. **Lazy Loading**: Resources are instantiated only when needed
2. **Memory Efficient**: No data duplication, transforms on-demand
3. **Collection Optimization**: Batch transforms for better performance
4. **Conditional Fields**: Skip unnecessary transformations with `when()`

## 🧪 Testing Resources

```typescript
import { UserResource } from './UserResource';

describe('UserResource', () => {
  it('transforms user data correctly', () => {
    const user = {
      id: '1',
      email: 'test@example.com',
      password: 'hashed_password', // Should be excluded
      balance: new Decimal('100.50'),
    };
    
    const result = new UserResource(user).toArray();
    
    expect(result).toEqual({
      id: '1',
      email: 'test@example.com',
      balance: 100.50,
      // password should NOT be here
    });
    expect(result).not.toHaveProperty('password');
  });
});
```

## 📚 Related Patterns

- **Repository Pattern**: Data access layer
- **Service Pattern**: Business logic layer
- **Resource Pattern**: Presentation/transformation layer (this document)
- **DTO Pattern**: Data transfer objects

## 🔗 References

- [Laravel API Resources](https://laravel.com/docs/eloquent-resources)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

---

**Last Updated**: November 2025  
**Status**: ✅ Production Ready

