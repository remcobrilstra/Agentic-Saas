/**
 * Database Abstraction Layer
 * 
 * This module provides an abstraction over database operations to allow
 * easy replacement of the underlying database provider.
 */

export interface QueryOptions {
  filters?: Record<string, unknown>;
  search?: {
    column: string;
    value: string;
  };
  pagination?: {
    page: number;
    pageSize: number;
  };
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
}

export interface QueryResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IDatabaseProvider {
  /**
   * Query records from a table with optional filters
   */
  query<T = unknown>(table: string, filters?: Record<string, unknown>): Promise<T[]>;

  /**
   * Query records with pagination and search support
   */
  queryWithPagination<T = unknown>(table: string, options?: QueryOptions): Promise<QueryResult<T>>;

  /**
   * Get a single record by ID
   */
  getById<T = unknown>(table: string, id: string): Promise<T | null>;

  /**
   * Insert a new record into a table
   */
  insert<T = unknown>(table: string, data: Partial<T>): Promise<T>;

  /**
   * Update an existing record
   */
  update<T = unknown>(table: string, id: string, data: Partial<T>): Promise<T>;

  /**
   * Delete a record
   */
  delete(table: string, id: string): Promise<void>;

  /**
   * Execute a raw query (provider-specific)
   */
  raw<T = unknown>(query: string, params?: unknown[]): Promise<T>;
}
