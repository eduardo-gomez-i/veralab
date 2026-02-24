"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight,
  Smile,
  Layers,
  Award
} from 'lucide-react';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Hero Animations
    const tl = gsap.timeline();
    tl.from(".hero-content > *", {
      y: 50,
      opacity: 0,
      duration: 1,
      stagger: 0.2,
      ease: "power3.out"
    })
    .from(".hero-bg-element", {
      scale: 0.8,
      opacity: 0,
      duration: 1.5,
      stagger: 0.3,
      ease: "power2.out"
    }, "-=0.8");

    // Stats Animation
    gsap.from(".stat-item", {
      scrollTrigger: {
        trigger: ".stats-section",
        start: "top 80%",
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out"
    });

    // Services Animation
    gsap.from(".service-card", {
      scrollTrigger: {
        trigger: ".services-section",
        start: "top 75%",
      },
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power2.out"
    });

    // Tech Section Animation
    gsap.from(".tech-text", {
      scrollTrigger: {
        trigger: ".tech-section",
        start: "top 70%",
      },
      x: -50,
      opacity: 0,
      duration: 1,
      ease: "power2.out"
    });

    gsap.from(".tech-image", {
      scrollTrigger: {
        trigger: ".tech-section",
        start: "top 70%",
      },
      x: 50,
      opacity: 0,
      duration: 1,
      ease: "power2.out",
      delay: 0.2
    });

    // Features Animation
    gsap.from(".feature-item", {
      scrollTrigger: {
        trigger: ".features-section",
        start: "top 80%",
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "back.out(1.7)"
    });

    // Contact Animation
    gsap.from(".contact-card", {
      scrollTrigger: {
        trigger: ".contact-section",
        start: "top 75%",
      },
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-blue-900">Veralab</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href="#servicios" className="hover:text-blue-600 transition-colors">Servicios</Link>
            <Link href="#tecnologia" className="hover:text-blue-600 transition-colors">Tecnología</Link>
            <Link href="#contacto" className="hover:text-blue-600 transition-colors">Contacto</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button>Acceso Clientes</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 py-20 lg:py-32">
        <div className="container mx-auto px-4 relative z-10">
          <div className="hero-content mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-6">
              Precisión Digital para <span className="text-blue-600">Sonrisas Perfectas</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 mb-8">
              En Veralab combinamos artesanía dental con tecnología CAD/CAM de última generación para ofrecer prótesis de ajuste perfecto y estética natural.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 text-base">
                  Solicitar Trabajo
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#contacto">
                <Button variant="outline" size="lg" className="h-12 px-8 text-base">
                  Contáctanos
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
           <div className="hero-bg-element absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-blue-300 blur-3xl"></div>
           <div className="hero-bg-element absolute top-[40%] -left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-300 blur-3xl"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section border-y bg-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="stat-item">
              <div className="text-3xl font-bold text-blue-600">+15</div>
              <div className="text-sm text-slate-500 font-medium mt-1">Años de Experiencia</div>
            </div>
            <div className="stat-item">
              <div className="text-3xl font-bold text-blue-600">+50k</div>
              <div className="text-sm text-slate-500 font-medium mt-1">Casos Exitosos</div>
            </div>
            <div className="stat-item">
              <div className="text-3xl font-bold text-blue-600">24/48h</div>
              <div className="text-sm text-slate-500 font-medium mt-1">Tiempo de Entrega</div>
            </div>
            <div className="stat-item">
              <div className="text-3xl font-bold text-blue-600">100%</div>
              <div className="text-sm text-slate-500 font-medium mt-1">Garantía de Calidad</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className="services-section py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Soluciones Protésicas Integrales</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Ofrecemos una amplia gama de soluciones restaurativas, desde carillas estéticas hasta rehabilitaciones completas sobre implantes.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <ServiceCard 
              icon={<Smile className="h-10 w-10 text-blue-600" />}
              title="Estética Dental"
              description="Carillas, coronas de disilicato de litio y zirconia monolítica con caracterización manual para resultados hiperrealistas."
            />
            <ServiceCard 
              icon={<Layers className="h-10 w-10 text-blue-600" />}
              title="Prótesis Fija"
              description="Puentes y coronas sobre dientes naturales o implantes, diseñados digitalmente para un ajuste pasivo perfecto."
            />
            <ServiceCard 
              icon={<Award className="h-10 w-10 text-blue-600" />}
              title="Prótesis Removible"
              description="Esqueléticos, flexibles y prótesis completas caracterizadas con los mejores materiales del mercado."
            />
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section id="tecnologia" className="tech-section py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="tech-text">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Tecnología de Vanguardia</h2>
              <p className="text-slate-600 mb-6 text-lg">
                En Veralab, hemos digitalizado nuestro flujo de trabajo para minimizar errores y maximizar la precisión. Nuestro laboratorio cuenta con:
              </p>
              <ul className="space-y-4">
                <TechItem text="Escáneres de laboratorio de alta resolución" />
                <TechItem text="Fresadoras de 5 ejes para zirconia y metal" />
                <TechItem text="Impresoras 3D para modelos y guías quirúrgicas" />
                <TechItem text="Software de diseño CAD (Exocad, 3Shape)" />
              </ul>
              <div className="mt-8">
                <Button variant="outline">Conocer más sobre nuestro flujo digital</Button>
              </div>
            </div>
            <div className="tech-image relative h-[400px] rounded-2xl overflow-hidden bg-slate-100 shadow-xl border">
              {/* Placeholder for an image - using a stylized gradient for now */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                <div className="text-center p-8">
                  <Cpu className="h-24 w-24 mx-auto mb-4 opacity-80" />
                  <span className="text-2xl font-bold">Laboratorio 100% Digital</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features/Values */}
      <section className="features-section py-20 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="feature-item text-center">
              <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="h-8 w-8 text-blue-300" />
              </div>
              <h3 className="text-xl font-bold mb-3">Calidad Certificada</h3>
              <p className="text-blue-100">
                Utilizamos exclusivamente materiales certificados (FDA/CE) de marcas líderes mundiales.
              </p>
            </div>
            <div className="feature-item text-center">
              <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="h-8 w-8 text-blue-300" />
              </div>
              <h3 className="text-xl font-bold mb-3">Tiempos Optimizados</h3>
              <p className="text-blue-100">
                Entregas puntuales gracias a nuestra gestión eficiente y capacidad de producción.
              </p>
            </div>
            <div className="feature-item text-center">
              <div className="bg-white/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-8 w-8 text-blue-300" />
              </div>
              <h3 className="text-xl font-bold mb-3">Soporte Clínico</h3>
              <p className="text-blue-100">
                Asesoramiento técnico directo para planificar casos complejos y resolver dudas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="contact-section py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="contact-card max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-10 bg-blue-600 text-white">
                <h2 className="text-3xl font-bold mb-6">Contáctanos</h2>
                <p className="mb-8 text-blue-100">
                  ¿Listo para elevar la calidad de tus trabajos protésicos? Escríbenos o llámanos para empezar a trabajar juntos.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-blue-300 mt-1" />
                    <div>
                      <h4 className="font-semibold text-lg">Ubicación</h4>
                      <p className="text-blue-100">Av. Principal 123, Ciudad de México, CP 00000</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-blue-300 mt-1" />
                    <div>
                      <h4 className="font-semibold text-lg">Teléfono</h4>
                      <p className="text-blue-100">+52 55 1234 5678</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-blue-300 mt-1" />
                    <div>
                      <h4 className="font-semibold text-lg">Email</h4>
                      <p className="text-blue-100">contacto@veralab.com</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-10">
                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nombre del Doctor/Clínica</label>
                    <input type="text" id="name" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Dr. Juan Pérez" />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                    <input type="email" id="email" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="juan@ejemplo.com" />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Mensaje</label>
                    <textarea id="message" rows={4} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Estoy interesado en sus servicios..."></textarea>
                  </div>
                  <Button className="w-full">Enviar Mensaje</Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <span className="text-xl font-bold text-white">Veralab</span>
              </div>
              <p className="max-w-xs text-sm">
                Laboratorio dental comprometido con la excelencia, la innovación tecnológica y el servicio personalizado para odontólogos exigentes.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Inicio</Link></li>
                <li><Link href="#servicios" className="hover:text-white transition-colors">Servicios</Link></li>
                <li><Link href="#contacto" className="hover:text-white transition-colors">Contacto</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Acceso Clientes</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link></li>
                <li><Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center text-xs">
            <p>&copy; {new Date().getFullYear()} Veralab. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="service-card bg-white p-8 rounded-xl border hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

function TechItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3">
      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
      <span className="text-slate-700">{text}</span>
    </li>
  );
}
