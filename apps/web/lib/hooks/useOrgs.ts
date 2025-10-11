import { useEffect, useState } from 'react';

export interface Org {
  id: string;
  name: string;
  slug: string | null;
  settings: any;
  created_at: string;
  updated_at: string;
  role: 'owner' | 'admin' | 'member';
  member_id: string;
}

interface UseOrgsResult {
  orgs: Org[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch organizations where the current user is a member
 * Uses the /api/orgs endpoint with RLS-safe queries
 */
export function useOrgs(): UseOrgsResult {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrgs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/orgs');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch organizations');
      }

      setOrgs(data.data || []);
    } catch (err: any) {
      console.error('Error fetching orgs:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  return {
    orgs,
    loading,
    error,
    refetch: fetchOrgs,
  };
}

/**
 * Create a new organization
 */
export async function createOrg(data: { name: string; slug?: string; settings?: any }): Promise<Org> {
  const response = await fetch('/api/orgs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || 'Failed to create organization');
  }

  return result.data;
}

