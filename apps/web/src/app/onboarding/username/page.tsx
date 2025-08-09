import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/auth/auth";
import { createUsername } from "@/users/actions/update-username";

export default async function UsernamePage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/");
	}

	return (
		<section className="p-4 min-h-svh">
			<h1 className="font-bold text-pretty text-lg">Crear nombre de usuario</h1>
			<p className="text-pretty text-muted-foreground">
				Al crear un nombre de usuario, los demás usuarios podrán buscarte en el
				buscador principal escribiendo tu @ para seguirte.
			</p>

			<form className="pt-4">
				<div className="space-y-1">
					<Label htmlFor="username">Nombre de usuario</Label>
					<Input type="text" id="username" name="username" />
				</div>

				<div className="flex items-center gap-4 pt-4">
					<Button type="button" variant="secondary" className="flex-1">
						Cancelar
					</Button>

					<SubmitButton
						formAction={createUsername}
						className="flex-1"
						loadingText="Creando"
					>
						Crear
					</SubmitButton>
				</div>
			</form>
		</section>
	);
}
