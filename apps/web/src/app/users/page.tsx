"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import useDebounce from "@/media/hooks/use-debounce";
import { useSearchUsers } from "@/media/hooks/use-search-users";

export default function HomePage() {
	const [query, setQuery] = useState("");
	const [_, startTransition] = useTransition();
	const deferredQuery = useDeferredValue(query);
	const debouncedSearchTerm = useDebounce(deferredQuery, 500);

	const handleSearch = (value: string) => {
		if (value.length !== 0 && value.length < 3) {
			return;
		}

		startTransition(() => {
			setQuery(value);
		});
	};

	return (
		<div className="min-h-svh flex-1 py-6 md:min-h-auto">
			<div className="px-2 pb-2 md:px-10 md:pb-6">
				<SearchInput onChange={handleSearch} />
			</div>

			<UsersList debouncedSearchTerm={debouncedSearchTerm} />
		</div>
	);
}

function SearchInput({ onChange }: { onChange: (values: string) => void }) {
	return (
		<div className="relative">
			<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
			<Input
				className="w-full bg-white px-10"
				onChange={(e) => onChange(e.target.value)}
				placeholder="Buscar usuario por su @"
				type="search"
			/>
		</div>
	);
}

function UsersList({ debouncedSearchTerm }: { debouncedSearchTerm: string }) {
	const { data: users, isLoading } = useSearchUsers(debouncedSearchTerm);

	if (isLoading) {
		return <UserSearchSkeleton />;
	}

	if (!users || users.length === 0) {
		return null;
	}

	return (
		<div className="px-4 md:px-10">
			{users.map((user) => (
				<Link
					key={user.id}
					prefetch={false}
					href={`/profile/${user.id}`}
					className="flex items-center gap-4 hover:bg-muted rounded-md p-2"
				>
					{user.image && (
						<div className="shrink-0 rounded-full bg-secondary-foreground">
							<Image
								alt={user.name}
								className="size-[30px] rounded-full object-cover"
								height={30}
								src={user.image}
								unoptimized
								width={30}
							/>
						</div>
					)}

					<div className="text-sm">
						<span className="block">{user.name}</span>
						<span className="block text-muted-foreground">{user.username}</span>
					</div>
				</Link>
			))}
		</div>
	);
}

function UserSearchSkeleton() {
	return (
		<div className="px-4 md:px-10">
			{Array.from({ length: 5 }).map((_, i) => (
				<div
					// biome-ignore lint:reason
					key={i}
					className="flex items-center gap-4 rounded-md p-2"
				>
					{/* Avatar skeleton */}
					<Skeleton className="size-[30px] shrink-0 rounded-full" />

					{/* Text content skeleton */}
					<div className="flex-1 space-y-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-3 w-24" />
					</div>
				</div>
			))}
		</div>
	);
}
