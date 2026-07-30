"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const { success, message } = await login(username, password);
      if (success) {
        router.push('/dashboard');
      } else {
        setError(message || 'Credenciales inválidas. Intente nuevamente.');
      }
    } catch {
      setError('Ocurrió un error al iniciar sesión.');
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-blue-600 md:items-center md:justify-center md:bg-gray-100 md:p-6">
      <div className="flex w-full flex-1 flex-col md:max-w-md md:flex-none md:overflow-hidden md:rounded-2xl md:shadow-xl">
        {/* Brand band — doubles as the status-bar backdrop on a notched phone.
            Carries its own blue: the wrapper turns grey at md, and the white
            logo silhouette would vanish against it. */}
        <div className="bg-blue-600 px-6 pb-10 pt-[calc(env(safe-area-inset-top,0px)+3rem)] text-center md:pt-10">
          {/* Flat white silhouette straight on the brand blue (5.16:1).
              Uses the trimmed mark so the artwork actually fills this
              height — logo.png carries ~24% transparent padding. */}
          <Image
            src="/logo-mark.png"
            alt="VeraLAB"
            width={330}
            height={143}
            className="mx-auto h-16 w-auto brightness-0 invert"
            priority
          />
          <p className="mt-4 text-sm font-medium tracking-wide text-blue-50">Sistema de Pedidos</p>
        </div>

        <div className="flex flex-1 flex-col rounded-t-3xl bg-white px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 md:rounded-none md:pb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenido</h1>
          <p className="mt-1 text-sm text-gray-500">Ingresa tus credenciales para continuar</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col">
            <div className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600"
                >
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="username">Usuario o correo</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Tu usuario o correo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="next"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="current-password"
                    enterKeyHint="go"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    className="absolute right-1 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg text-gray-500 active:bg-gray-100"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Primary action sits at the bottom of the screen, thumb-reachable. */}
            <div className="mt-8 md:mt-6">
              <Button type="submit" size="xl" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Ingresando...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>

              <p className="mt-5 text-center text-sm text-gray-500">
                ¿No tienes cuenta?{' '}
                <Link href="/register" className="font-semibold text-blue-600">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
