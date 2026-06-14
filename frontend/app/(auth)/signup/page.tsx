'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Mail, Lock, Building2, User } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'At least 6 characters'),
  role: z.enum(['user', 'company']),
  company_name: z.string().optional(),
}).refine((data) => {
  if (data.role === 'company' && !data.company_name?.trim()) {
    return false;
  }
  return true;
}, { message: 'Company name is required', path: ['company_name'] });

type FormValues = z.infer<typeof schema>;

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<'user' | 'company'>('user');

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'user' },
  });

  const handleRoleChange = (r: 'user' | 'company') => {
    setRole(r);
    setValue('role', r);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await authAPI.register(data);
      toast.success('Account created! Please sign in.');
      router.push('/login');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-brand-500 items-center justify-center mb-4 shadow-xl shadow-brand-500/30">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Create your account</h1>
          <p className="text-sm text-text-muted mt-1">Join Mantis — free forever</p>
        </div>

        <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-8 shadow-2xl shadow-black/30">
          {/* Role selector */}
          <div className="flex gap-2 mb-6 p-1 bg-bg-tertiary rounded-xl">
            {([
              { value: 'user', label: 'User', icon: User, desc: 'Browse & diagnose' },
              { value: 'company', label: 'Company', icon: Building2, desc: 'List products' },
            ] as const).map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleRoleChange(value)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 py-3 rounded-lg text-xs transition-all duration-200',
                  role === value
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                <Icon size={16} />
                <span className="font-semibold">{label}</span>
                <span className={cn('text-[10px]', role === value ? 'text-white/70' : 'text-text-muted')}>{desc}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {role === 'company' && (
              <Input
                id="company_name"
                label="Company Name"
                placeholder="e.g. Acme Motors"
                icon={<Building2 size={14} />}
                error={errors.company_name?.message}
                {...register('company_name')}
              />
            )}

            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail size={14} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              icon={<Lock size={14} />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
