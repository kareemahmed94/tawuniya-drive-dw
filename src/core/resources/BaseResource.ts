import { Decimal } from '@prisma/client/runtime/library';

/**
 * Base Resource Class
 * Similar to Laravel's API Resources - transforms raw data into clean API responses
 * Handles data transformation, type conversion, and field mapping
 * 
 * @template T - The input data type (from repository/service)
 * @template R - The output resource type (API response)
 */
export abstract class BaseResource<T, R = any> {
  constructor(protected data: T) {}

  /**
   * Transform the resource into an array/object
   * Override this method in child classes
   */
  abstract toArray(): R;

  /**
   * Convert resource to JSON
   */
  toJSON(): R {
    return this.toArray();
  }

  /**
   * Helper: Convert Decimal to number
   */
  protected toNumber(value: Decimal | number | null | undefined): number | null {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return value;
    return Number(value);
  }

  /**
   * Helper: Format date to ISO string
   */
  protected formatDate(date: Date | string | null | undefined): string | null {
    if (!date) return null;
    if (typeof date === 'string') return date;
    return date.toISOString();
  }

  /**
   * Helper: Conditionally include a field
   */
  protected when(condition: boolean, value: any): any {
    return condition ? value : undefined;
  }

  /**
   * Helper: Include field when not null
   */
  protected whenNotNull<V>(value: V | null | undefined): V | undefined {
    return value !== null && value !== undefined ? value : undefined;
  }

  /**
   * Helper: Merge additional attributes
   */
  protected merge(attributes: Record<string, any>): Record<string, any> {
    return { ...this.toArray(), ...attributes };
  }
}

/**
 * Resource Collection
 * Transforms an array of resources
 */
export class ResourceCollection<T, R> {
  constructor(
    protected data: T[],
    protected ResourceClass: new (data: T) => BaseResource<T, R>
  ) {}

  /**
   * Transform collection to array
   */
  toArray(): R[] {
    return this.data.map(item => new this.ResourceClass(item).toArray());
  }

  /**
   * Convert collection to JSON
   */
  toJSON(): R[] {
    return this.toArray();
  }

  /**
   * Get collection with pagination metadata
   */
  withPagination(pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }) {
    return {
      data: this.toArray(),
      pagination,
    };
  }
}

