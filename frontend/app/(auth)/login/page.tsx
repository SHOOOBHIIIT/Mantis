'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const { data: res } = await authAPI.login(data);
      setAuth(
        { id: res.user_id, email: res.email, role: res.role },
        res.company || null,
        res.access_token
      );
      toast.success('Welcome back!');
      router.push(res.role === 'company' ? '/dashboard' : '/products');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err?.response?.data?.detail || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl bg-brand-500 items-center justify-center mb-4 shadow-xl shadow-brand-500/30">
            <Zap size={20} className="text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">Welcome back</h1>
          <p className="text-sm text-text-muted mt-1">Sign in to your Mantis account</p>
        </div>

        <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-8 shadow-2xl shadow-black/30">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              placeholder="••••••••"
              icon={<Lock size={14} />}
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-brand-400 hover:text-brand-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
