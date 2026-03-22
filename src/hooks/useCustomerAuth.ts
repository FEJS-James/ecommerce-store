'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CustomerInfo {
  id: string;
  email: string;
  name: string | null;
  total_spent_cents: number;
  order_count: number;
  created_at: string;
}

export function useCustomerAuth(options?: { redirectTo?: string }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/account/me')
      .then((res) => {
        if (res.status === 401) {
          if (options?.redirectTo !== undefined) {
            router.replace(options.redirectTo || '/account/login');
          } else {
            router.replace('/account/login');
          }
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data) setCustomer(data);
      })
      .catch(() => {
        router.replace('/account/login');
      })
      .finally(() => setChecking(false));
  }, [router, options?.redirectTo]);

  return { customer, checking };
}
