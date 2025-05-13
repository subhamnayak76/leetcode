import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Coding Problems Platform",
  description: "Practice coding problems and submit solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white dark:bg-gray-800 shadow">
          <div className="container mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="text-xl font-bold">
                    Code Practice
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    href="/problems"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Problems
                  </Link>
                  <Link
                    href="/submissions"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Submissions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
