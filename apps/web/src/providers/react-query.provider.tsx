"use client";

import {
	QueryClientProvider,
	useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { clearPersonalizedQueries } from "@/lib/react-query/personalized-cache";
import { makeQueryClient } from "@/lib/react-query/query-client";

function PersonalizedQueryCacheManager() {
	const queryClient = useQueryClient();
	const { data: session, isPending } = authClient.useSession();
	const userId = session?.user.id;

	useEffect(() => {
		if (isPending) {
			return;
		}

		clearPersonalizedQueries(queryClient, userId).catch(() => {
			// The helper removes matching queries even if cancellation fails.
		});
	}, [isPending, queryClient, userId]);

	return null;
}

export function ReactQueryProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [queryClient] = useState(makeQueryClient);

	return (
		<QueryClientProvider client={queryClient}>
			<PersonalizedQueryCacheManager />
			{children}
		</QueryClientProvider>
	);
}
