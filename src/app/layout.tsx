import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Billy — Smart Invoice & Payroll Management",
  description: "Automated billing and employee payroll workflows for small and medium businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col">
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#18181b",
                  color: "#fafafa",
                  border: "1px solid #27272a",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "500",
                },
                success: {
                  iconTheme: {
                    primary: "#10b981", // emerald-500
                    secondary: "#fafafa",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#ef4444", // red-500
                    secondary: "#fafafa",
                  },
                },
              }}
            />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
