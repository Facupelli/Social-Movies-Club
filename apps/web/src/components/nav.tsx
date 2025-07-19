"use client";

import { Home, Info, User2Icon } from "lucide-react";
import Image from "next/image";
import { authClient } from "@/lib/auth/auth-client";
import SignInButton from "./sign-in-button";
import { Button } from "./ui/button";

export function Nav() {
	const {
		data: session,
		// isPending, //loading state
		// error, //error object
		// refetch, //refetch the session
	} = authClient.useSession();

	const handleLogOut = async () => {
		await authClient.signOut();
	};

	return (
		<nav className="fixed z-10 bottom-0 left-0 flex w-full flex-row justify-center bg-sidebar p-4 md:sticky md:top-0 md:h-screen md:w-[250px] md:flex-col md:p-8">
			<ul className="flex gap-16 md:grid md:gap-4">
				<li>
					<a className="flex items-center gap-2" href="/">
						<Home />
						<span className="hidden md:block">Inicio</span>
					</a>
				</li>
				<li>
					<a
						className="flex items-center gap-2"
						href={`/profile/${session?.user.id}`}
					>
						<User2Icon />
						<span className="hidden md:block">Perfil</span>
					</a>
				</li>
				<li>
					<a className="flex items-center gap-2" href="/credits">
						<Info />
						<span className="hidden md:block">Créditos</span>
					</a>
				</li>
			</ul>

			<div className="mt-auto hidden md:block ">
				{session ? (
					<div>
						<div className="flex items-center gap-2 pb-4">
							{session.user.image && (
								<div className="shrink-0 rounded-full bg-secondary-foreground">
									<Image
										alt={session.user.name}
										className="size-[30px] rounded-full object-cover"
										height={30}
										src={session.user.image}
										unoptimized
										width={30}
									/>
								</div>
							)}
							<div className="text-sm">
								<p>{session.user.name}</p>
							</div>
						</div>
						<Button onClick={handleLogOut} type="button">
							Salir
						</Button>
					</div>
				) : (
					<SignInButton />
				)}
			</div>
		</nav>
	);
}
