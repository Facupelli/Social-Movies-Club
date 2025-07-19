"use client";

import { useSearchParams } from "next/navigation";
import { UpsertUsernameDialog } from "./create-username-dialog";

export function WelcomeDialog() {
	const searchParams = useSearchParams();
	const isWelcome = searchParams.get("welcome") === "true";

	return <UpsertUsernameDialog isOpen={isWelcome} showTrigger={false} />;
}
