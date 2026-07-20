import type { Query, QueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/shared/utilities/app.constants";

function isPersonalizedQuery(query: Query, exceptUserId?: string): boolean {
	const [scope, userId] = query.queryKey;

	return (
		scope === QUERY_KEYS.VIEWER[0] &&
		(exceptUserId === undefined || userId !== exceptUserId)
	);
}

export async function clearPersonalizedQueries(
	queryClient: QueryClient,
	exceptUserId?: string,
) {
	const predicate = (query: Query) =>
		isPersonalizedQuery(query, exceptUserId);

	try {
		await queryClient.cancelQueries({ predicate });
	} finally {
		queryClient.removeQueries({ predicate });
	}
}
