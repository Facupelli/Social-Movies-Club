import {
	NotificationEventRegistry,
	type UserFollowedEvent,
} from "@/modules/notifications/notify-user-followed/notification-event-handler";
import { NotificationService } from "@/modules/notifications/list-notifications/notifications.service";
import { UserService } from "@/modules/profiles/user.service";
import { FollowsPgRepository } from "./follows.pg.repository";
import type { GetFollowingUsers, GetUserFollowsInfoMap } from "@/modules/social/follows.type";

const notificationService = new NotificationService();
const eventRegistry = new NotificationEventRegistry(notificationService);

const userService = new UserService();

export class FollowService {
	private followPgRepository: FollowsPgRepository;

	constructor() {
		this.followPgRepository = new FollowsPgRepository();
	}

	async getFollowingUsers(userId: string): Promise<GetFollowingUsers[]> {
		return await this.followPgRepository.getFollowingUsers(userId);
	}

	async getUserFollowsInfo(userId: string): Promise<GetUserFollowsInfoMap> {
		return await this.followPgRepository.getUserFollowsInfo(userId);
	}

	async isFollowingUser(
		userId: string,
		followedUserId: string,
	): Promise<boolean> {
		return await this.followPgRepository.isFollowingUser(
			userId,
			followedUserId,
		);
	}

	async followUser(userId: string, followedUserId: string): Promise<void> {
		const isFollowingUser = await this.followPgRepository.isFollowingUser(
			userId,
			followedUserId,
		);

		if (isFollowingUser) {
			throw new Error("User is already being followed");
		}

		try {
			await this.followPgRepository.followUser(userId, followedUserId);

			const user = await userService.getUser(userId);

			if (!user?.username) {
				return;
			}

			const event: UserFollowedEvent = {
				followerId: userId,
				followedUserId,
				followerUsername: user.username,
				followerImage: user.image,
				timestamp: new Date(),
			};

			await eventRegistry.handleEvent("user_followed", event);
		} catch (error) {
			console.log({ error });
		}
	}

	async unfollowUser(userId: string, followedUserId: string): Promise<void> {
		const isFollowingUser = await this.followPgRepository.isFollowingUser(
			userId,
			followedUserId,
		);

		if (!isFollowingUser) {
			throw new Error("User is not followed");
		}

		await this.followPgRepository.unfollowUser(userId, followedUserId);
	}
}
