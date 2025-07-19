"use client";

import { useActionState, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";
import { useIsOwner } from "@/lib/hooks/use-is-owner";
import type { ApiResponse } from "@/lib/safe-execute";
import { updateUserName } from "../actions/update-username";

export function UpsertUsernameDialog({
	isOpen,
	showTrigger,
}: {
	isOpen?: boolean;
	showTrigger?: boolean;
}) {
	const { data: session } = authClient.useSession();
	const [open, setOpen] = useState(!!isOpen);

	const { isOwner } = useIsOwner();
	const username = session?.user.username;

	const handleUpdateUsername = async (
		_state: ApiResponse<void>,
		formData: FormData,
	) => {
		const result = await updateUserName(formData);
		if (result.success) {
			setOpen(false);
		}

		return result;
	};

	const [_, action] = useActionState(handleUpdateUsername, {
		success: false,
		error: "",
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			{showTrigger !== false && (
				<DialogTrigger asChild className="cursor-pointer">
					<Button
						size="sm"
						disabled={!session || !isOwner}
						className="px-0 h-auto"
						variant="link"
					>
						{username ? username : "Crear nombre de usuario"}
					</Button>
				</DialogTrigger>
			)}
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{username ? "Actualizar" : "Crear"} nombre de usuario
					</DialogTitle>
					<DialogDescription>
						Al crear un nombre de usuario, los demás usuarios podrán buscarte en
						el buscador principal escribiendo tu @ para seguirte!
					</DialogDescription>

					<form className="pt-4">
						<Label htmlFor="username">Nombre de usuario</Label>
						<Input type="text" id="username" name="username" />

						<DialogFooter className="pt-4 gap-2 md:gap-6">
							<DialogClose asChild>
								<Button type="button" variant="secondary">
									Cancelar
								</Button>
							</DialogClose>

							<SubmitButton
								formAction={action}
								loadingText={username ? "Actualizando" : "Creando"}
							>
								{username ? "Actualizar" : "Crear"}
							</SubmitButton>
						</DialogFooter>
					</form>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	);
}
