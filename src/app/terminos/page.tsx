import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | Veralab',
  description: 'Términos y condiciones de servicio del Laboratorio Dental Veralab.',
};

export default function TerminosPage() {
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
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Términos y Condiciones</h1>
          <p className="text-slate-500 mb-8">Última actualización: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introducción</h2>
              <p>
                Bienvenido a Veralab. Al acceder a nuestros servicios y realizar pedidos de prótesis dentales, usted acepta estar sujeto a estos términos y condiciones. Estos términos rigen la relación comercial entre Veralab ("el Laboratorio") y el profesional odontológico o clínica ("el Cliente").
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Servicios y Pedidos</h2>
              <p>
                El Laboratorio se compromete a fabricar dispositivos médicos a medida (prótesis dentales) según las especificaciones proporcionadas por el Cliente.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>El Cliente es responsable de proporcionar impresiones, registros de mordida y prescripciones claras y precisas.</li>
                <li>Cualquier modificación en el diseño o especificaciones después de iniciado el trabajo puede incurrir en costos adicionales.</li>
                <li>El Laboratorio se reserva el derecho de rechazar impresiones o registros que no cumplan con los estándares de calidad necesarios para garantizar un resultado óptimo.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Tiempos de Entrega</h2>
              <p>
                Los tiempos de entrega estándar son de 24 a 48 horas para la mayoría de los trabajos, dependiendo de la complejidad.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Los tiempos se cuentan a partir de la recepción física de los modelos o archivos digitales validados.</li>
                <li>El Laboratorio no se hace responsable por retrasos causados por servicios de mensajería externos o fuerza mayor.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Garantía y Devoluciones</h2>
              <p>
                Veralab garantiza que todas las prótesis están libres de defectos en materiales y mano de obra.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Se ofrece una garantía de satisfacción. Si el ajuste no es correcto debido a un error de fabricación, se repetirá o corregirá el trabajo sin costo adicional.</li>
                <li>La garantía no cubre: cambios en el plan de tratamiento original, nuevas impresiones requeridas por distorsión en la original, o daños por mal uso del paciente.</li>
                <li>Las reclamaciones deben realizarse dentro de los 30 días posteriores a la entrega.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Precios y Pagos</h2>
              <p>
                Los precios están sujetos a la lista vigente al momento de recibir el pedido.
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>El pago debe realizarse según los términos acordados en la cuenta del Cliente (contado, semanal o mensual).</li>
                <li>El Laboratorio se reserva el derecho de suspender servicios a cuentas con saldos vencidos.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">6. Propiedad Intelectual</h2>
              <p>
                Todos los diseños, procesos y tecnologías utilizados por Veralab son propiedad intelectual del Laboratorio o de sus licenciantes.
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
