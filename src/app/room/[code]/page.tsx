import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled — Firebase RTDB requires browser APIs
const RoomPageContent = dynamic(() => import('@/components/RoomPageContent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="text-5xl animate-pulse">🃏</div>
        <p className="text-gold animate-pulse">Loading room...</p>
      </div>
    </div>
  ),
});

export default function RoomPage() {
  return <RoomPageContent />;
}
