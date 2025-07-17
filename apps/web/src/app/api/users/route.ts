import { headers } from "next/headers";
import type { NextRequest } from "next/server";
import type { User } from "@/infra/postgres/schema";
import { auth } from "@/lib/auth";
import { UserService } from "@/users/user.service";

export async function GET(request: NextRequest) {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		return Response.json({ success: false, error: "Unauthorized" });
	}

	const searchParams = request.nextUrl.searchParams;

	const query = searchParams.get("q");
	if (!query) {
		return Response.json({});
	}

	const userService = new UserService();

	const res: User[] = await userService.getUsers(query);
	return Response.json(res);
}
