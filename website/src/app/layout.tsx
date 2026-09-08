import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/themeContext';
import { I18nProvider } from '@/lib/i18n';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-mono',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#060708',
};

export const metadata: Metadata = {
  title: 'GhostTweak — Windows Latency & System Optimization',
  description: 'Native desktop gaming optimization utility for Windows 10 & 11. High-precision timer, shader cache purge, and telemetry removal.',
  keywords: ['ghosttweak', 'game optimizer', 'windows tweak', 'input lag', 'fps boost', 'tauri', 'rust', 'cs2', 'valorant'],
  authors: [{ name: 'GhostTweak Systems' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-obsidian-950 text-slate-100 font-sans antialiased selection:bg-cyan-400 selection:text-black min-h-screen">
        <I18nProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
