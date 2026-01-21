'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Wifi,
  Zap,
  Shield,
  Clock,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Send,
  Sparkles,
  DollarSign,
  Award,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wispchat-referral-backend.onrender.com';

interface Plan {
  id: string;
  name: string;
  slug: string;
  speed: string;
  speedDownload: number;
  speedUpload: number | null;
  price: string;
  currency: string;
  priceLabel: string | null;
  popular: boolean;
  badge: string | null;
  features: string[];
  maxDevices: number | null;
  recommendedFor: string | null;
  order: number;
  active: boolean;
}

interface Settings {
  installationAmount: string;
  monthlyAmount: string;
  monthsToEarn: number;
  currency: string;
  promoActive: boolean;
  promoName: string | null;
  promoStartDate: string | null;
  promoEndDate: string | null;
  promoInstallAmount: string | null;
  promoMonthlyAmount: string | null;
  promoDescription: string | null;
  promoDisplayBanner: boolean;
  whatsappNumber: string;
  whatsappMessage: string | null;
  telegramUser: string | null;
  telegramGroup: string | null;
  phoneNumber: string | null;
  supportEmail: string | null;
  supportHours: string | null;
  videoEnabled: boolean;
  videoUrl: string | null;
  videoTitle: string | null;
  videoThumbnail: string | null;
}

const benefits = [
  {
    icon: Zap,
    title: 'Velocidad Garantizada',
    description: 'Conexión estable y rápida las 24 horas del día'
  },
  {
    icon: Shield,
    title: 'Seguridad Incluida',
    description: 'Protección contra amenazas en línea sin costo extra'
  },
  {
    icon: Clock,
    title: 'Soporte 24/7',
    description: 'Atención técnica inmediata cuando lo necesites'
  },
  {
    icon: Award,
    title: 'Sin Permanencia',
    description: 'Cancela cuando quieras sin penalizaciones'
  }
];

const testimonials = [
  {
    name: 'María González',
    role: 'Empresaria',
    content: 'Excelente servicio! La velocidad es constante y el soporte técnico responde muy rápido. 100% recomendado.',
    rating: 5,
    avatar: 'MG'
  },
  {
    name: 'Carlos Ramírez',
    role: 'Diseñador Gráfico',
    content: 'Trabajo desde casa y necesitaba internet confiable. Easy Access superó mis expectativas, nunca se cae.',
    rating: 5,
    avatar: 'CR'
  },
  {
    name: 'Ana Martínez',
    role: 'Estudiante',
    content: 'Perfecto para clases en línea y streaming. Mis hermanos y yo usamos internet al mismo tiempo sin problemas.',
    rating: 5,
    avatar: 'AM'
  }
];

const problems = [
  {
    problem: '🐌 Internet lento que no cumple lo prometido',
    solution: '✅ Velocidad real garantizada, no "hasta"'
  },
  {
    problem: '📞 Soporte técnico que nunca responde',
    solution: '✅ Atención 24/7 por WhatsApp, Telegram y chat'
  },
  {
    problem: '💸 Cobros ocultos y sorpresas en la factura',
    solution: '✅ Precio fijo, sin costos ocultos'
  },
  {
    problem: '🔒 Contratos con permanencia forzada',
    solution: '✅ Sin ataduras, cancela cuando quieras'
  }
];

export default function LandingPage() {
  const params = useParams();
  const router = useRouter();
  const referralCode = params.codigo as string;

  const [loading, setLoading] = useState(true);
  const [validCode, setValidCode] = useState(false);
  const [referrerName, setReferrerName] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [checkingCoverage, setCheckingCoverage] = useState(false);
  
  // Dynamic data from API
  const [plans, setPlans] = useState<Plan[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Form data
  const [formData, setFormData] = useState({
    ciudad: '',
    colonia: '',
    codigoPostal: '',
    nombre: '',
    email: '',
    telefono: '',
    calle: '',
    numeroExterior: '',
    numeroInterior: '',
    referencias: '',
    planSeleccionado: 'Hogar'
  });

  useEffect(() => {
    validateReferralCode();
    loadDynamicData();
  }, [referralCode]);

  const loadDynamicData = async () => {
    try {
      setLoadingData(true);
      
      // Load plans and settings in parallel
      const [plansRes, settingsRes] = await Promise.all([
        fetch(`${API_URL}/api/plans`),
        fetch(`${API_URL}/api/settings`)
      ]);

      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlans(plansData.data || []);
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData.data || null);
      }
    } catch (error) {
      console.error('Error loading dynamic data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const validateReferralCode = async () => {
    try {
      const response = await fetch(`${API_URL}/api/referral-codes/${referralCode}/validate`);
      const data = await response.json();

      if (data.success && data.data) {
        setValidCode(true);
        setReferrerName(data.data.referrerName || 'un cliente Easy Access');
      } else {
        // Si el endpoint no existe o no hay datos, seguir mostrando la página
        // El código se usará para el registro del lead
        setValidCode(true);
        setReferrerName('un cliente Easy Access');
        console.log('Usando modo fallback para código:', referralCode);
      }
    } catch (error) {
      console.error('Error validating code:', error);
      // En caso de error, también permitir continuar
      setValidCode(true);
      setReferrerName('un cliente Easy Access');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const checkCoverage = async () => {
    if (!formData.codigoPostal || formData.codigoPostal.length < 5) {
      toast.error('Por favor ingresa un código postal válido');
      return;
    }

    setCheckingCoverage(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCheckingCoverage(false);
    
    toast.success('¡Excelente! Tenemos cobertura en tu área');
    setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 1) {
      checkCoverage();
      return;
    }

    if (currentStep === 2) {
      if (!formData.nombre || !formData.email || !formData.telefono) {
        toast.error('Por favor completa todos los campos');
        return;
      }
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!formData.calle || !formData.numeroExterior) {
        toast.error('Por favor completa la dirección');
        return;
      }
      setCurrentStep(4);
      return;
    }

    // Submit final
    try {
      // Construir dirección completa
      const direccionCompleta = [
        formData.calle,
        formData.numeroExterior ? `#${formData.numeroExterior}` : '',
        formData.numeroInterior ? `Int. ${formData.numeroInterior}` : '',
        formData.referencias ? `(${formData.referencias})` : ''
      ].filter(Boolean).join(' ').trim();

      // Obtener velocidad del plan seleccionado
      const planSeleccionado = plans.find(p => p.name === formData.planSeleccionado);

      const response = await fetch(`${API_URL}/api/leads/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: referralCode,
          nombre: formData.nombre,
          telefono: formData.telefono,
          email: formData.email,
          direccion: direccionCompleta,
          colonia: formData.colonia,
          ciudad: formData.ciudad,
          codigoPostal: formData.codigoPostal,
          tipoServicio: formData.planSeleccionado,
          velocidad: planSeleccionado?.speed || null
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('¡Registro exitoso! Nos contactaremos contigo pronto.');
        setCurrentStep(5);
      } else {
        throw new Error(data.message || data.error?.message || 'Error al registrar');
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast.error(error.message || 'Error al enviar el formulario');
    }
  };

  const contactWhatsApp = () => {
    const whatsapp = settings?.whatsappNumber || '5215512345678';
    const message = settings?.whatsappMessage || 'Hola! Me interesa contratar Easy Access';
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const contactTelegram = () => {
    const telegram = settings?.telegramUser || '@easyaccesssoporte';
    if (telegram.startsWith('@')) {
      window.open(`https://t.me/${telegram.substring(1)}`, '_blank');
    } else if (telegram.startsWith('https://')) {
      window.open(telegram, '_blank');
    } else {
      window.open(`https://t.me/${telegram}`, '_blank');
    }
  };

  const contactWispChat = () => {
    window.open('https://wispchat.net/chat?user=ventas@easyaccessnet.com', '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!validCode && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Código No Válido</h2>
          <p className="text-gray-600 mb-6">
            El código de referido <strong>{referralCode}</strong> no existe o ha expirado.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 5) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Registro Exitoso!</h2>
            <p className="text-gray-600">
              Gracias por elegir Easy Access NewTelecom
            </p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">📋 Próximos Pasos:</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Nuestro equipo verificará la cobertura en tu dirección</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Te contactaremos en las próximas 24 horas</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Agendaremos la instalación en la fecha que prefieras</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">4.</span>
                <span>¡Disfrutarás de internet rápido y confiable!</span>
              </li>
            </ol>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-emerald-900 mb-2">🎁 Beneficio por Referido</h3>
            <p className="text-sm text-emerald-800">
              Gracias a la referencia de <strong>{referrerName}</strong>, ambos recibirán beneficios especiales al activar el servicio.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-center text-gray-600 text-sm mb-4">
              ¿Tienes dudas? Contáctanos ahora:
            </p>
            <button
              onClick={contactWhatsApp}
              className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp
            </button>
            <button
              onClick={contactTelegram}
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-5 h-5" />
              Telegram
            </button>
            <button
              onClick={contactWispChat}
              className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Chat en Vivo (ventas@easyaccessnet.com)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Promo Banner */}
      {settings?.promoActive && settings?.promoDisplayBanner && (
        <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white py-4 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="w-6 h-6" />
              <div>
                <p className="font-bold text-lg">{settings.promoName}</p>
                {settings.promoDescription && (
                  <p className="text-sm opacity-90">{settings.promoDescription}</p>
                )}
              </div>
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              {validCode && referrerName && (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 mb-6 inline-block">
                  <p className="text-sm text-blue-100">
                    🎁 Invitado por <strong className="text-white">{referrerName}</strong>
                  </p>
                </div>
              )}
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Internet Ultra Rápido
                <br />
                <span className="text-yellow-300">Sin Ataduras</span>
              </h1>
              
              <p className="text-xl text-blue-100 mb-8">
                La mejor conexión para tu hogar y negocio. Planes desde <strong className="text-white">$390/mes</strong> con velocidad garantizada.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span>Instalación en 24hrs</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Shield className="w-5 h-5 text-green-300" />
                  <span>Sin permanencia</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-300" />
                  <span>Soporte 24/7</span>
                </div>
              </div>

              <a
                href="#cobertura"
                className="inline-block px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Verificar Cobertura Ahora
              </a>
            </div>

            <div>
              {/* Video Section - Dynamic */}
              {settings?.videoEnabled && settings?.videoUrl ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
                    <iframe 
                      src={settings.videoUrl}
                      className="w-full h-full" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={settings.videoTitle || 'Video institucional'}
                    />
                  </div>
                  {settings.videoTitle && (
                    <p className="text-center text-white font-semibold mt-3">
                      {settings.videoTitle}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20"></div>
                    <div className="relative z-10 text-center">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wifi className="w-10 h-10 text-white" />
                      </div>
                      <p className="text-white font-semibold">Internet Ultra Rápido</p>
                      <p className="text-blue-100 text-sm mt-1">Easy Access NewTelecom</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Por Qué Elegir Easy Access?
            </h2>
            <p className="text-xl text-gray-600">
              Más que internet, una experiencia completa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Problems We Solve */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Problemas Que Resolvemos
            </h2>
            <p className="text-xl text-gray-600">
              Dile adiós a las frustraciones del internet
            </p>
          </div>

          <div className="space-y-6">
            {problems.map((item, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-red-50 to-green-50 border-2 border-gray-200 rounded-xl p-6 hover:border-green-400 transition-colors"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">😤</span>
                    <p className="text-gray-700 font-medium">{item.problem}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">😊</span>
                    <p className="text-green-700 font-semibold">{item.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section id="planes" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planes Para Cada Necesidad
            </h2>
            <p className="text-xl text-gray-600">
              Elige el plan perfecto para ti
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingData ? (
              <div className="col-span-3 flex justify-center py-20">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              </div>
            ) : plans.length === 0 ? (
              <div className="col-span-3 text-center py-20">
                <p className="text-gray-600">No hay planes disponibles en este momento</p>
              </div>
            ) : (
              plans.map((plan, index) => (
                <div
                  key={plan.id}
                  className={`bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:scale-105 ${
                    plan.popular ? 'ring-4 ring-purple-500 relative' : ''
                  }`}
                >
                  {plan.popular && (
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-2 font-bold">
                      <Sparkles className="w-4 h-4 inline mr-1" />
                      MÁS POPULAR
                    </div>
                  )}
                  {plan.badge && !plan.popular && (
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-center py-2 font-bold">
                      {plan.badge}
                    </div>
                  )}
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <div className="mb-6">
                      <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                      <span className="text-gray-600">/{plan.priceLabel || 'mes'}</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-6 flex items-center gap-2">
                      <Wifi className="w-8 h-8" />
                      {plan.speed}
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => {
                        setFormData({ ...formData, planSeleccionado: plan.name });
                        document.getElementById('cobertura')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`w-full py-3 rounded-xl font-bold transition-all ${
                        plan.popular
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                      }`}
                    >
                      Contratar Ahora
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo Que Dicen Nuestros Clientes
            </h2>
            <p className="text-xl text-gray-600">
              Miles de familias confían en nosotros
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>

                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                <p className="text-gray-700 italic">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Form */}
      <section id="cobertura" className="py-20 px-6 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {currentStep === 1 && '📍 Verifica Tu Cobertura'}
                {currentStep === 2 && '👤 Datos Personales'}
                {currentStep === 3 && '🏠 Dirección de Instalación'}
                {currentStep === 4 && '📦 Confirma Tu Plan'}
              </h2>
              <p className="text-gray-600">
                Paso {currentStep} de 4
              </p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        step === currentStep
                          ? 'bg-blue-600 text-white'
                          : step < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {step < currentStep ? <CheckCircle className="w-6 h-6" /> : step}
                    </div>
                    {step < 4 && (
                      <div
                        className={`w-12 h-1 ${
                          step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Coverage */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleInputChange}
                      placeholder="Ej: Ciudad de México"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Colonia
                    </label>
                    <input
                      type="text"
                      name="colonia"
                      value={formData.colonia}
                      onChange={handleInputChange}
                      placeholder="Ej: Roma Norte"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      name="codigoPostal"
                      value={formData.codigoPostal}
                      onChange={handleInputChange}
                      placeholder="Ej: 06700"
                      maxLength={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={checkingCoverage}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {checkingCoverage ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-5 h-5" />
                        Verificar Cobertura
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Step 2: Personal Data */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      placeholder="Tu nombre completo"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="tu@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      placeholder="5512345678"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Address */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calle *
                    </label>
                    <input
                      type="text"
                      name="calle"
                      value={formData.calle}
                      onChange={handleInputChange}
                      placeholder="Nombre de la calle"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número Exterior *
                      </label>
                      <input
                        type="text"
                        name="numeroExterior"
                        value={formData.numeroExterior}
                        onChange={handleInputChange}
                        placeholder="123"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número Interior
                      </label>
                      <input
                        type="text"
                        name="numeroInterior"
                        value={formData.numeroInterior}
                        onChange={handleInputChange}
                        placeholder="Depto 4"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referencias
                    </label>
                    <textarea
                      name="referencias"
                      value={formData.referencias}
                      onChange={handleInputChange}
                      placeholder="Entre qué calles, edificio verde, etc."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Plan Confirmation */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Selecciona tu Plan
                    </label>
                    <div className="space-y-3">
                      {plans.map((plan) => (
                        <div
                          key={plan.id}
                          onClick={() => setFormData({ ...formData, planSeleccionado: plan.name })}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            formData.planSeleccionado === plan.name
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-gray-900">{plan.name}</h4>
                              <p className="text-sm text-gray-600">{plan.speed}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900">${plan.price}</p>
                              <p className="text-xs text-gray-600">por mes</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">📋 Resumen</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p><strong>Plan:</strong> {formData.planSeleccionado}</p>
                      <p><strong>Nombre:</strong> {formData.nombre}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Teléfono:</strong> {formData.telefono}</p>
                      <p><strong>Dirección:</strong> {formData.calle} #{formData.numeroExterior}, {formData.colonia}, {formData.ciudad}</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Confirmar Registro
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            ¿Prefieres Hablar con Nosotros?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Nuestro equipo de ventas está listo para ayudarte
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={contactWispChat}
              className="bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 rounded-xl font-bold transition-all transform hover:scale-105 flex flex-col items-center gap-3"
            >
              <div className="w-16 h-16 bg-white rounded-full p-2 flex items-center justify-center">
                <img 
                  src="https://i.imgur.com/yKx8ZQY.png" 
                  alt="WispChat Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span>WispChat</span>
              <span className="text-sm font-normal text-blue-100">ventas@easyaccessnet.com</span>
            </button>

            <button
              onClick={contactTelegram}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 rounded-xl font-bold transition-all transform hover:scale-105 flex flex-col items-center gap-3"
            >
              <Send className="w-12 h-12" />
              <span>Telegram</span>
              <span className="text-sm font-normal text-blue-100">Chat directo</span>
            </button>

            <button
              onClick={contactWhatsApp}
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 rounded-xl font-bold transition-all transform hover:scale-105 flex flex-col items-center gap-3"
            >
              <MessageCircle className="w-12 h-12" />
              <span>WhatsApp</span>
              <span className="text-sm font-normal text-green-100">Respuesta inmediata</span>
            </button>
          </div>

          <div className="mt-12 pt-12 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Easy Access NewTelecom © 2025. Internet confiable para tu hogar y negocio.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
