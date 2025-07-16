"use client";

import { useActionState } from "react";
import { SubmitButton } from "@/components/submit-button";
import { followUser } from "../actions/follow-user";

export function FollowUserButton({
  children,
  followedUserId,
  isFollowing,
}: {
  isFollowing: boolean;
  children: React.ReactNode;
  followedUserId: string;
}) {
  const [_, action, isPending] = useActionState(followUser, {
    success: false,
    error: "",
  });

  return (
    <form>
      <input type="hidden" name="followedUserId" value={followedUserId} />

      <SubmitButton
        disabled={isFollowing || isPending}
        formAction={(formData) => {
          action(formData);
        }}
        loadingText="Siguiendo"
      >
        {children}
      </SubmitButton>
    </form>
  );
}
