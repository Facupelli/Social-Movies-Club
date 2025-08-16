"use client";

import { useQuery } from "@tanstack/react-query";
import type { User } from "@/infra/postgres/schema";
import { QUERY_KEYS } from "@/lib/app.constants";

async function getUsersByQuery(query: string): Promise<User[]> {
	const response = await fetch(`/api/users/?q=${query}`);
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}

	return response.json();
}

const useSearchUsers = (query: string) => {
	return useQuery({
		queryKey: QUERY_KEYS.getSearchUsers(query),
		queryFn: () => getUsersByQuery(query),
		enabled: query !== "",
		refetchOnWindowFocus: false,
	});
};

export { useSearchUsers, getUsersByQuery };
