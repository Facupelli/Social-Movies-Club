"use client";

import { useSearchParams } from "next/navigation";
import { UpsertUsernameDialog } from "./upsert-username-dialog";

export function WelcomeDialog() {
	const searchParams = useSearchParams();
	const isWelcome = searchParams.get("welcome") === "true";

	return <UpsertUsernameDialog isOpen={isWelcome} showTrigger={false} />;
}
