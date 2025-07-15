import { Skeleton } from "@/components/ui/skeleton";

export default function FollowingPageLoading() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, idx) => (
        // biome-ignore lint:reason
        <div key={idx} className="flex justify-between">
          <div className="flex gap-4">
            <Skeleton className="size-[50px] rounded-full " />
            <div className="space-y-2">
              <Skeleton className="w-[200px] h-4" />
              <Skeleton className="w-[150px] h-4" />
            </div>
          </div>
          <Skeleton className="w-[100px] h-9 rounded-md" />
        </div>
      ))}
    </div>
  );
}
