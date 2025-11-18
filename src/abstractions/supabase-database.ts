/**
 * Supabase Database Provider Implementation
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IDatabaseProvider, QueryOptions, QueryResult } from './database';

export class SupabaseDatabaseProvider implements IDatabaseProvider {
  private client: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey);
  }

  async query<T = unknown>(table: string, filters?: Record<string, unknown>): Promise<T[]> {
    let query = this.client.from(table).select('*');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database query error: ${error.message}`);
    }

    return (data as T[]) || [];
  }

  async queryWithPagination<T = unknown>(table: string, options?: QueryOptions): Promise<QueryResult<T>> {
    const page = options?.pagination?.page || 1;
    const pageSize = options?.pagination?.pageSize || 10;

    // Special handling for user_profiles - use view to get complete user data
    if (table === 'user_profiles') {
      // Build the query for data
      let query = this.client.from('users_with_profiles').select('*', { count: 'exact' });

      // Apply filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      // Apply search
      if (options?.search) {
        query = query.ilike('email', `%${options.search.value}%`);
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        });
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw new Error(`Database query error: ${error.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / pageSize);

      // Map database fields to match UserProfile interface
      type UserProfileRow = {
        id: string;
        email: string;
        role: string;
        first_name?: string;
        last_name?: string;
        avatar_url?: string;
        created_at: string;
        updated_at: string;
      };
      const mappedData = (data || []).map((row: UserProfileRow) => ({
        id: row.id,
        email: row.email,
        role: row.role,
        firstName: row.first_name ?? undefined,
        lastName: row.last_name ?? undefined,
        avatarUrl: row.avatar_url ?? undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));

      return {
        data: mappedData as T[],
        total,
        page,
        pageSize,
        totalPages,
      };
    }

    // Standard query for other tables
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Build the query for data
    let query = this.client.from(table).select('*', { count: 'exact' });

    // Apply filters
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    // Apply search
    if (options?.search) {
      query = query.ilike(options.search.column, `%${options.search.value}%`);
    }

    // Apply ordering
    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending ?? true 
      });
    }

    // Apply pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Database query error: ${error.message}`);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pageSize);

    return {
      data: (data as T[]) || [],
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async getById<T = unknown>(table: string, id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Database getById error: ${error.message}`);
    }

    return data as T;
  }

  async insert<T = unknown>(table: string, data: Partial<T>): Promise<T> {
    const { data: inserted, error } = await this.client
      .from(table)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Database insert error: ${error.message}`);
    }

    return inserted as T;
  }

  async update<T = unknown>(table: string, id: string, data: Partial<T>): Promise<T> {
    const { data: updated, error } = await this.client
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Database update error: ${error.message}`);
    }

    return updated as T;
  }

  async delete(table: string, id: string): Promise<void> {
    const { error } = await this.client
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Database delete error: ${error.message}`);
    }
  }

  async raw<T = unknown>(query: string, params?: unknown[]): Promise<T> {
    const { data, error } = await this.client.rpc(query, params);

    if (error) {
      throw new Error(`Database raw query error: ${error.message}`);
    }

    return data as T;
  }
}
