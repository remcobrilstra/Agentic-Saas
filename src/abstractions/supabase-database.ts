/**
 * Supabase Database Provider Implementation
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IDatabaseProvider } from './database';

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
