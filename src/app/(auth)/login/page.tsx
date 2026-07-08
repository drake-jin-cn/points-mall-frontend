'use client';

import { Suspense, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { http } from '@/lib/http';
import { useAuthStore } from '@/store/useAuthStore';
import type { AuthUser } from '@/store/useAuthStore';

const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少 6 位'),
});

type LoginForm = z.infer<typeof loginSchema>;

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_state_invalid: 'GitHub 登录状态无效，请重试',
  oauth_cancelled: 'GitHub 登录已取消',
  oauth_failed: 'GitHub 登录失败，请稍后重试',
};

function OAuthErrorToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (!error) return;

    const message = OAUTH_ERROR_MESSAGES[error];
    if (!message) return;

    toast.error(message);
  }, [searchParams]);

  return null;
}

function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const githubAuthUrl = `${process.env.NEXT_PUBLIC_BFF_URL}/auth/github`;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    const user = await http.post<AuthUser>('/auth/login', data);
    setUser(user as unknown as AuthUser);
    router.push('/dashboard');
  };

  const onGithubLogin = () => {
    window.location.href = githubAuthUrl;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">积分商城</h1>
          <p className="mt-1 text-sm text-white/50">登录你的账户</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-white/70">
              邮箱
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-purple-400"
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-white/70">
              密码
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-purple-400"
              {...register('password')}
            />
            {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 text-white hover:bg-purple-500 disabled:opacity-60"
          >
            {isSubmitting ? '登录中…' : '登录'}
          </Button>

          <Button
            type="button"
            onClick={onGithubLogin}
            className="w-full border border-white/15 bg-white/5 text-white hover:bg-white/10"
          >
            使用 GitHub 登录
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Suspense>
        <OAuthErrorToast />
      </Suspense>
      <LoginForm />
    </>
  );
}
