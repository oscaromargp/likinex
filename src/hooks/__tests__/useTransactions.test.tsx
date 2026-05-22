import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTransactions, useCreateTransaction } from '../useTransactions';
import { supabase } from '@/lib/supabase';
import React from 'react';

const mockFrom = () => supabase.from as unknown as Mock;

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty array when no userId', async () => {
    const { result } = renderHook(() => useTransactions(undefined), {
      wrapper: createWrapper(),
    });
    expect(result.current.data).toBeUndefined();
  });

  it('fetches transactions for given userId', async () => {
    const fakeData = [{ id: '1', description: 'Test', amount: 100 }];
    const mockOrder = vi.fn().mockResolvedValue({ data: fakeData, error: null });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom().mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useTransactions('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(fakeData);
    expect(supabase.from).toHaveBeenCalledWith('transactions');
  });

  it('throws error when fetch fails', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') });
    const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockFrom().mockReturnValue({ select: mockSelect });

    const { result } = renderHook(() => useTransactions('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useCreateTransaction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('has correct mutation shape', () => {
    mockFrom().mockReturnValue({
      insert: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue({ data: null, error: null }) }),
    });

    const { result } = renderHook(() => useCreateTransaction(), {
      wrapper: createWrapper(),
    });
    expect(result.current.mutateAsync).toBeDefined();
  });
});
