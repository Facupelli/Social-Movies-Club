import Image from "next/image";
import { cn } from "@/lib/utils";
import {
	type MediaType,
	MediaTypeDict,
	MediaTypeEnum,
} from "@/media/media.type";
import { Card } from "../ui/card";

export function MovieCard({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<Card className={cn("gap-2 overflow-hidden rounded-xs p-0", className)}>
			{children}
		</Card>
	);
}

export function MoviePoster({
	posterPath,
	title,
	size = "default",
}: {
	posterPath: string;
	title: string;
	size?: "small" | "default";
}) {
	const sizeClasses = size === "small" ? "w-[120px]" : "w-full";

	return (
		<div
			className={`relative shrink-0 overflow-hidden rounded-xs bg-muted ${sizeClasses} aspect-[2/3]`}
		>
			{posterPath ? (
				<Image
					alt={title}
					fill
					className="object-cover"
					src={`https://image.tmdb.org/t/p/original${posterPath}`}
					sizes="(max-width: 768px) 150px, 200px"
					unoptimized
				/>
			) : (
				<div className="absolute inset-0 bg-gray-600" />
			)}
		</div>
	);
}

export function MovieTitle({
	title,
	className,
}: {
	title: string;
	className?: string;
}) {
	return (
		<p
			className={cn(
				"line-clamp-2 font-semibold text-pretty leading-tight md:text-lg",
				className,
			)}
		>
			{title}
		</p>
	);
}

export function MovieReleaseDate({ year }: { year: string }) {
	return (
		<div className="flex items-center justify-between">
			<span className="font-medium text-muted-foreground text-sm">{year}</span>
		</div>
	);
}

export function MovieScore({ score }: { score?: number }) {
	if (!score) {
		return null;
	}

	return (
		<div className="flex size-7 items-center justify-center rounded bg-primary md:size-9">
			<p className="font-bold text-sm md:text-xl">{score}</p>
		</div>
	);
}

export function MovieMediaType({ type }: { type: MediaType }) {
	return (
		<div className="rounded-md border border-accent bg-secondary px-2 py-1 text-muted-foreground text-xs">
			<span>{MediaTypeDict[type]}</span>
		</div>
	);
}

export function MovieRuntime({
	runtime,
	type,
}: {
	runtime?: number;
	type: MediaType;
}) {
	if (!runtime || type !== MediaTypeEnum.movie) {
		return null;
	}

	return <span className="text-muted-foreground text-xs">{runtime} min</span>;
}
