'use client';

import { useState, use } from 'react';
import Link from 'next/link';

interface LeadFormData {
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  colonia: string;
  ciudad: string;
  codigoPostal: string;
  servicioInteres: string;
  velocidadInteres: string;
  comentarios: string;
}

export default function LandingPage({ params }: { params: Promise<{ codigo: string }> }) {
  const resolvedParams = use(params);
  const [step, setStep] = useState<'cobertura' | 'formulario' | 'documentos' | 'confirmacion'>('cobertura');
  const [formData, setFormData] = useState<LeadFormData>({
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    colonia: '',
    ciudad: '',
    codigoPostal: '',
    servicioInteres: 'residencial',
    velocidadInteres: '',
    comentarios: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCoberturaSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const nombre = (form.elements.namedItem('nombre') as HTMLInputElement).value;
    const telefono = (form.elements.namedItem('telefono') as HTMLInputElement).value;
    
    if (!nombre || !telefono) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    setFormData(prev => ({ ...prev, nombre, telefono }));
    setStep('formulario');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://wispchat-referral-backend.onrender.com';
      const response = await fetch(`${apiUrl}/api/leads/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          codigoReferido: resolvedParams.codigo,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al registrar el lead');
      }

      setStep('confirmacion');
    } catch (err) {
      setError('Hubo un error al enviar tu información. Por favor intenta nuevamente.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">Easy Access NewTelecom</div>
            <Link
              href="/"
              className="px-6 py-2 bg-white text-purple-600 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              Inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            🎉 ¡Te han recomendado con nosotros!
          </h1>
          <p className="text-xl md:text-2xl">
            Internet de Alta Velocidad - Instalación Profesional - Soporte 24/7
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className={`flex-1 text-center ${step === 'cobertura' ? 'text-purple-600 font-bold' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${step === 'cobertura' ? 'bg-purple-600 text-white' : 'bg-gray-300'}`}>
                1
              </div>
              <span className="text-sm">Cobertura</span>
            </div>
            <div className="flex-1 border-t-2 border-gray-300 mx-2 mt-[-20px]"></div>
            <div className={`flex-1 text-center ${step === 'formulario' ? 'text-purple-600 font-bold' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${step === 'formulario' ? 'bg-purple-600 text-white' : 'bg-gray-300'}`}>
                2
              </div>
              <span className="text-sm">Tus Datos</span>
            </div>
            <div className="flex-1 border-t-2 border-gray-300 mx-2 mt-[-20px]"></div>
            <div className={`flex-1 text-center ${step === 'confirmacion' ? 'text-purple-600 font-bold' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${step === 'confirmacion' ? 'bg-purple-600 text-white' : 'bg-gray-300'}`}>
                ✓
              </div>
              <span className="text-sm">Confirmación</span>
            </div>
          </div>
        </div>

        {/* Step 1: Cobertura */}
        {step === 'cobertura' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">📍</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Verificación de Cobertura
              </h2>
              <p className="text-gray-600 text-lg">
                Primero necesitamos saber tu nombre y teléfono para verificar si tenemos cobertura en tu zona
              </p>
            </div>

            <form onSubmit={handleCoberturaSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Tu nombre completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono WhatsApp *
                </label>
                <input
                  type="tel"
                  name="telefono"
                  required
                  pattern="[0-9]{10}"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="10 dígitos sin espacios"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Lo utilizaremos para enviarte información por WhatsApp
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:scale-105 transition-transform"
              >
                Continuar →
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Formulario Completo */}
        {step === 'formulario' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Completa tu Información
              </h2>
              <p className="text-gray-600 text-lg">
                Necesitamos algunos datos más para preparar tu instalación
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ciudad}
                    onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Mérida, Yucatán"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección Completa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="Calle, número, referencias"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colonia/Fraccionamiento *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.colonia}
                    onChange={(e) => setFormData({...formData, colonia: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="Nombre de tu colonia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código Postal *
                  </label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{5}"
                    value={formData.codigoPostal}
                    onChange={(e) => setFormData({...formData, codigoPostal: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    placeholder="5 dígitos"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Servicio *
                </label>
                <select
                  required
                  value={formData.servicioInteres}
                  onChange={(e) => setFormData({...formData, servicioInteres: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="residencial">Residencial</option>
                  <option value="comercial">Comercial</option>
                  <option value="empresarial">Empresarial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Velocidad de Interés
                </label>
                <select
                  value={formData.velocidadInteres}
                  onChange={(e) => setFormData({...formData, velocidadInteres: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="20mbps">20 Mbps</option>
                  <option value="50mbps">50 Mbps</option>
                  <option value="100mbps">100 Mbps</option>
                  <option value="200mbps">200 Mbps</option>
                  <option value="500mbps">500 Mbps</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comentarios Adicionales
                </label>
                <textarea
                  rows={4}
                  value={formData.comentarios}
                  onChange={(e) => setFormData({...formData, comentarios: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  placeholder="¿Algo más que debamos saber?"
                ></textarea>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('cobertura')}
                  className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-300 transition"
                >
                  ← Atrás
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Solicitud →'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Confirmación */}
        {step === 'confirmacion' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¡Solicitud Recibida!
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Gracias por tu interés, <strong>{formData.nombre}</strong>
            </p>
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-8">
              <h3 className="text-xl font-bold text-purple-900 mb-3">¿Qué sigue?</h3>
              <ul className="text-left space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">1.</span>
                  <span>Un representante revisará tu solicitud en las próximas 24 horas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">2.</span>
                  <span>Te contactaremos por WhatsApp al <strong>{formData.telefono}</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">3.</span>
                  <span>Verificaremos la cobertura en tu zona</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 font-bold mr-3">4.</span>
                  <span>Agendaremos tu instalación si hay cobertura disponible</span>
                </li>
              </ul>
            </div>
            <Link
              href="/"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg font-semibold text-lg hover:scale-105 transition-transform"
            >
              Volver al Inicio
            </Link>
          </div>
        )}
      </div>

      {/* Info Section */}
      <section className="bg-gradient-to-r from-purple-50 to-indigo-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            ¿Por qué elegir Easy Access NewTelecom?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h4 className="font-bold text-gray-900 mb-2">Alta Velocidad</h4>
              <p className="text-sm text-gray-600">Internet simétrico de fibra óptica</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl mb-3">🛠️</div>
              <h4 className="font-bold text-gray-900 mb-2">Soporte 24/7</h4>
              <p className="text-sm text-gray-600">Asistencia técnica cuando la necesites</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="text-4xl mb-3">💰</div>
              <h4 className="font-bold text-gray-900 mb-2">Mejor Precio</h4>
              <p className="text-sm text-gray-600">Planes accesibles sin compromisos</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
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
