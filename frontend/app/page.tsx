import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Easy Access NewTelecom
            </div>
            <Link
              href="/dashboard"
              className="px-6 py-2.5 bg-white text-purple-700 rounded-full font-bold hover:scale-110 hover:shadow-2xl transition-all duration-300 shadow-lg"
            >
              Ingresar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Impactante */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-5 animate-pulse"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          <div className="inline-block mb-6 text-7xl md:text-9xl animate-bounce">
            🎉
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight drop-shadow-2xl">
            Recomienda y Gana
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 text-transparent bg-clip-text">
              Internet Gratis
            </span>
          </h1>
          <p className="text-2xl md:text-3xl lg:text-4xl mb-4 font-bold opacity-95 drop-shadow-lg">
            El programa de referidos que te recompensa por hacer
          </p>
          <p className="text-xl md:text-2xl lg:text-3xl mb-8 font-semibold opacity-90">
            lo que ya haces: ¡Recomendar nuestros servicios!
          </p>
          
          <div className="max-w-5xl mx-auto mb-12">
            <p className="text-lg md:text-xl lg:text-2xl leading-relaxed">
              Somos la empresa que te ofrece la posibilidad de tener tu servicio de internet residencial y comercial de alta calidad{' '}
              <span className="font-black text-yellow-300 text-2xl md:text-3xl">sin pagar tu cuota mensual</span>. 
              Ahora queremos recompensarte de forma ordenada y sistemática por tus buenos comentarios y recomendaciones.
            </p>
          </div>
          
          <a
            href="#como-funciona"
            className="inline-block px-16 py-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-gray-900 text-2xl md:text-3xl font-black rounded-full hover:scale-110 hover:shadow-2xl transition-all duration-300 shadow-2xl transform hover:-translate-y-2"
          >
            Comenzar Ahora
          </a>
        </div>
      </section>

      {/* Benefits Section - Diseño Moderno con Cards */}
      <section className="py-20 md:py-32 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-200 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-200 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-6xl md:text-7xl mb-6 inline-block">🌟</span>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
              Beneficios Exclusivos para Ti
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {/* Benefit 1 */}
            <div className="group bg-gradient-to-br from-yellow-50 to-orange-50 p-10 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-4 transition-all duration-300 border-4 border-yellow-200 hover:border-yellow-400">
              <div className="text-7xl md:text-8xl mb-6 transform group-hover:scale-125 transition-transform duration-300">💰</div>
              <h3 className="text-2xl md:text-3xl font-black text-yellow-800 mb-4">
                Comisión por Instalación
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                Recibe un saldo a favor inmediatamente después de que tu referido instale el servicio
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="group bg-gradient-to-br from-red-50 to-pink-50 p-10 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-4 transition-all duration-300 border-4 border-red-200 hover:border-red-400">
              <div className="text-7xl md:text-8xl mb-6 transform group-hover:scale-125 transition-transform duration-300">📅</div>
              <h3 className="text-2xl md:text-3xl font-black text-red-800 mb-4">
                Ingresos Recurrentes
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                Gana comisiones durante 6 meses consecutivos mientras tu referido pague su servicio
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 p-10 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-4 transition-all duration-300 border-4 border-green-200 hover:border-green-400">
              <div className="text-7xl md:text-8xl mb-6 transform group-hover:scale-125 transition-transform duration-300">🎁</div>
              <h3 className="text-2xl md:text-3xl font-black text-green-800 mb-4">
                Internet Gratis
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                Aplica tu saldo directamente a tu factura mensual de internet
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="group bg-gradient-to-br from-blue-50 to-cyan-50 p-10 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-4 transition-all duration-300 border-4 border-blue-200 hover:border-blue-400">
              <div className="text-7xl md:text-8xl mb-6 transform group-hover:scale-125 transition-transform duration-300">💵</div>
              <h3 className="text-2xl md:text-3xl font-black text-blue-800 mb-4">
                Efectivo Extra
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                Si tus comisiones superan tu cuenta, recibe el excedente en efectivo
              </p>
            </div>

            {/* Benefit 5 */}
            <div className="group bg-gradient-to-br from-purple-50 to-indigo-50 p-10 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-4 transition-all duration-300 border-4 border-purple-200 hover:border-purple-400">
              <div className="text-7xl md:text-8xl mb-6 transform group-hover:scale-125 transition-transform duration-300">🚀</div>
              <h3 className="text-2xl md:text-3xl font-black text-purple-800 mb-4">
                Sin Límites
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                Recomienda a todos los que quieras, no hay límite de referidos
              </p>
            </div>

            {/* Benefit 6 */}
            <div className="group bg-gradient-to-br from-pink-50 to-rose-50 p-10 rounded-3xl shadow-xl hover:shadow-2xl hover:-translate-y-4 transition-all duration-300 border-4 border-pink-200 hover:border-pink-400">
              <div className="text-7xl md:text-8xl mb-6 transform group-hover:scale-125 transition-transform duration-300">⚡</div>
              <h3 className="text-2xl md:text-3xl font-black text-pink-800 mb-4">
                Automático
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed font-medium">
                Todo el proceso es automático, tú solo compartes tu link único
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - Con números grandes */}
      <section id="como-funciona" className="py-20 md:py-32 bg-gradient-to-br from-gray-50 via-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
              ¿Cómo Funciona el Sistema?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { num: '1', title: 'Accede al Programa', desc: 'Solo por ser cliente de Easy Access NewTelecom tienes acceso automático a nuestro sistema de referidos', color: 'from-blue-500 to-indigo-600' },
              { num: '2', title: 'Comparte tu Link', desc: 'Usa tu enlace único para mostrar nuestros servicios. Tus referidos podrán verificar cobertura y subir sus datos', color: 'from-purple-500 to-pink-600' },
              { num: '3', title: 'Instalación del Servicio', desc: 'La empresa contacta al referido y realiza la instalación del servicio contratado', color: 'from-pink-500 to-red-600' },
              { num: '4', title: 'Recibe tu Comisión', desc: 'Aparece un saldo a tu favor que puedes aplicar en tu próxima factura. El monto depende del servicio contratado', color: 'from-orange-500 to-yellow-600' },
              { num: '5', title: 'Gana por 6 Meses', desc: 'Durante los próximos 6 meses, cada vez que tu referido pague, tú recibes comisión', color: 'from-green-500 to-emerald-600' },
              { num: '6', title: 'Disfruta tus Ganancias', desc: 'Usa tu saldo para pagar tu internet o recibe efectivo si supera tu cuenta mensual', color: 'from-teal-500 to-cyan-600' },
            ].map((step) => (
              <div key={step.num} className="group text-center hover:-translate-y-2 transition-all duration-300">
                <div className={`w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br ${step.color} text-white rounded-full flex items-center justify-center text-5xl md:text-6xl font-black mx-auto mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                  {step.num}
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed font-medium">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Section - Con gradiente rosa/rojo impactante */}
      <section className="relative py-20 md:py-32 bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full filter blur-3xl opacity-10"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-300 rounded-full filter blur-3xl opacity-10"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-7xl md:text-8xl mb-8 inline-block animate-pulse">💎</span>
          <h2 className="text-5xl md:text-6xl font-black mb-12 drop-shadow-2xl">
            Oportunidades de Ganancia
          </h2>
          
          <div className="bg-white/25 backdrop-blur-xl p-10 md:p-16 rounded-3xl max-w-5xl mx-auto shadow-2xl border-4 border-white/30">
            <h3 className="text-3xl md:text-4xl font-black mb-10 drop-shadow-lg">
              Con Este Programa Puedes:
            </h3>
            <ul className="text-left text-xl md:text-2xl space-y-6 max-w-3xl mx-auto">
              {[
                'Tener tu internet completamente GRATIS cada mes',
                'Generar ingresos pasivos durante 6 meses por cada referido',
                'Recibir efectivo adicional si tus comisiones superan tu factura',
                'Ayudar a tus conocidos a obtener internet de calidad',
                'Crear una fuente de ingresos extra sin inversión inicial',
                'Ganar mientras duermes (ingresos recurrentes automáticos)',
              ].map((item, i) => (
                <li key={i} className="flex items-start group hover:scale-105 transition-transform duration-200">
                  <span className="text-yellow-300 text-4xl font-black mr-5 group-hover:scale-125 transition-transform">✓</span>
                  <span className="font-bold drop-shadow-lg">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Reasons Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-6xl md:text-7xl mb-6 inline-block">🎯</span>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
              ¿Por Qué Participar?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: '✅ Ya Eres Cliente', desc: 'Conoces la calidad de nuestro servicio, tu recomendación es genuina y valiosa', color: 'border-l-blue-500' },
              { title: '✅ Sistema Ordenado', desc: 'Ahora tus recomendaciones están organizadas y rastreadas profesionalmente', color: 'border-l-purple-500' },
              { title: '✅ Recompensa Justa', desc: 'Recibe compensación real por cada recomendación exitosa que hagas', color: 'border-l-pink-500' },
              { title: '✅ Proceso Simple', desc: 'Solo compartes un link, nosotros nos encargamos del resto', color: 'border-l-green-500' },
              { title: '✅ Sin Riesgos', desc: 'No hay inversión, no hay cuotas, solo ganancias por recomendar', color: 'border-l-yellow-500' },
              { title: '✅ Transparente', desc: 'Seguimiento en tiempo real de tus referidos y comisiones en tu dashboard', color: 'border-l-red-500' },
            ].map((reason, i) => (
              <div key={i} className={`bg-white p-8 rounded-2xl shadow-lg border-l-8 ${reason.color} hover:-translate-y-2 hover:shadow-2xl transition-all duration-300`}>
                <h4 className="text-2xl font-black text-gray-900 mb-4">
                  {reason.title}
                </h4>
                <p className="text-lg text-gray-700 font-medium leading-relaxed">
                  {reason.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Link Section - Llamativa */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-white via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-6xl md:text-7xl mb-8 inline-block">🔗</span>
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-12">
            Tu Enlace de Referido
          </h2>
          
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-1 rounded-3xl shadow-2xl">
            <div className="bg-white p-12 md:p-16 rounded-3xl">
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                Comienza a Ganar Ahora
              </h3>
              <p className="text-xl md:text-2xl text-gray-700 mb-8 font-semibold">
                Inicia sesión para obtener tu enlace único personalizado y empieza a compartir con tus conocidos
              </p>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-10 rounded-2xl border-4 border-purple-200 mb-8">
                <p className="text-2xl font-black text-purple-900 mb-3">🔐 Ingresa a tu cuenta</p>
                <p className="text-lg text-gray-700 font-medium">
                  para ver tu enlace único
                </p>
                <p className="text-base text-gray-600 mt-4">
                  Aquí aparecerá tu link personalizado y el formulario de acceso
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-block px-16 py-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white text-2xl md:text-3xl font-black rounded-full hover:scale-110 hover:shadow-2xl transition-all duration-300 shadow-xl transform hover:-translate-y-2"
              >
                Obtener Mi Enlace Ahora
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg md:text-xl mb-3 font-semibold">
            © 2025 Easy Access NewTelecom - Todos los derechos reservados
          </p>
          <p className="text-lg md:text-xl mb-3">
            <a href="https://www.easyaccessnet.com" className="text-purple-400 hover:text-purple-300 font-bold underline">
              www.easyaccessnet.com
            </a>
            {' | '}
            <span className="font-bold">Tel: 998 395 0232 | 998 218 0759</span>
          </p>
          <p className="text-base text-gray-400 mt-4">
            Autorización IFT/223/UCS/AUT-COM-065/2018
          </p>
        </div>
      </footer>
    </div>
  );
}
