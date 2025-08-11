"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { QUERY_KEYS } from "@/lib/app.constants";
import { markNotiAsRead } from "../actions/mark-noti-as-read";

export function InvalidateNotificationsQuery() {
	const queryClient = useQueryClient();

	const markAsReadMutation = useMutation({
		mutationFn: markNotiAsRead,
		onSuccess: (data) => {
			if (data.success) {
				// queryClient.setQueryData(QUERY_KEYS.USER_NOTIFICATIONS_COUNT, 0);

				queryClient.invalidateQueries({
					queryKey: QUERY_KEYS.USER_NOTIFICATIONS_COUNT,
				});
			}
		},
	});

	// biome-ignore lint: only want this to run after rendering
	useEffect(() => {
		markAsReadMutation.mutate();
	}, []);

	return null;
}
