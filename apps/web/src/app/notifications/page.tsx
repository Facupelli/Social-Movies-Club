import clsx from "clsx";
import { User } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { formatFeedItemTime } from "@/lib/utils";
import { InvalidateNotificationsQuery } from "@/notifications/components/invalidate-query";
import { NotificationService } from "@/notifications/notifications.service";

const notificationService = new NotificationService();

export default async function NotificationsPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/");
	}

	const notifications = await notificationService.getUserNotifications(
		session.user.id,
		{ includeRead: true },
	);

	return (
		<div className="py-6 min-h-svh">
			<InvalidateNotificationsQuery />

			<h1 className="font-bold md:text-xl px-2 md:px-10">Notificaciones</h1>

			<section className="pt-8 flex flex-col divide-y divide-border ">
				{notifications.data.map((notification, index) => (
					<Link
						prefetch={index === 0}
						href={notification.actionUrl ?? "#"}
						key={notification.id}
						className={clsx(
							"flex gap-2 md:gap-4 items-start py-4 px-2 md:px-10 first:border-t border-boder last:border-b",
						)}
					>
						<div>
							<User className="size-7" />
						</div>
						<div className="space-y-1 flex-1">
							<div className="flex justify-between ">
								<div className="size-8 rounded-full bg-secondary-foreground">
									{notification.actorImage ? (
										<Image
											unoptimized
											src={notification.actorImage}
											alt="profile image"
											width={32}
											className="rounded-full size-8 object-cover"
											height={32}
										/>
									) : (
										<div className="size-8 rounded-full bg-secondary-foreground">
											<User />
										</div>
									)}
								</div>

								<div>
									<span className="text-muted-foreground text-sm">
										{formatFeedItemTime(notification.createdAt)}
									</span>
								</div>
							</div>
							<div>
								<span className="text-primary hover:underline font-bold">
									{notification.actorUsername}
								</span>{" "}
								<span>{notification.title}</span>
							</div>
						</div>
					</Link>
				))}
			</section>
		</div>
	);
}
