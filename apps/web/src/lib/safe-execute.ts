import { DatabaseError } from "@/infra/postgres/db-utils";

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export async function execute<T>(
	fn: () => Promise<T>,
	onError?: (err: unknown) => ApiFailure,
): Promise<ApiResponse<T>> {
	try {
		const data = await fn();
		return { success: true, data };
	} catch (err) {
		if (onError) return onError(err);

		if (err instanceof DatabaseError) {
			return { success: false, error: "Internal server error" };
		}
		if (err instanceof Error) {
			return { success: false, error: err.message };
		}
		return { success: false, error: "Something went wrong" };
	}
}
