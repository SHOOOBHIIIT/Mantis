'use client';

import { useAuthStore } from '@/stores/authStore';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

export default function SettingsPage() {
  const { user, company } = useAuthStore();

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Settings</h1>

      <div className="space-y-4">
        {/* Company info */}
        {company && (
          <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Company Information</h2>
            <div className="flex items-center gap-4 mb-4">
              <Avatar name={company.name} size="lg" />
              <div>
                <p className="text-base font-semibold text-text-primary">{company.name}</p>
                <Badge variant="brand">Company Account</Badge>
              </div>
            </div>
            {company.description && (
              <p className="text-sm text-text-secondary">{company.description}</p>
            )}
          </div>
        )}

        {/* Account info */}
        <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Account</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border-subtle">
              <span className="text-sm text-text-secondary">Email</span>
              <span className="text-sm text-text-primary">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-text-secondary">Role</span>
              <Badge variant={user?.role === 'company' ? 'brand' : 'default'}>
                {user?.role}
              </Badge>
            </div>
          </div>
        </div>

        {/* Environment note */}
        <div className="bg-bg-tertiary border border-border-subtle rounded-2xl p-5 text-xs text-text-muted">
          <p className="font-medium text-text-secondary mb-1">Configuration</p>
          <p>
            MOSS Project ID, OpenAI key, ElevenLabs key, and Supabase credentials are configured via
            environment variables in <code className="text-brand-400">/backend/.env</code> and{' '}
            <code className="text-brand-400">/frontend/.env.local</code>.
          </p>
        </div>
      </div>
    </div>
  );
}
