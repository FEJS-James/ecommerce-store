import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function ThankYouRedirect({ searchParams }: PageProps) {
  const { session_id } = await searchParams;
  const target = session_id
    ? `/order/success?session_id=${encodeURIComponent(session_id)}`
    : '/order/success';
  redirect(target);
}
