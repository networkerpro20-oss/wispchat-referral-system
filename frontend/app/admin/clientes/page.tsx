'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  UserPlus,
  CheckCircle,
  Clock,
  XCircle,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  AlertCircle
} from 'lucide-react';

import { API_URL } from '@/lib/apiConfig';

interface Referral {
  id: string;
  nombre: string;
  telefono: string;
  email: string | null;
  direccion: string | null;
  status: 'PENDING' | 'CONTACTED' | 'INSTALLED' | 'REJECTED';
  fechaContacto: string | null;
  fechaInstalacion: string | null;
  createdAt: string;
  commissions: Array<{
    type: string;
    amount: number;
    status: string;
  }>;
}

interface Client {
  id: string;
  wispChatClientId: string;
  nombre: string;
  email: string;
  telefono: string | null;
  referralCode: string;
  shareUrl: string;
  isPaymentCurrent: boolean;
  lastInvoiceStatus: string | null;
  totalReferrals: number;
  totalEarned: number;
  totalActive: number;
  totalApplied: number;
  active: boolean;
  createdAt: string;
  referrals: Referral[];
}

interface DashboardStats {
  totalClients: number;
  totalLeads: number;
  pendingLeads: number;
  contactedLeads: number;
  installedLeads: number;
  rejectedLeads: number;
  totalCommissions: number;
  activeCommissions: number;
  conversionRate: number;
}

export default function AdminClientesPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('referral_auth_token');
    if (!token) {
      router.push('/admin/auth');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('referral_auth_token');
      
      // Cargar clientes con sus referidos
      const clientsRes = await fetch(`${API_URL}/admin/clients-with-referrals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data.data || []);
        calculateStats(data.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (clientsData: Client[]) => {
    let totalLeads = 0;
    let pendingLeads = 0;
    let contactedLeads = 0;
    let installedLeads = 0;
    let rejectedLeads = 0;
    let totalCommissions = 0;
    let activeCommissions = 0;

    clientsData.forEach(client => {
      client.referrals?.forEach(ref => {
        totalLeads++;
        switch (ref.status) {
          case 'PENDING': pendingLeads++; break;
          case 'CONTACTED': contactedLeads++; break;
          case 'INSTALLED': installedLeads++; break;
          case 'REJECTED': rejectedLeads++; break;
        }
        ref.commissions?.forEach(comm => {
          totalCommissions++;
          if (comm.status === 'ACTIVE') activeCommissions++;
        });
      });
    });

    const conversionRate = totalLeads > 0 ? (installedLeads / totalLeads) * 100 : 0;

    setStats({
      totalClients: clientsData.length,
      totalLeads,
      pendingLeads,
      contactedLeads,
      installedLeads,
      rejectedLeads,
      totalCommissions,
      activeCommissions,
      conversionRate
    });
  };

  const toggleClient = (clientId: string) => {
    const newExpanded = new Set(expandedClients);
    if (newExpanded.has(clientId)) {
      newExpanded.delete(clientId);
    } else {
      newExpanded.add(clientId);
    }
    setExpandedClients(newExpanded);
  };

  const expandAll = () => {
    setExpandedClients(new Set(clients.map(c => c.id)));
  };

  const collapseAll = () => {
    setExpandedClients(new Set());
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CONTACTED: 'bg-blue-100 text-blue-800 border-blue-200',
      INSTALLED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200'
    };
    const icons: Record<string, React.ReactNode> = {
      PENDING: <Clock className="w-3 h-3" />,
      CONTACTED: <Phone className="w-3 h-3" />,
      INSTALLED: <CheckCircle className="w-3 h-3" />,
      REJECTED: <XCircle className="w-3 h-3" />
    };
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      CONTACTED: 'Contactado',
      INSTALLED: 'Instalado',
      REJECTED: 'Rechazado'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {icons[status]}
        {labels[status] || status}
      </span>
    );
  };

  const filteredClients = clients.filter(client => {
    // Búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesClient = 
        client.nombre.toLowerCase().includes(term) ||
        client.email.toLowerCase().includes(term) ||
        client.referralCode.toLowerCase().includes(term) ||
        client.telefono?.toLowerCase().includes(term);
      
      const matchesReferral = client.referrals?.some(ref =>
        ref.nombre.toLowerCase().includes(term) ||
        ref.telefono.toLowerCase().includes(term) ||
        ref.email?.toLowerCase().includes(term)
      );

      if (!matchesClient && !matchesReferral) return false;
    }

    // Filtro de pago
    if (paymentFilter !== 'ALL') {
      if (paymentFilter === 'CURRENT' && !client.isPaymentCurrent) return false;
      if (paymentFilter === 'OVERDUE' && client.isPaymentCurrent) return false;
    }

    // Filtro de estado de referidos
    if (statusFilter !== 'ALL') {
      const hasMatchingReferral = client.referrals?.some(ref => ref.status === statusFilter);
      if (!hasMatchingReferral) return false;
    }

    return true;
  });

  const exportToCSV = () => {
    const rows = [
      ['Cliente', 'Email Cliente', 'Teléfono Cliente', 'Código Referido', 'Estado Pago', 
       'Lead Nombre', 'Lead Teléfono', 'Lead Email', 'Estado Lead', 'Fecha Registro', 'Fecha Instalación']
    ];

    clients.forEach(client => {
      if (client.referrals?.length > 0) {
        client.referrals.forEach(ref => {
          rows.push([
            client.nombre,
            client.email,
            client.telefono || '',
            client.referralCode,
            client.isPaymentCurrent ? 'Al día' : 'Pendiente',
            ref.nombre,
            ref.telefono,
            ref.email || '',
            ref.status,
            new Date(ref.createdAt).toLocaleDateString('es-MX'),
            ref.fechaInstalacion ? new Date(ref.fechaInstalacion).toLocaleDateString('es-MX') : ''
          ]);
        });
      } else {
        rows.push([
          client.nombre,
          client.email,
          client.telefono || '',
          client.referralCode,
          client.isPaymentCurrent ? 'Al día' : 'Pendiente',
          'Sin referidos', '', '', '', '', ''
        ]);
      }
    });

    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clientes-referidos-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                ← Volver
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-7 h-7 text-blue-600" />
                Clientes y Referidos
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Actualizar"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="text-sm text-gray-600 mb-1">Clientes</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalClients}</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border">
              <div className="text-sm text-gray-600 mb-1">Total Leads</div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalLeads}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl shadow-sm border border-yellow-100">
              <div className="text-sm text-yellow-700 mb-1">Pendientes</div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingLeads}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100">
              <div className="text-sm text-blue-700 mb-1">Contactados</div>
              <div className="text-2xl font-bold text-blue-600">{stats.contactedLeads}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100">
              <div className="text-sm text-green-700 mb-1">Instalados</div>
              <div className="text-2xl font-bold text-green-600">{stats.installedLeads}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-xl shadow-sm border border-purple-100">
              <div className="text-sm text-purple-700 mb-1">Conversión</div>
              <div className="text-2xl font-bold text-purple-600">{stats.conversionRate.toFixed(1)}%</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, email, teléfono o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todos los estados</option>
              <option value="PENDING">Pendientes</option>
              <option value="CONTACTED">Contactados</option>
              <option value="INSTALLED">Instalados</option>
              <option value="REJECTED">Rechazados</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Estado de pago</option>
              <option value="CURRENT">Al día</option>
              <option value="OVERDUE">Con adeudo</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Expandir todo
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Colapsar todo
              </button>
            </div>
          </div>
        </div>

        {/* Clients List */}
        <div className="space-y-4">
          {filteredClients.length === 0 ? (
            <div className="bg-white p-12 rounded-xl shadow-sm border text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron clientes</h3>
              <p className="text-gray-600">Intenta con otros filtros de búsqueda</p>
            </div>
          ) : (
            filteredClients.map(client => (
              <div key={client.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* Client Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleClient(client.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button className="p-1 hover:bg-gray-200 rounded">
                        {expandedClients.has(client.id) ? (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                      
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {client.nombre.charAt(0).toUpperCase()}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{client.nombre}</h3>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-mono rounded">
                            {client.referralCode}
                          </span>
                          {!client.isPaymentCurrent && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                              <AlertCircle className="w-3 h-3" />
                              Adeudo
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </span>
                          {client.telefono && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {client.telefono}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{client.referrals?.length || 0}</div>
                        <div className="text-xs text-gray-500">Referidos</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">${Number(client.totalEarned || 0).toFixed(0)}</div>
                        <div className="text-xs text-gray-500">Ganado</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">${Number(client.totalActive || 0).toFixed(0)}</div>
                        <div className="text-xs text-gray-500">Activo</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Referrals List */}
                {expandedClients.has(client.id) && (
                  <div className="border-t bg-gray-50">
                    {client.referrals?.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        Este cliente aún no tiene referidos
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {client.referrals?.map(referral => (
                          <div key={referral.id} className="p-4 hover:bg-white transition-colors">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                                  {referral.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{referral.nombre}</span>
                                    {getStatusBadge(referral.status)}
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {referral.telefono}
                                    </span>
                                    {referral.email && (
                                      <span className="flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {referral.email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-6">
                                {/* Timeline */}
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="text-center">
                                    <div className="text-gray-500">Registrado</div>
                                    <div className="font-medium">{new Date(referral.createdAt).toLocaleDateString('es-MX')}</div>
                                  </div>
                                  <div className="w-8 h-px bg-gray-300"></div>
                                  {referral.fechaContacto && (
                                    <>
                                      <div className="text-center">
                                        <div className="text-blue-500">Contactado</div>
                                        <div className="font-medium">{new Date(referral.fechaContacto).toLocaleDateString('es-MX')}</div>
                                      </div>
                                      <div className="w-8 h-px bg-gray-300"></div>
                                    </>
                                  )}
                                  {referral.fechaInstalacion && (
                                    <div className="text-center">
                                      <div className="text-green-500">Instalado</div>
                                      <div className="font-medium">{new Date(referral.fechaInstalacion).toLocaleDateString('es-MX')}</div>
                                    </div>
                                  )}
                                </div>

                                {/* Comisiones */}
                                {referral.commissions?.length > 0 && (
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-green-600">
                                      ${referral.commissions.reduce((sum, c) => sum + c.amount, 0).toFixed(0)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {referral.commissions.length} comisión(es)
                                    </div>
                                  </div>
                                )}

                                <Link
                                  href={`/admin/leads/${referral.id}`}
                                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Eye className="w-5 h-5" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
