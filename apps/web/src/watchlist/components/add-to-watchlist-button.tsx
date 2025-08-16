"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { QUERY_KEYS } from "@/lib/app.constants";
import { authClient } from "@/lib/auth/auth-client";
import { useIsOwner } from "@/lib/hooks/use-is-owner";
import type { ApiResponse } from "@/lib/safe-execute";
import { cn } from "@/lib/utils";
import { getUserWatchlistQueryOptions } from "@/users/hooks/use-user-watchlist";
import { addMovieToWatchlist } from "../actions/add-movie";
import { removeMovieFromWatchlist } from "../actions/remove-movie";

export function AddToWatchlistButton({
	tmdbId,
	type,
	className,
	variant,
}: {
	tmdbId: number;
	type: string;
	className?: string;
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
}) {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const { data: userWatchlist } = useQuery(getUserWatchlistQueryOptions);

	const { isProfilePage } = useIsOwner();

	const handleAddMovieToWatchlist = async (
		_state: ApiResponse<void>,
		formData: FormData,
	) => {
		const result = await addMovieToWatchlist(formData);
		if (result.success) {
			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.USER_WATCHLIST,
			});
		}

		return result;
	};

	const [_, addAction] = useActionState(handleAddMovieToWatchlist, {
		success: false,
		error: "",
	});

	const [__, removeAction] = useActionState(removeMovieFromWatchlist, {
		success: false,
		error: "",
	});

	const userMovie = userWatchlist?.[tmdbId];
	const isMovieInWatchlist = !!userMovie;

	return (
		<form>
			<input name="movieTMDBId" type="hidden" value={tmdbId} />
			<input name="userId" type="hidden" value={session?.user.id} />
			<input name="type" type="hidden" value={type} />

			{isMovieInWatchlist ? (
				!isProfilePage && (
					<SubmitButton
						hideLoadingText
						className={cn("w-full", className)}
						formAction={removeAction}
						size="sm"
						variant={variant}
					>
						<EyeOff className="size-4 fill-secondary-foreground" />
					</SubmitButton>
				)
			) : (
				<SubmitButton
					hideLoadingText
					className={cn("w-full", className)}
					formAction={addAction}
					size="sm"
					variant={variant}
				>
					<Eye className="size-4" />
				</SubmitButton>
			)}
		</form>
	);
}
