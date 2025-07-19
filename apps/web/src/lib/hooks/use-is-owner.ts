"use client";

import { useParams } from "next/navigation";
import { authClient } from "../auth/auth-client";

export function useIsOwner() {
	const params = useParams<{ id: string | undefined }>();
	const { data: session } = authClient.useSession();

	const isOwner = session?.user.id === params.id;
	const isProfilePage = params.id != null;

	return { isOwner, isProfilePage };
}
