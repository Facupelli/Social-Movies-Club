import { authClient } from "@/lib/auth/auth-client";
import { Button } from "./ui/button";

export default function SignInButton() {
	const handleSignIn = async () => {
		await authClient.signIn.social({
			provider: "google",
			callbackURL: "/",
			errorCallbackURL: "/error",
			newUserCallbackURL: "/?welcome=true",
			// disableRedirect: true,
		});
	};

	return (
		<Button onClick={handleSignIn} type="button">
			Ingresar
		</Button>
	);
}
