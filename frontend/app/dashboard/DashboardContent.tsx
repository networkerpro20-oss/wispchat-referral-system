'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Copy, 
  Share2, 
  QrCode, 
  Users, 
  DollarSign, 
  TrendingUp, 
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  ExternalLink,
  Gift
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wispchat-referral-backend.onrender.com/api';

interface ClientData {
  wispChatClientId: string;
  nombre: string;
  email: string;
  referralCode: string;
  shareUrl: string;
}

interface ClientStats {
  totalReferrals: number;
  activeReferrals: number;
  totalCommissions: number;
  totalEarned: number;
}

interface CommissionSummary {
  earned: number;
  active: number;
  applied: number;
  cancelled: number;
  totalAvailable: number;
  totalPending: number;
}

interface Referral {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  status: 'LEAD' | 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  convertedAt: string | null;
}

interface Commission {
  id: string;
  type: 'INSTALLATION' | 'MONTHLY';
  amount: number;
  status: 'EARNED' | 'ACTIVE' | 'APPLIED' | 'CANCELLED';
  statusReason: string | null;
  month: number;
  year: number;
  generatedAt: string;
  activatedAt: string | null;
  appliedAt: string | null;
}

export default function ClientDashboard() {
  const searchParams = useSearchParams();
  const wispHubId = searchParams.get('id') || 'WISPHUB_01'; // Default para testing

  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<ClientData | null>(null);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [summary, setSummary] = useState<CommissionSummary | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchClientData();
  }, [wispHubId]);

  const fetchClientData = async () => {
    try {
      setLoading(true);

      const [summaryRes, referralsRes, commissionsRes] = await Promise.all([
        fetch(`${API_URL}/clients/${wispHubId}/summary`),
        fetch(`${API_URL}/clients/${wispHubId}/referrals`),
        fetch(`${API_URL}/clients/${wispHubId}/commissions`),
      ]);

      const [summaryData, referralsData, commissionsData] = await Promise.all([
        summaryRes.json(),
        referralsRes.json(),
        commissionsRes.json(),
      ]);

      if (summaryData.success) {
        setClient(summaryData.data.client);
        setStats(summaryData.data.stats);
        setSummary(summaryData.data.summary);
      }

      if (referralsData.success) {
        setReferrals(referralsData.data);
      }

      if (commissionsData.success) {
        setCommissions(commissionsData.data);
      }
    } catch (error: any) {
      console.error('Error fetching client data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado!`);
  };

  const shareViaWhatsApp = () => {
    if (!client) return;
    const message = `¡Únete a Easy Access con mi código de referido ${client.referralCode} y obtén beneficios! ${client.shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareViaEmail = () => {
    if (!client) return;
    const subject = 'Te invito a Easy Access';
    const body = `Hola!\n\nTe invito a unirte a Easy Access NewTelecom. Usa mi código de referido ${client.referralCode} para obtener beneficios especiales.\n\nRegístrate aquí: ${client.shareUrl}\n\n¡Nos vemos!`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'EARNED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'APPLIED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      case 'LEAD': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-4 h-4" />;
      case 'EARNED': return <Clock className="w-4 h-4" />;
      case 'APPLIED': return <CheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Disponible';
      case 'EARNED': return 'Pendiente';
      case 'APPLIED': return 'Cobrada';
      case 'CANCELLED': return 'Cancelada';
      case 'LEAD': return 'Prospecto';
      case 'INACTIVE': return 'Inactivo';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando tu panel...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cliente no encontrado</h2>
          <p className="text-gray-600 mb-6">
            No se encontró información para este cliente.
          </p>
          <p className="text-sm text-gray-500">
            ID buscado: {wispHubId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                ¡Hola, {client.nombre}! 👋
              </h1>
              <p className="text-blue-100 mb-6">
                Bienvenido a tu panel de referidos Easy Access
              </p>
              
              {/* Referral Code Card */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <p className="text-sm text-blue-100 mb-2">Tu Código de Referido</p>
                <div className="flex items-center gap-4">
                  <span className="text-4xl font-bold tracking-wider">
                    {client.referralCode}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(client.referralCode, 'Código')}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      title="Copiar código"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowQR(!showQR)}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                      title="Ver QR"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden lg:grid grid-cols-2 gap-4 ml-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
                <p className="text-xs text-blue-100">Referidos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
                <DollarSign className="w-8 h-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">${summary?.totalAvailable.toFixed(2) || '0.00'}</p>
                <p className="text-xs text-blue-100">Disponible</p>
              </div>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => copyToClipboard(client.shareUrl, 'Link')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copiar Link
            </button>
            <button
              onClick={shareViaWhatsApp}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp
            </button>
            <button
              onClick={shareViaEmail}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Email
            </button>
          </div>

          {/* QR Code Modal */}
          {showQR && (
            <div className="mt-6 bg-white rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Código QR de tu link
                </h3>
                <button
                  onClick={() => setShowQR(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="flex justify-center">
                <QRCodeSVG 
                  value={client.shareUrl} 
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              <p className="text-sm text-gray-600 text-center mt-4">
                Escanea para compartir tu código
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Referidos</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalReferrals || 0}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {stats?.activeReferrals || 0} activos
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Disponible</p>
                <p className="text-2xl font-bold text-green-600">
                  ${summary?.totalAvailable.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {summary?.active || 0} comisiones activas
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pendiente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  ${summary?.totalPending.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {summary?.earned || 0} comisiones generadas
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Ganado</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${stats?.totalEarned.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {summary?.applied || 0} comisiones cobradas
            </p>
          </div>
        </div>

        {/* Benefits Banner */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-4">
            <Gift className="w-12 h-12" />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-1">Beneficios por Referido</h3>
              <p className="text-emerald-100">
                Gana <strong>$500</strong> por instalación + <strong>$50 mensuales</strong> durante 6 meses
              </p>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-3xl font-bold">$800</p>
              <p className="text-sm text-emerald-100">por referido</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referrals Table */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Mis Referidos ({referrals.length})
            </h3>

            {referrals.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Aún no tienes referidos</p>
                <p className="text-sm text-gray-500">
                  ¡Comparte tu código para empezar a ganar!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{referral.nombre}</p>
                        <p className="text-sm text-gray-600">{referral.email}</p>
                        <p className="text-xs text-gray-500">{referral.telefono}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(referral.status)}`}>
                        {getStatusLabel(referral.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Registrado: {new Date(referral.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Commissions Table */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              Mis Comisiones ({commissions.length})
            </h3>

            {commissions.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No hay comisiones generadas</p>
                <p className="text-sm text-gray-500">
                  Las comisiones aparecerán cuando tus referidos realicen pagos
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {commissions.map((commission) => (
                  <div
                    key={commission.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(commission.status)}`}>
                            {getStatusIcon(commission.status)}
                            {getStatusLabel(commission.status)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {commission.type === 'INSTALLATION' ? 'Instalación' : `Mes ${commission.month}`}
                          </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          ${commission.amount.toFixed(2)}
                        </p>
                        {commission.statusReason && (
                          <p className="text-xs text-gray-600 mt-1">
                            {commission.statusReason}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Generada: {new Date(commission.generatedAt).toLocaleDateString()}
                      {commission.activatedAt && ` • Activada: ${new Date(commission.activatedAt).toLocaleDateString()}`}
                      {commission.appliedAt && ` • Cobrada: ${new Date(commission.appliedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ ¿Cómo funciona?</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">1.</span>
              <span><strong>Comparte tu código</strong> con amigos y familiares</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">2.</span>
              <span>Cuando se <strong>registren e instalen</strong> el servicio, ganas <strong>$500</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">3.</span>
              <span>Por cada mes que paguen, ganas <strong>$50 adicionales</strong> (hasta 6 meses)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">4.</span>
              <span><strong>Solo puedes cobrar</strong> si estás al día con tus pagos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">5.</span>
              <span>Las comisiones <strong>PENDIENTES</strong> se activan automáticamente cuando pagas tu factura</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
