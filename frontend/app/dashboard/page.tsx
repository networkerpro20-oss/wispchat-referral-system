'use client';

import { useEffect, useState } from 'react';
import { Gift, Users, DollarSign, TrendingUp, Share2, LogOut } from 'lucide-react';
import api from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    // Simular token por ahora (en producción vendría de WispChat)
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEyMyIsImVtYWlsIjoidGVzdEB3aXNwY2hhdC5uZXQiLCJyb2xlIjoiY2xpZW50IiwidGVuYW50SWQiOiJ3aXNwY2hhdCIsInRlbmFudERvbWFpbiI6Indpc3BjaGF0Lm5ldCJ9.dummySignature';
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', mockToken);
    }
    
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, referralsRes, commissionsRes] = await Promise.all([
        api.get('/referrals/my-stats'),
        api.get('/referrals/my-referrals'),
        api.get('/commissions/my-commissions'),
      ]);

      setStats(statsRes.data.data);
      setReferrals(referralsRes.data.data);
      setCommissions(commissionsRes.data.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateShareUrl = async () => {
    try {
      const response = await api.post('/referrals/share-url', {
        name: 'Mi referido',
      });
      setShareUrl(response.data.data.shareUrl);
    } catch (error) {
      console.error('Error generating share URL:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Enlace copiado al portapapeles');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Gift className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Referidos</h1>
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/';
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Total Referidos</span>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalReferrals || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Activos</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats?.activeReferrals || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Ganado</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">${stats?.totalEarned?.toFixed(2) || '0.00'}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm">Pendiente</span>
              <DollarSign className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900">${stats?.totalPending?.toFixed(2) || '0.00'}</p>
          </div>
        </div>

        {/* Share URL Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Comparte tu Enlace</h2>
          {!shareUrl ? (
            <button
              onClick={generateShareUrl}
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition"
            >
              Generar Enlace Único
            </button>
          ) : (
            <div>
              <div className="bg-white/20 rounded-lg p-4 mb-4">
                <p className="text-sm mb-2">Tu enlace único:</p>
                <p className="font-mono text-lg break-all">{shareUrl}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
                >
                  <Share2 className="w-5 h-5" />
                  Copiar Enlace
                </button>
                <button
                  onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(shareUrl)}`, '_blank')}
                  className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
                >
                  Compartir por WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Referrals Table */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mis Referidos</h2>
          {referrals.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Aún no tienes referidos. ¡Comparte tu enlace para empezar!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900">{referral.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{referral.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                          referral.status === 'INSTALLED' ? 'bg-green-100 text-green-700' :
                          referral.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {referral.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Commissions Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mis Comisiones</h2>
          {commissions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              Aún no tienes comisiones generadas.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Monto</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((commission) => (
                    <tr key={commission.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm text-gray-900">{commission.referral?.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {commission.type === 'INSTALLATION' ? 'Instalación' : `Mes ${commission.paymentNumber}`}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-green-600">
                        ${commission.amount}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                          commission.status === 'APPLIED' ? 'bg-green-100 text-green-700' :
                          commission.status === 'EARNED' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {commission.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(commission.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
