import { authClient } from "@/platform/auth/auth-client";
import { Button } from "@/shared/ui/button";

export default function SignInButton() {
	const handleSignIn = async () => {
		await authClient.signIn.social({
			provider: "google",
			callbackURL: "/",
			errorCallbackURL: "/error",
			newUserCallbackURL: "/onboarding/username",
			// disableRedirect: true,
		});
	};

	return (
		<Button onClick={handleSignIn} type="button">
			Ingresar
		</Button>
	);
}
