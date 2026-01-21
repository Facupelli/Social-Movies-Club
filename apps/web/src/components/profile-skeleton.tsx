import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
	return (
		<div className="grid gap-2 py-4">
			<div className="flex items-center justify-between">
				<div className="shrink-0">
					<Skeleton className="size-[100px] rounded-full" />
				</div>
				<div>
					<Skeleton className="h-9 w-20" />
				</div>
			</div>

			<div className="space-y-2">
				<Skeleton className="h-5 w-32" />
				<Skeleton className="h-4 w-24" />
			</div>

			<div className="pt-4">
				<Skeleton className="h-10 w-full" />
			</div>
		</div>
	);
}