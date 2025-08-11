"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { QUERY_KEYS } from "@/lib/app.constants";
import { markNotiAsRead } from "../actions/mark-noti-as-read";

export function InvalidateNotificationsQuery() {
	const queryClient = useQueryClient();

	useEffect(() => {
		markNotiAsRead().then((res) => {
			if (!res.success) {
				return;
			}

			queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.USER_NOTIFICATIONS_COUNT,
			});
		});
	}, [queryClient.invalidateQueries]);

	return null;
}
