import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">Easy Access NewTelecom</div>
            <Link
              href="/dashboard"
              className="px-6 py-2 bg-white text-purple-600 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              Ingresar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
            🎉 Recomienda y Gana Internet Gratis
          </h1>
          <p className="text-2xl md:text-3xl mb-6 opacity-95">
            El programa de referidos que te recompensa por hacer lo que ya haces: ¡Recomendar nuestros servicios!
          </p>
          <p className="text-lg md:text-xl mb-10 max-w-4xl mx-auto leading-relaxed">
            Somos la empresa que te ofrece la posibilidad de tener tu servicio de internet residencial y comercial de alta calidad{' '}
            <strong>sin pagar tu cuota mensual</strong>. Ahora queremos recompensarte de forma ordenada y sistemática por tus buenos comentarios y recomendaciones.
          </p>
          <a
            href="#como-funciona"
            className="inline-block px-12 py-5 bg-yellow-400 text-gray-900 text-xl font-bold rounded-full hover:scale-105 hover:shadow-2xl transition-all"
          >
            Comenzar Ahora
          </a>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12">
            🌟 Beneficios Exclusivos para Ti
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Benefit 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:-translate-y-3 transition-transform text-center">
              <div className="text-6xl mb-5">💰</div>
              <h3 className="text-2xl font-bold text-purple-600 mb-4">Comisión por Instalación</h3>
              <p className="text-gray-600 leading-relaxed">
                Recibe un saldo a favor inmediatamente después de que tu referido instale el servicio
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:-translate-y-3 transition-transform text-center">
              <div className="text-6xl mb-5">📅</div>
              <h3 className="text-2xl font-bold text-purple-600 mb-4">Ingresos Recurrentes</h3>
              <p className="text-gray-600 leading-relaxed">
                Gana comisiones durante 6 meses consecutivos mientras tu referido pague su servicio
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:-translate-y-3 transition-transform text-center">
              <div className="text-6xl mb-5">🎁</div>
              <h3 className="text-2xl font-bold text-purple-600 mb-4">Internet Gratis</h3>
              <p className="text-gray-600 leading-relaxed">
                Aplica tu saldo directamente a tu factura mensual de internet
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:-translate-y-3 transition-transform text-center">
              <div className="text-6xl mb-5">💵</div>
              <h3 className="text-2xl font-bold text-purple-600 mb-4">Efectivo Extra</h3>
              <p className="text-gray-600 leading-relaxed">
                Si tus comisiones superan tu cuenta, recibe el excedente en efectivo
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:-translate-y-3 transition-transform text-center">
              <div className="text-6xl mb-5">🚀</div>
              <h3 className="text-2xl font-bold text-purple-600 mb-4">Sin Límites</h3>
              <p className="text-gray-600 leading-relaxed">
                Recomienda a todos los que quieras, no hay límite de referidos
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-lg hover:-translate-y-3 transition-transform text-center">
              <div className="text-6xl mb-5">⚡</div>
              <h3 className="text-2xl font-bold text-purple-600 mb-4">Automático</h3>
              <p className="text-gray-600 leading-relaxed">
                Todo el proceso es automático, tú solo compartes tu link único
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="como-funciona" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12">
            ¿Cómo Funciona el Sistema?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-5">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Accede al Programa</h3>
              <p className="text-gray-600 leading-relaxed">
                Solo por ser cliente de Easy Access NewTelecom tienes acceso automático a nuestro sistema de referidos
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-5">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comparte tu Link</h3>
              <p className="text-gray-600 leading-relaxed">
                Usa tu enlace único para mostrar nuestros servicios. Tus referidos podrán verificar cobertura y subir sus datos
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-5">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instalación del Servicio</h3>
              <p className="text-gray-600 leading-relaxed">
                La empresa contacta al referido y realiza la instalación del servicio contratado
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-5">
                4
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Recibe tu Comisión</h3>
              <p className="text-gray-600 leading-relaxed">
                Aparece un saldo a tu favor que puedes aplicar en tu próxima factura. El monto depende del servicio contratado
              </p>
            </div>

            {/* Step 5 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-5">
                5
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Gana por 6 Meses</h3>
              <p className="text-gray-600 leading-relaxed">
                Durante los próximos 6 meses, cada vez que tu referido pague, tú recibes comisión
              </p>
            </div>

            {/* Step 6 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-5">
                6
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Disfruta tus Ganancias</h3>
              <p className="text-gray-600 leading-relaxed">
                Usa tu saldo para pagar tu internet o recibe efectivo si supera tu cuenta mensual
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Earnings Section */}
      <section className="py-16 bg-gradient-to-r from-pink-400 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-12">
            💎 Oportunidades de Ganancia
          </h2>
          <div className="bg-white/20 backdrop-blur-lg p-10 rounded-2xl max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-6">Con Este Programa Puedes:</h3>
            <ul className="text-left text-lg space-y-4 max-w-2xl mx-auto">
              <li className="flex items-start">
                <span className="text-yellow-300 text-2xl font-bold mr-4">✓</span>
                <span>Tener tu internet completamente GRATIS cada mes</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 text-2xl font-bold mr-4">✓</span>
                <span>Generar ingresos pasivos durante 6 meses por cada referido</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 text-2xl font-bold mr-4">✓</span>
                <span>Recibir efectivo adicional si tus comisiones superan tu factura</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 text-2xl font-bold mr-4">✓</span>
                <span>Ayudar a tus conocidos a obtener internet de calidad</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 text-2xl font-bold mr-4">✓</span>
                <span>Crear una fuente de ingresos extra sin inversión inicial</span>
              </li>
              <li className="flex items-start">
                <span className="text-yellow-300 text-2xl font-bold mr-4">✓</span>
                <span>Ganar mientras duermes (ingresos recurrentes automáticos)</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Reasons Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12">
            🎯 ¿Por Qué Participar?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Reason 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
              <h4 className="text-xl font-bold text-purple-600 mb-3">✅ Ya Eres Cliente</h4>
              <p className="text-gray-600">
                Conoces la calidad de nuestro servicio, tu recomendación es genuina y valiosa
              </p>
            </div>

            {/* Reason 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
              <h4 className="text-xl font-bold text-purple-600 mb-3">✅ Sistema Ordenado</h4>
              <p className="text-gray-600">
                Ahora tus recomendaciones están organizadas y rastreadas profesionalmente
              </p>
            </div>

            {/* Reason 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
              <h4 className="text-xl font-bold text-purple-600 mb-3">✅ Recompensa Justa</h4>
              <p className="text-gray-600">
                Recibe compensación real por cada recomendación exitosa que hagas
              </p>
            </div>

            {/* Reason 4 */}
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
              <h4 className="text-xl font-bold text-purple-600 mb-3">✅ Proceso Simple</h4>
              <p className="text-gray-600">
                Solo compartes un link, nosotros nos encargamos del resto
              </p>
            </div>

            {/* Reason 5 */}
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
              <h4 className="text-xl font-bold text-purple-600 mb-3">✅ Sin Riesgos</h4>
              <p className="text-gray-600">
                No hay inversión, no hay cuotas, solo ganancias por recomendar
              </p>
            </div>

            {/* Reason 6 */}
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-600">
              <h4 className="text-xl font-bold text-purple-600 mb-3">✅ Transparente</h4>
              <p className="text-gray-600">
                Seguimiento en tiempo real de tus referidos y comisiones en tu dashboard
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Link Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-10">
            🔗 Tu Enlace de Referido
          </h2>
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-purple-600 to-indigo-700 p-12 rounded-3xl shadow-2xl text-white">
            <h3 className="text-3xl font-bold mb-5">Comienza a Ganar Ahora</h3>
            <p className="text-lg mb-8 opacity-90">
              Inicia sesión para obtener tu enlace único personalizado y empieza a compartir con tus conocidos
            </p>
            <div className="bg-white p-10 rounded-xl text-gray-900">
              <p className="text-xl font-medium mb-4">🔐 Ingresa a tu cuenta para ver tu enlace único</p>
              <p className="text-sm text-gray-600">
                Aquí aparecerá tu link personalizado y el formulario de acceso
              </p>
            </div>
          </div>
          <div className="mt-10">
            <Link
              href="/dashboard"
              className="inline-block px-12 py-5 bg-yellow-400 text-gray-900 text-xl font-bold rounded-full hover:scale-105 hover:shadow-2xl transition-all"
            >
              Obtener Mi Enlace Ahora
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-2">© 2025 Easy Access NewTelecom - Todos los derechos reservados</p>
          <p className="mb-2">
            <a href="https://www.easyaccessnet.com" className="text-purple-400 hover:text-purple-300">
              www.easyaccessnet.com
            </a>{' '}
            | Tel: 998 395 0232 | 998 218 0759
          </p>
          <p className="text-sm text-gray-400">
            Autorización IFT/223/UCS/AUT-COM-065/2018
          </p>
        </div>
      </footer>
    </div>
  );
}
