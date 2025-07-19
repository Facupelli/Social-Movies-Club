"use client";

import { useParams } from "next/navigation";
import { authClient } from "../auth/auth-client";

export function useIsOwner() {
	const params = useParams<{ id: string | undefined }>();
	const { data: session } = authClient.useSession();

	const isOwner = session?.user.id === params.id;
	return isOwner;
}
