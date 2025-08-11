import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import dayjs from "@/lib/days";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type JsonParseResult<T> = {
	success: boolean;
	data?: T;
	error?: Error;
};

export function safeJsonParse<T>(json: string): JsonParseResult<T> {
	try {
		const data = JSON.parse(json) as T;
		return {
			success: true,
			data,
		};
	} catch (error) {
		return {
			success: false,
			error:
				error instanceof Error
					? error
					: new Error("Unknown error parsing JSON"),
		};
	}
}

type Success<T> = {
	data: T;
	error: null;
};

type Failure<E> = {
	data: null;
	error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

export async function tryCatch<T, E = Error>(
	promise: Promise<T>,
): Promise<Result<T, E>> {
	try {
		const data = await promise;
		return { data, error: null };
	} catch (error) {
		return { data: null, error: error as E };
	}
}

export function formatFeedItemTime(utcTimestamp: dayjs.ConfigType): string {
	const local = dayjs.utc(utcTimestamp).local();

	const now = dayjs();

	const diffMinutes = now.diff(local, "minute");
	const diffHours = now.diff(local, "hour");
	const diffDays = now.diff(local, "day");

	/* Today */
	if (local.isToday()) {
		if (diffMinutes < 60) {
			return `${diffMinutes}m`;
		}
		return `${diffHours}h`;
	}

	/* Yesterday */
	if (local.isYesterday()) {
		return "1d";
	}

	/* This week (2-6 days ago) */
	if (diffDays < 7) {
		return `${diffDays}d`;
	}

	/* Older than a week */
	return local.format("YYYY/MM/DD");
}
