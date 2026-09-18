import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled — Firebase RTDB requires browser APIs
// and env vars aren't available during static page generation
const HomePage = dynamic(() => import('@/components/HomePage'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="text-6xl">🃏</div>
        <p className="text-gold animate-pulse text-xl">Loading Teen Patti...</p>
      </div>
    </div>
  ),
});

export default function Page() {
  return <HomePage />;
}
