import { db, type PGDb } from "./db.neon";

export class DatabaseError extends Error {
	readonly code: string;

	constructor(message: string, code = "DB_ERROR") {
		super(message);
		this.name = "DatabaseError";
		this.code = code;
	}
}

export type DatabaseOperation<T> = (database: PGDb) => Promise<T>;

export async function withDatabase<T>(
	operation: DatabaseOperation<T>,
): Promise<T> {
	try {
		return await operation(db);
	} catch (error) {
		// biome-ignore lint: reason
		console.log("withDatabase: ERROR", { error });

		const errorMessage =
			error instanceof Error ? error.message : "Unknown error";
		const errorCode =
			error instanceof Error && "code" in error
				? (error.code as string)
				: "DB_OPERATION_ERROR";

		throw new DatabaseError(
			`Database operation failed: ${errorMessage}`,
			errorCode || "DB_OPERATION_ERROR",
		);
	}
}
