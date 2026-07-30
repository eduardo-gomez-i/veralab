"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, ChevronLeft, Eye, EyeOff, Loader2 } from 'lucide-react';

const TITLES = /^(dr\.?|dra\.?|lic\.?|ing\.?|prof\.?)\s+/i;

function generateUsername(name: string): string {
  const cleaned = name.trim().replace(TITLES, '');
  const words = cleaned
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove accents
    .toLowerCase()
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return '';
  if (words.length === 1) return words[0];

  // first initial + last word  e.g. "Juan Pérez" → "jperez"
  return words[0][0] + words[words.length - 1];
}

async function findAvailableUsername(base: string): Promise<string> {
  if (!base) return '';
  const check = async (u: string) => {
    const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(u)}`);
    const data = await res.json();
    return data.available as boolean;
  };

  if (await check(base)) return base;

  for (let i = 2; i <= 99; i++) {
    const candidate = `${base}${i}`;
    if (await check(candidate)) return candidate;
  }
  return base;
}

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'name') {
      setFormData((prev) => ({ ...prev, name: value }));
      const base = generateUsername(value);
      if (!base) { setSuggestion(''); return; }

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setCheckingUsername(true);
        const available = await findAvailableUsername(base);
        setSuggestion(available);
        setFormData((prev) => ({
          ...prev,
          username: usernameTouched ? prev.username : available,
        }));
        setCheckingUsername(false);
      }, 500);
    } else if (name === 'username') {
      setUsernameTouched(true);
      setFormData((prev) => ({ ...prev, username: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const applySuggestion = () => {
    setFormData((prev) => ({ ...prev, username: suggestion }));
    setUsernameTouched(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Error al registrarse.');
      }
    } catch {
      setError('Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-white px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[calc(env(safe-area-inset-top,0px)+2rem)] text-center md:bg-gray-100">
        <div className="w-full max-w-md md:rounded-2xl md:bg-white md:p-8 md:shadow-xl">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-50">
            <CheckCircle2 className="h-11 w-11 text-green-500" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-900">Solicitud enviada</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">
            Tu solicitud de registro fue recibida. Un administrador revisará tu cuenta y recibirás un
            correo cuando sea aprobada.
          </p>
          <Link href="/login" className="mt-8 block">
            <Button size="xl" variant="outline">
              Volver al inicio de sesión
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-blue-600 md:items-center md:justify-center md:bg-gray-100 md:p-6">
      <div className="flex w-full flex-1 flex-col md:max-w-md md:flex-none md:overflow-hidden md:rounded-2xl md:shadow-xl">
        {/* Carries its own blue — see the same band in Login.tsx. */}
        <div className="bg-blue-600 px-4 pb-8 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] md:pt-6">
          <Link
            href="/login"
            aria-label="Volver al inicio de sesión"
            className="grid h-11 w-11 place-items-center rounded-full text-white active:bg-white/15"
          >
            <ChevronLeft size={24} />
          </Link>
          <div className="mt-2 text-center">
            {/* Same treatment as the login screen — see Login.tsx. */}
            <Image
              src="/logo-mark.png"
              alt="VeraLAB"
              width={330}
              height={143}
              className="mx-auto h-12 w-auto brightness-0 invert"
              priority
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col rounded-t-3xl bg-white px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 md:rounded-none md:pb-8">
          <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="mt-1 text-sm text-gray-500">
            Completa tus datos para registrarte en la plataforma
          </p>

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
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Dr. Juan Pérez"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  autoComplete="name"
                  autoCapitalize="words"
                  enterKeyHint="next"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="username" className="flex items-center gap-2">
                  Usuario
                  {checkingUsername && (
                    <span className="inline-flex items-center gap-1 text-xs font-normal text-gray-400">
                      <Loader2 size={12} className="animate-spin" />
                      buscando disponibilidad
                    </span>
                  )}
                </Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="jperez"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="next"
                />
                {usernameTouched && suggestion && suggestion !== formData.username && (
                  <p className="text-xs text-gray-500">
                    Sugerencia:{' '}
                    <button
                      type="button"
                      onClick={applySuggestion}
                      className="font-semibold text-blue-600"
                    >
                      {suggestion}
                    </button>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  placeholder="jperez@clinica.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  autoComplete="email"
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
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    enterKeyHint="next"
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

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repite tu contraseña"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  autoComplete="new-password"
                  enterKeyHint="go"
                />
              </div>
            </div>

            <div className="mt-8 md:mt-6">
              <Button type="submit" size="xl" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Enviando solicitud...
                  </>
                ) : (
                  'Crear cuenta'
                )}
              </Button>

              <p className="mt-5 text-center text-sm text-gray-500">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="font-semibold text-blue-600">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
