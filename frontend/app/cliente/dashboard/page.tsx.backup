'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Gift, 
  Copy, 
  Share2, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Loader2,
  CheckCircle,
  ExternalLink,
  LogOut
} from 'lucide-react';

interface ReferralInfo {
  id: string;
  wispChatClientId: string;
  nombre: string;
  email: string;
  referralCode: string;
  active: boolean;
  totalEarned: number;
  totalActive: number;
  totalApplied: number;
  referrals: Array<{
    id: string;
    nombre: string;
    email: string;
    status: string;
    installedAt: string;
  }>;
  commissions: Array<{
    id: string;
    type: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
}

export default function ClienteDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReferralInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/');
        return;
      }

      const API_URL = 'https://wispchat-backend.onrender.com/api/v1';
      const response = await fetch(`${API_URL}/referrals/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-tenant-domain': 'wispchat.net'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
        setShareUrl(`https://referidos.wispchat.net/registro/${result.data.referralCode}`);
      } else {
        throw new Error('No se pudo cargar la información');
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Únete a EasyAccess',
          text: `¡Obtén internet de alta velocidad con mi código de referido! Usa mi código: ${data?.referralCode}`,
          url: shareUrl
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      copyToClipboard();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    window.close();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando tu información...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center">
          <p className="text-gray-600 mb-4">No se pudo cargar tu información</p>
          <button
            onClick={() => router.push('/bienvenida')}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Volver a intentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Hola, {data.nombre}! 👋
                </h1>
                <p className="text-gray-600">Tu dashboard de referidos</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Cerrar</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-gray-600 font-medium">Referidos Activos</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">{data.totalActive}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-gray-600 font-medium">Ganado Total</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">${data.totalEarned.toFixed(2)}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-gray-600 font-medium">Por Aplicar</h3>
            </div>
            <p className="text-3xl font-bold text-gray-800">${data.totalApplied.toFixed(2)}</p>
          </div>
        </div>

        {/* Referral Code Card */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Tu Código de Referido</h2>
            <p className="text-green-100">Comparte este código con tus amigos y conocidos</p>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
              <p className="text-5xl font-bold tracking-wider">{data.referralCode}</p>
            </div>
            <div className="bg-white/30 rounded-lg p-3 mb-4">
              <p className="text-sm break-all text-center">{shareUrl}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    ¡Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copiar Enlace
                  </>
                )}
              </button>
              <button
                onClick={shareLink}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg font-semibold transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Compartir
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-green-100 mb-1">Instalación</p>
              <p className="text-xl font-bold">$500</p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-green-100 mb-1">Mensual (6 meses)</p>
              <p className="text-xl font-bold">$50/mes</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Tus Referidos</h2>
          
          {data.referrals.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">Aún no tienes referidos</p>
              <p className="text-sm text-gray-400">Comparte tu código para empezar a ganar</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800">{referral.nombre}</p>
                    <p className="text-sm text-gray-600">{referral.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      referral.status === 'active' ? 'bg-green-100 text-green-700' :
                      referral.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {referral.status === 'active' ? 'Activo' :
                       referral.status === 'pending' ? 'Pendiente' : referral.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(referral.installedAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Commissions History */}
        {data.commissions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Historial de Comisiones</h2>
            <div className="space-y-3">
              {data.commissions.map((commission) => (
                <div key={commission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {commission.type === 'installation' ? '💰 Instalación' : '📅 Mensual'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(commission.createdAt).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">${commission.amount.toFixed(2)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      commission.status === 'paid' ? 'bg-green-100 text-green-700' :
                      commission.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {commission.status === 'paid' ? 'Pagado' :
                       commission.status === 'pending' ? 'Pendiente' : 'Aprobado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
