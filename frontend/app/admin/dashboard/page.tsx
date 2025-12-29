'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  DollarSign,
  FileSpreadsheet,
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Calendar,
  Download,
  Bell
} from 'lucide-react';

import { API_URL } from '@/lib/apiConfig';

interface DashboardData {
  clients: {
    total: number;
    withReferrals: number;
    paymentCurrent: number;
    paymentOverdue: number;
  };
  leads: {
    total: number;
    pending: number;
    contacted: number;
    installed: number;
    rejected: number;
    thisMonth: number;
    lastMonth: number;
  };
  commissions: {
    total: number;
    earned: number;
    active: number;
    applied: number;
    cancelled: number;
    totalAmount: number;
    activeAmount: number;
    appliedAmount: number;
  };
  recentLeads: Array<{
    id: string;
    nombre: string;
    telefono: string;
    status: string;
    createdAt: string;
    clientName: string;
  }>;
  topReferrers: Array<{
    id: string;
    nombre: string;
    referralCode: string;
    totalReferrals: number;
    totalEarned: number;
  }>;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    checkAuth();
    loadDashboard();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('referral_auth_token');
    if (!token) {
      router.push('/admin/auth');
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('referral_auth_token');

      const response = await fetch(`${API_URL}/admin/dashboard-extended`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        setData(result.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLeadGrowth = () => {
    if (!data) return 0;
    if (data.leads.lastMonth === 0) return data.leads.thisMonth > 0 ? 100 : 0;
    return ((data.leads.thisMonth - data.leads.lastMonth) / data.leads.lastMonth) * 100;
  };

  const getConversionRate = () => {
    if (!data || data.leads.total === 0) return 0;
    return (data.leads.installed / data.leads.total) * 100;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      CONTACTED: 'bg-blue-100 text-blue-700',
      INSTALLED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700'
    };
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      CONTACTED: 'Contactado',
      INSTALLED: 'Instalado',
      REJECTED: 'Rechazado'
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const growth = getLeadGrowth();
  const conversion = getConversionRate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <LayoutDashboard className="w-7 h-7 text-blue-600" />
                Dashboard Administrativo
              </h1>
              {lastUpdate && (
                <p className="text-sm text-gray-500 mt-1">
                  Última actualización: {lastUpdate.toLocaleTimeString('es-MX')}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadDashboard}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Actualizar"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <Link
                href="/admin/configuracion"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Settings className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Clientes */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <Link href="/admin/clientes" className="text-blue-600 text-sm hover:underline">
                Ver todos →
              </Link>
            </div>
            <div className="text-3xl font-bold text-gray-900">{data?.clients.total || 0}</div>
            <div className="text-sm text-gray-600">Clientes Registrados</div>
            <div className="mt-2 text-xs text-gray-500">
              {data?.clients.withReferrals || 0} con referidos
            </div>
          </div>

          {/* Leads */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <UserPlus className="w-6 h-6 text-purple-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {growth >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {Math.abs(growth).toFixed(0)}%
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{data?.leads.total || 0}</div>
            <div className="text-sm text-gray-600">Total Leads</div>
            <div className="mt-2 text-xs text-gray-500">
              {data?.leads.thisMonth || 0} este mes
            </div>
          </div>

          {/* Comisiones Activas */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-600">
              ${(data?.commissions.activeAmount || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Comisiones Activas</div>
            <div className="mt-2 text-xs text-gray-500">
              {data?.commissions.active || 0} pendientes de aplicar
            </div>
          </div>

          {/* Tasa de Conversión */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="text-3xl font-bold text-emerald-600">{conversion.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Tasa de Conversión</div>
            <div className="mt-2 text-xs text-gray-500">
              {data?.leads.installed || 0} de {data?.leads.total || 0} leads
            </div>
          </div>
        </div>

        {/* Funnel de Leads */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Funnel de Conversión</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-600">{data?.leads.pending || 0}</div>
              <div className="text-sm text-gray-600">Pendientes</div>
              <div className="text-xs text-gray-500 mt-1">
                {data?.leads.total ? ((data.leads.pending / data.leads.total) * 100).toFixed(0) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Bell className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">{data?.leads.contacted || 0}</div>
              <div className="text-sm text-gray-600">Contactados</div>
              <div className="text-xs text-gray-500 mt-1">
                {data?.leads.total ? ((data.leads.contacted / data.leads.total) * 100).toFixed(0) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">{data?.leads.installed || 0}</div>
              <div className="text-sm text-gray-600">Instalados</div>
              <div className="text-xs text-gray-500 mt-1">
                {data?.leads.total ? ((data.leads.installed / data.leads.total) * 100).toFixed(0) : 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="text-2xl font-bold text-red-600">{data?.leads.rejected || 0}</div>
              <div className="text-sm text-gray-600">Rechazados</div>
              <div className="text-xs text-gray-500 mt-1">
                {data?.leads.total ? ((data.leads.rejected / data.leads.total) * 100).toFixed(0) : 0}%
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Leads Recientes */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Leads Recientes</h2>
              <Link href="/admin/clientes" className="text-blue-600 text-sm hover:underline">
                Ver todos →
              </Link>
            </div>
            <div className="divide-y">
              {data?.recentLeads?.slice(0, 5).map(lead => (
                <Link 
                  key={lead.id} 
                  href={`/admin/leads/${lead.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{lead.nombre}</div>
                      <div className="text-sm text-gray-600">{lead.telefono}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Referido por: {lead.clientName}
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(lead.status)}
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(lead.createdAt).toLocaleDateString('es-MX')}
                      </div>
                    </div>
                  </div>
                </Link>
              )) || (
                <div className="p-8 text-center text-gray-500">
                  No hay leads recientes
                </div>
              )}
            </div>
          </div>

          {/* Top Referidores */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">Top Referidores</h2>
            </div>
            <div className="divide-y">
              {data?.topReferrers?.slice(0, 5).map((referrer, idx) => (
                <div key={referrer.id} className="p-4 flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                    idx === 1 ? 'bg-gray-300 text-gray-700' :
                    idx === 2 ? 'bg-amber-600 text-white' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{referrer.nombre}</div>
                    <div className="text-sm text-gray-500 font-mono">{referrer.referralCode}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{referrer.totalReferrals}</div>
                    <div className="text-xs text-gray-500">referidos</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">${referrer.totalEarned}</div>
                    <div className="text-xs text-gray-500">ganado</div>
                  </div>
                </div>
              )) || (
                <div className="p-8 text-center text-gray-500">
                  No hay datos disponibles
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/clientes"
            className="bg-white p-6 rounded-xl shadow-sm border hover:border-blue-300 hover:shadow-md transition-all text-center"
          >
            <Users className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <div className="font-medium text-gray-900">Clientes y Referidos</div>
            <div className="text-sm text-gray-500">Ver todos los clientes</div>
          </Link>

          <Link
            href="/admin/uploads"
            className="bg-white p-6 rounded-xl shadow-sm border hover:border-blue-300 hover:shadow-md transition-all text-center"
          >
            <FileSpreadsheet className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <div className="font-medium text-gray-900">Subir Facturas</div>
            <div className="text-sm text-gray-500">Procesar CSV de pagos</div>
          </Link>

          <Link
            href="/admin/invoices"
            className="bg-white p-6 rounded-xl shadow-sm border hover:border-blue-300 hover:shadow-md transition-all text-center"
          >
            <Download className="w-10 h-10 text-purple-600 mx-auto mb-3" />
            <div className="font-medium text-gray-900">Comisiones</div>
            <div className="text-sm text-gray-500">Aplicar descuentos</div>
          </Link>

          <Link
            href="/admin/configuracion"
            className="bg-white p-6 rounded-xl shadow-sm border hover:border-blue-300 hover:shadow-md transition-all text-center"
          >
            <Settings className="w-10 h-10 text-gray-600 mx-auto mb-3" />
            <div className="font-medium text-gray-900">Configuración</div>
            <div className="text-sm text-gray-500">Montos y ajustes</div>
          </Link>
        </div>

        {/* Alertas */}
        {data && (data.leads.pending > 5 || data.clients.paymentOverdue > 0) && (
          <div className="mt-6 space-y-3">
            {data.leads.pending > 5 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-yellow-800">
                    Tienes {data.leads.pending} leads pendientes de contactar
                  </div>
                  <div className="text-sm text-yellow-700">
                    Revisa la lista de leads para dar seguimiento
                  </div>
                </div>
                <Link 
                  href="/admin/clientes?status=PENDING" 
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Ver leads
                </Link>
              </div>
            )}

            {data.clients.paymentOverdue > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-red-800">
                    {data.clients.paymentOverdue} clientes con adeudo
                  </div>
                  <div className="text-sm text-red-700">
                    Sus comisiones están en estado EARNED (no pueden cobrar)
                  </div>
                </div>
                <Link 
                  href="/admin/clientes?payment=OVERDUE" 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Ver clientes
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
