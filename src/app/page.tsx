import { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'Veralab - Laboratorio Dental de Alta Precisión',
  description: 'Especialistas en fabricación de prótesis dentales con tecnología de vanguardia.',
};

export default function Home() {
  return <LandingPage />;
}
