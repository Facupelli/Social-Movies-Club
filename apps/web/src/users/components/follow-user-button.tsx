"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { followUser, unfollowUser } from "../actions/follow-user";

export function FollowUserButton({
	followedUserId,
	isFollowing,
}: {
	isFollowing: boolean;
	followedUserId: string;
}) {
	const [_, followAction, followIsPending] = useActionState(followUser, {
		success: false,
		error: "",
	});

	const [__, unfollowAction, unfollowIsPending] = useActionState(unfollowUser, {
		success: false,
		error: "",
	});

	return (
		<form>
			<input type="hidden" name="followedUserId" value={followedUserId} />

			{isFollowing ? (
				<SubmitButton
					disabled={unfollowIsPending}
					formAction={(formData) => {
						unfollowAction(formData);
					}}
					loadingText="Cargando"
					variant="secondary"
				>
					Dejar de seguir
				</SubmitButton>
			) : (
				<SubmitButton
					disabled={followIsPending}
					formAction={(formData) => {
						followAction(formData);
					}}
					loadingText="Siguiendo"
				>
					Seguir
				</SubmitButton>
			)}
		</form>
	);
}
