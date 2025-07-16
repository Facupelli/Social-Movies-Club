import z from "zod";

const GetUserFeedQuerySchema = z.object({
  cursor: z
    .string()
    .refine(
      (val) => {
        if (val === "") return false;
        return !isNaN(Date.parse(val));
      },
      { message: "cursor must be a valid ISO 8601 timestamp" }
    )
    .nullable()
    .optional(),
});

export type GetUserFeedQueryInput = z.infer<typeof GetUserFeedQuerySchema>;

export function validateGetUserFeedQuery(
  searchParams: URLSearchParams
): GetUserFeedQueryInput {
  const data = Object.fromEntries(searchParams.entries());
  return GetUserFeedQuerySchema.parse(data);
}

const FollowUserSchema = z.object({
  followedUserId: z.string().nonempty(),
});

export type FollowUserInput = z.infer<typeof FollowUserSchema>;

export function validateFollowUser(formData: FormData): FollowUserInput {
  const data = Object.fromEntries(formData.entries());
  return FollowUserSchema.parse(data);
}
