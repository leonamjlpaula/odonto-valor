import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/presentation/components/ui/toaster';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { CookieBanner } from '@/presentation/components/CookieBanner';
import { PosthogProvider } from '@/presentation/components/PosthogProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LucroDental',
  description: 'SaaS de precificação para consultórios odontológicos',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <PosthogProvider>
          {children}
          <Toaster />
          <CookieBanner />
          <Analytics />
          <SpeedInsights />
        </PosthogProvider>
      </body>
    </html>
  );
}
