"use client";

import { useQuery } from "@tanstack/react-query";
import { Bell, Bookmark, Home, Users2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { getUserNotificationsCountQueryOptions } from "@/users/hooks/use-user-notifications-count";
import SignInButton from "./sign-in-button";
import { Button } from "./ui/button";

export function Nav() {
	const router = useRouter();
	const { data: session } = authClient.useSession();

	const { data: notificationsCount } = useQuery(
		getUserNotificationsCountQueryOptions,
	);

	const handleLogOut = async () => {
		await authClient.signOut();
		router.push("/");
	};

	return (
		<nav className="fixed z-10 bottom-0 left-0 flex w-full flex-row justify-center bg-sidebar p-4 md:sticky md:top-0 md:h-screen md:w-[250px] md:flex-col md:p-8">
			<ul className="flex gap-16 md:grid md:gap-4">
				<li>
					<Link prefetch={false} className="flex items-center gap-2" href="/">
						<Home />
						<span className="hidden md:block">Inicio</span>
					</Link>
				</li>

				<li>
					<Link
						prefetch={true}
						className="flex items-center gap-2"
						href={
							session?.user.id ? `/profile/${session.user.id}/watchlist` : "#"
						}
					>
						<Bookmark />
						<span className="hidden md:block">Lista</span>
					</Link>
				</li>
				<li>
					<Link
						prefetch={false}
						className="flex items-center gap-2"
						href="/users"
					>
						<Users2Icon />
						<span className="hidden md:block">Usuarios</span>
					</Link>
				</li>
				<li>
					<Link
						prefetch={false}
						className="flex items-center gap-2"
						href="/notifications"
					>
						<div className="relative">
							{notificationsCount && notificationsCount > 0 ? (
								<div className="absolute -right-1 -top-1 bg-primary size-4 rounded-full flex items-center justify-center text-sm">
									{notificationsCount}
								</div>
							) : null}
							<Bell />
						</div>
						<span className="hidden md:block">Notificaciones</span>
					</Link>
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
