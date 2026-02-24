import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad | Veralab',
  description: 'Política de privacidad y protección de datos de Veralab.',
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Simple Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="text-xl font-bold text-blue-900">Veralab</span>
            </Link>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-sm border p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Política de Privacidad</h1>
          <p className="text-slate-500 mb-8">Última actualización: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Compromiso de Privacidad</h2>
              <p>
                En Veralab, nos tomamos muy en serio la privacidad de nuestros clientes (odontólogos y clínicas) y la confidencialidad de los datos de los pacientes. Esta política describe cómo recopilamos, utilizamos y protegemos su información.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Información que Recopilamos</h2>
              <p>
                Recopilamos información necesaria para la prestación de nuestros servicios de laboratorio dental:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li><strong>Datos del Cliente:</strong> Nombre del profesional, nombre de la clínica, dirección, teléfono, correo electrónico y datos de facturación.</li>
                <li><strong>Datos del Paciente:</strong> Nombre o código identificador, edad, sexo, e información clínica relevante para la fabricación de la prótesis (impresiones, archivos STL, fotografías).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Uso de la Información</h2>
              <p>
                Utilizamos la información recopilada exclusivamente para:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Procesar y fabricar los pedidos de prótesis dentales.</li>
                <li>Comunicarnos con usted sobre el estado de sus pedidos o consultas técnicas.</li>
                <li>Facturación y gestión administrativa.</li>
                <li>Mejorar nuestros servicios y calidad.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Protección de Datos</h2>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas para proteger la información contra acceso no autorizado, alteración o divulgación.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Los archivos digitales de pacientes se almacenan en servidores seguros.</li>
                <li>El acceso a los datos está restringido al personal autorizado que necesita la información para realizar su trabajo.</li>
                <li>Cumplimos con las normativas locales de protección de datos y confidencialidad médica.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Compartir Información</h2>
              <p>
                No vendemos ni alquilamos información personal a terceros. Solo compartimos información cuando es estrictamente necesario para:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Cumplir con obligaciones legales o requerimientos de autoridades competentes.</li>
                <li>Proveedores de servicios de logística (para la entrega de pedidos).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">6. Sus Derechos</h2>
              <p>
                Usted tiene derecho a acceder, rectificar o solicitar la eliminación de sus datos personales almacenados en nuestros sistemas, sujeto a las obligaciones legales de conservación de registros médicos y fiscales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">7. Contacto</h2>
              <p>
                Si tiene preguntas sobre esta política de privacidad, por favor contáctenos en:
                <br />
                <strong>Email:</strong> privacidad@veralab.com
                <br />
                <strong>Dirección:</strong> Av. Principal 123, Ciudad de México.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Veralab. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
