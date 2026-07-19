"use client";

import {
	QueryClient,
	QueryClientProvider,
	useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { clearPersonalizedQueries } from "@/lib/react-query/personalized-cache";

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
	const [queryClient] = useState(() => new QueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<PersonalizedQueryCacheManager />
			{children}
		</QueryClientProvider>
	);
}
