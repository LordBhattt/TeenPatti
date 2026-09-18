import dynamic from 'next/dynamic';

const RoomPageContent = dynamic(() => import('@/components/RoomPageContent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[100dvh]">
      <p className="text-muted text-sm">Loading room...</p>
    </div>
  ),
});

export default function RoomPage() {
  return <RoomPageContent />;
}
