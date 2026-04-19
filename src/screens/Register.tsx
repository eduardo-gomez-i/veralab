"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';

const TITLES = /^(dr\.?|dra\.?|lic\.?|ing\.?|prof\.?)\s+/i;

function generateUsername(name: string): string {
  const cleaned = name.trim().replace(TITLES, '');
  const words = cleaned
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900">Solicitud enviada</h2>
            <p className="text-gray-600 text-sm">
              Tu solicitud de registro fue recibida. Un administrador revisará tu cuenta
              y recibirás un correo cuando sea aprobada.
            </p>
            <Link href="/login">
              <Button variant="outline" className="mt-2">Volver al inicio de sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center">
            <Image src="/logo.png" alt="VeraLAB" width={280} height={80} className="h-16 w-auto" priority />
          </div>
          <CardTitle className="text-2xl font-bold text-center text-blue-600">Crear cuenta</CardTitle>
          <CardDescription className="text-center">
            Completa tus datos para registrarte a la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                placeholder="Dr. Juan Pérez"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">
                Usuario
                {checkingUsername && (
                  <span className="ml-2 text-xs text-gray-400 font-normal">buscando disponibilidad...</span>
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
              />
              {usernameTouched && suggestion && suggestion !== formData.username && (
                <p className="text-xs text-gray-500">
                  Sugerencia:{' '}
                  <button
                    type="button"
                    onClick={applySuggestion}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {suggestion}
                  </button>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jperez@clinica.com"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando solicitud...
                </>
              ) : (
                'Registrar'
              )}
            </Button>
            <p className="text-center text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-blue-600 hover:underline font-medium">
                Iniciar sesión
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
