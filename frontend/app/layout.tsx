import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { InteractiveBackground } from '@/components/ui/InteractiveBackground';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Mantis — AI Product Diagnostic Platform',
  description:
    'Get expert-level product diagnostics powered by AI. Upload manuals, ask questions, and resolve issues like a pro.',
  keywords: ['product support', 'AI diagnostics', 'troubleshooting', 'product manual', 'MOSS'],
  openGraph: {
    title: 'Mantis — AI Product Diagnostic Platform',
    description: 'Expert AI diagnostics for any product. Powered by MOSS + GPT-4o.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg-primary text-text-primary font-sans antialiased selection:bg-brand-500/30 selection:text-brand-100 relative">
        <InteractiveBackground />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Providers>
            <Navbar />
            <main className="pt-16 flex-1 flex flex-col">
              {children}
            </main>
            <Footer />
          </Providers>
        </div>
      </body>
    </html>
  );
}
