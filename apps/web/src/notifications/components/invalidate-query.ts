"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { QUERY_KEYS } from "@/lib/app.constants";
import { authClient } from "@/lib/auth/auth-client";
import { markNotiAsRead } from "../actions/mark-noti-as-read";

export function InvalidateNotificationsQuery() {
	const queryClient = useQueryClient();
	const { data: session } = authClient.useSession();
	const userId = session?.user.id;

	const { mutate: markAsRead } = useMutation({
		mutationFn: async (_userId: string) => await markNotiAsRead(),
		onSuccess: (data, mutationUserId) => {
			if (data.success) {
				queryClient.invalidateQueries({
					queryKey:
						QUERY_KEYS.getUserNotificationsCount(mutationUserId),
				});
			}
		},
	});

	useEffect(() => {
		if (userId) {
			markAsRead(userId);
		}
	}, [userId, markAsRead]);

	return null;
}
