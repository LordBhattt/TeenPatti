import dynamic from 'next/dynamic';

const HomePage = dynamic(() => import('@/components/HomePage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[100dvh]">
      <p className="text-muted text-sm">Loading...</p>
    </div>
  ),
});

export default function Page() {
  return <HomePage />;
}
