'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, company, clearAuth } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/5 bg-bg-primary/40 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-shadow">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <span className="text-lg font-bold text-text-primary tracking-tight">
            Mantis
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/products"
            className={cn(
              'text-sm transition-colors',
              pathname.startsWith('/products')
                ? 'text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            Products
          </Link>
          {user?.role === 'company' && (
            <Link
              href="/dashboard"
              className={cn(
                'text-sm transition-colors',
                pathname.startsWith('/dashboard')
                  ? 'text-text-primary'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Auth actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.role === 'company' && (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <LayoutDashboard size={14} />
                    Dashboard
                  </Button>
                </Link>
              )}
              <div className="flex items-center gap-2">
                <Avatar
                  name={company?.name || user.email}
                  size="sm"
                />
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                  <LogOut size={14} />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
