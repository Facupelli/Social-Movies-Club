import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { ReactQueryProvider } from "@/providers/react-query.provider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Social Movies Club",
	description:
		"No sabes qué película ver? Tenés amigos con buen gusto para las pelis? Entrá, encontrá pelis y recomendá!",
};

export const viewport: Viewport = {
	themeColor: "#1a1b1e",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<meta name="theme-color" content="#1a1b1e"></meta>

			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased `}
			>
				<ReactQueryProvider>
					<div className="dark bg-sidebar">
						<div className="relative mx-auto flex max-w-5xl flex-col text-card-foreground md:flex-row">
							<Nav />
							<div className="flex-1 bg-background pb-[60px] md:pb-0 border-accent-foreground md:border-r md:border-l">
								{children}
							</div>
						</div>
					</div>
				</ReactQueryProvider>
			</body>
		</html>
	);
}
