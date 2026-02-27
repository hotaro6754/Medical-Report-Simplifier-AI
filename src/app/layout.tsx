import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/medai/components/ThemeProvider";
import { ThemeToggle } from "@/medai/components/ThemeToggle";
import { NavigationHUB } from "@/medai/components/NavigationHUB";
import { LanguageProvider } from "@/medai/components/LanguageContext";
import { LanguageSwitcher } from "@/medai/components/LanguageSwitcher";
import { AuthProvider } from "@/medai/components/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swasthya AI – Healthcare Intelligence for Bharat",
  description: "Simplifying complex lab reports into plain regional languages with scientific accuracy and empathy. Transforming rural healthcare.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Public+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Noto+Sans+Devanagari:wght@400;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-medical-surface text-medical-text selection:bg-medical-primary/30" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AuthProvider>
              <NavigationHUB />
              <LanguageSwitcher />
              <ThemeToggle />
              <main>
                {children}
              </main>
              <Toaster />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
