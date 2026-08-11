import { HomeFeedHeader } from '@/shared/components/home-feed-header';
import { getServerSession } from '@/platform/auth/get-server-session';

export default async function RecommendationsPage() {
  const session = await getServerSession();

  return (
    <div className="relative min-h-svh flex-1 pb-6 md:min-h-auto">
      <HomeFeedHeader
        activeView="recommendations"
        viewerUserId={session?.user.id}
      />
      <main className="px-4 py-10 md:px-10">
        <p className="text-muted-foreground text-sm">
          Tus recomendaciones van a aparecer acá.
        </p>
      </main>
    </div>
  );
}
