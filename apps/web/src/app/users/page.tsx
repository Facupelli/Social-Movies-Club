"use client";

import { Popcorn, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import useDebounce from "@/media/hooks/use-debounce";
import { useSearchUsers } from "@/media/hooks/use-search-users";

export default function HomePage() {
	const [query, setQuery] = useState("");
	const deferredQuery = useDeferredValue(query);
	const debouncedSearchTerm = useDebounce(deferredQuery, 500);

	const [showWelcome, setShowWelcome] = useState(true);
	const [isExiting, setIsExiting] = useState(false);

	useEffect(() => {
		if (query.length > 0) {
			// Trigger the exit animation
			setIsExiting(true);
		} else {
			// If user clears input, bring it back immediately
			setShowWelcome(true);
			setIsExiting(false);
		}
	}, [query]);

	// 3. This function runs when the CSS transition finishes
	const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
		// We only care about the 'max-height' transition ending
		// This ensures the layout has fully collapsed before we remove the DOM node
		if (e.propertyName === "max-height" && isExiting) {
			setShowWelcome(false);
		}
	};

	const handleSearch = (value: string) => {
		setQuery(value);
	};

	return (
		<div className="min-h-svh flex-1 py-6 md:min-h-auto">
			{showWelcome && (
				<div
					onTransitionEnd={handleTransitionEnd}
					className={`
                        flex flex-col gap-y-2 items-center overflow-hidden
                        transition-all duration-300 ease-in-out
                        
                     
                        ${
													isExiting
														? "opacity-0 max-h-0 pb-0 scale-95"
														: "opacity-100 max-h-96 pb-6 scale-100"
												}
                    `}
				>
					<div className="bg-primary p-4 rounded-2xl">
						<Popcorn className="size-12 text-background" />
					</div>
					<h1 className="text-2xl font-bold">Crea tu círculo cinéfilo</h1>
					<p className="text-sm text-muted-foreground text-center text-pretty px-4">
						Sigue a tus amigos para ver sus mejores puntuaciones y descubrir
						nuevas películas a través de gente en la que confías.
					</p>
				</div>
			)}

			<div className="px-2 pb-4 md:px-10 md:pb-6">
				<SearchInput onChange={handleSearch} />
			</div>

			<UsersList debouncedSearchTerm={debouncedSearchTerm} query={query} />
		</div>
	);
}

function SearchInput({ onChange }: { onChange: (values: string) => void }) {
	return (
		<div className="relative">
			<Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-primary" />
			<Input
				className="w-full bg-white px-10"
				onChange={(e) => onChange(e.target.value)}
				placeholder="Buscar usuario por su @"
				type="search"
			/>
		</div>
	);
}

function UsersList({
	debouncedSearchTerm,
	query,
}: {
	debouncedSearchTerm: string;
	query: string;
}) {
	const { data: users, isLoading } = useSearchUsers(debouncedSearchTerm);

	if (query.length <= 0 || debouncedSearchTerm.length <= 0) {
		return null;
	}

	if (isLoading) {
		return <UserSearchSkeleton />;
	}

	if (!users || users.length === 0) {
		return (
			<div className="px-4 flex flex-col items-center gap-y-4 pt-4">
				<p className="font-bold text-xl text-center">
					No se encontraron resultados para {debouncedSearchTerm}
				</p>
				<p className="text-muted-foreground text-sm text-center">
					Asegúrate de que el nombre de usuario esté bien escrito o invita a tu
					amigo a unirse a Social.Movies.Club
				</p>
			</div>
		);
	}

	return (
		<div className="px-4 md:px-10">
			{users?.map((user) => (
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
