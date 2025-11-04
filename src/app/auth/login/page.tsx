'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { authService } from '@/lib/api/services/auth.service';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      
      // Save token and user
      authService.saveToken(response.token);
      authService.saveUser(response.user);

      // Cookie is automatically set by API response (Set-Cookie header)
      // with credentials: 'include' in fetch, it will be stored automatically

      toast.success('Login successful!');

      // Use window.location.href for full page reload to ensure cookie is available
      // Users are always customers - admins use separate login (/admin/login)
      const redirectUrl = new URLSearchParams(window.location.search).get('redirect');
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600">🚗 Tawuniya Drive</h1>
          <p className="mt-2 text-lg text-gray-600">Digital Wallet</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                placeholder="john.doe@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
              >
                Sign In
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  href="/auth/register"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </Link>
              </p>
            </div>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <p className="text-xs text-gray-500">
                <strong>Test Credentials:</strong>
                <br />
                Customer: john.doe@example.com / password123
                <br />
                Admin: admin@tawuniya.com / password123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

