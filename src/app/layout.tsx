import "~/styles/globals.css";
import { type Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import TopNav from "~/app/_components/topnav";

export const metadata: Metadata = {
  title: "T3 Gallery",
  description: "A simple image gallery built with the T3 stack.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable}`}>
        <body className={"flex flex-col gap-4"}>
          <TopNav />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
