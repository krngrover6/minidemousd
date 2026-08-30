import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const sans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const mono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OpenUSD Garage — Learn the ZAZ-965 Omniverse Demo',
  description: 'A beginner-friendly interactive guide to OpenUSD, Omniverse Kit, variants, animation, materials, Data Tables and MCP.',
  openGraph: {
    title: 'OpenUSD Garage — Learn the ZAZ-965 Omniverse Demo',
    description: 'Learn OpenUSD and Omniverse through a real, working car configurator project.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'OpenUSD Garage',
    description: 'A beginner-friendly guide to the ZAZ-965 Omniverse mini demo.',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${sans.variable} ${mono.variable}`}>{children}</body></html>;
}
