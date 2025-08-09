"use client"; // Error boundaries must be Client Components

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	const handleGlobalError = () => {
		console.log("UNHANDLED ERROR", error);
		reset();
	};

	return (
		<html lang="es">
			<body>
				<h2>Something went wrong!</h2>
				<button type="button" onClick={handleGlobalError}>
					Try again
				</button>
			</body>
		</html>
	);
}
