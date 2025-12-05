'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wispchat-referral-backend.onrender.com';

interface Commission {
  id: string;
  referralId: string;
  type: 'INSTALLATION' | 'MONTHLY';
  amount: number;
  status: 'PENDING' | 'EARNED' | 'APPLIED' | 'PAID' | 'CANCELLED' | 'REJECTED';
  paymentNumber?: number;
  earnedDate?: string;
  appliedDate?: string;
  appliedToInvoice?: string;
  notes?: string;
  referral?: {
    referrerName: string;
    referrerEmail: string;
    referidoName: string;
    referidoEmail: string;
  };
}

interface ReferralSettings {
  installationCommission: number;
  monthlyCommission: number;
  commissionMonths: number;
  currency: string;
}

export default function AdminCommissionsPage() {
  const router = useRouter();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [settings, setSettings] = useState<ReferralSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');
  
  // Settings edit
  const [editingSettings, setEditingSettings] = useState(false);
  const [newInstallationCommission, setNewInstallationCommission] = useState<number>(500);
  const [newMonthlyCommission, setNewMonthlyCommission] = useState<number>(50);
  const [newCommissionMonths, setNewCommissionMonths] = useState<number>(6);

  useEffect(() => {
    loadCommissions();
    loadSettings();
  }, []);

  const loadCommissions = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await axios.get(`${API_URL}/api/commissions/wispchat`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCommissions(response.data.data || []);
    } catch (error: any) {
      console.error('Error loading commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/referrals/settings/wispchat`);
      setSettings(response.data.data);
      if (response.data.data) {
        setNewInstallationCommission(response.data.data.installationCommission);
        setNewMonthlyCommission(response.data.data.monthlyCommission);
        setNewCommissionMonths(response.data.data.commissionMonths);
      }
    } catch (error: any) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/api/referrals/settings/wispchat`,
        {
          installationCommission: newInstallationCommission,
          monthlyCommission: newMonthlyCommission,
          commissionMonths: newCommissionMonths,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Configuración actualizada exitosamente');
      setEditingSettings(false);
      loadSettings();
    } catch (error: any) {
      alert('Error al actualizar configuración: ' + error.response?.data?.message);
    }
  };

  const applyCommission = async (commissionId: string) => {
    if (!confirm('¿Aplicar esta comisión a la cuenta del cliente?')) return;

    try {
      const token = localStorage.getItem('token');
      const invoice = prompt('Número de factura donde se aplicará (opcional):');

      await axios.post(
        `${API_URL}/api/commissions/${commissionId}/apply`,
        { appliedToInvoice: invoice || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Comisión aplicada exitosamente');
      loadCommissions();
    } catch (error: any) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  const updateCommission = async () => {
    if (!editingCommission) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/api/commissions/${editingCommission.id}`,
        {
          amount: editAmount,
          notes: editNotes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Comisión actualizada');
      setEditingCommission(null);
      loadCommissions();
    } catch (error: any) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  const deleteCommission = async (commissionId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta comisión?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/commissions/${commissionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('Comisión eliminada');
      loadCommissions();
    } catch (error: any) {
      alert('Error: ' + error.response?.data?.message);
    }
  };

  const filteredCommissions = commissions.filter((c) => {
    if (filter === 'ALL') return true;
    return c.status === filter;
  });

  const stats = {
    total: commissions.length,
    earned: commissions.filter((c) => c.status === 'EARNED').length,
    applied: commissions.filter((c) => c.status === 'APPLIED').length,
    totalEarned: commissions
      .filter((c) => c.status === 'EARNED')
      .reduce((sum, c) => sum + c.amount, 0),
    totalApplied: commissions
      .filter((c) => c.status === 'APPLIED')
      .reduce((sum, c) => sum + c.amount, 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              ← Volver al Dashboard
            </Link>
          </div>
          <p className="text-gray-600">Gestión de comisiones y configuración del programa de referidos</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">Total Comisiones</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-green-50 p-6 rounded-lg shadow">
            <div className="text-sm text-green-600 mb-1">Ganadas (EARNED)</div>
            <div className="text-2xl font-bold text-green-700">{stats.earned}</div>
            <div className="text-sm text-green-600 mt-1">
              ${stats.totalEarned.toLocaleString()} MXN
            </div>
          </div>
          <div className="bg-blue-50 p-6 rounded-lg shadow">
            <div className="text-sm text-blue-600 mb-1">Aplicadas (APPLIED)</div>
            <div className="text-2xl font-bold text-blue-700">{stats.applied}</div>
            <div className="text-sm text-blue-600 mt-1">
              ${stats.totalApplied.toLocaleString()} MXN
            </div>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg shadow">
            <div className="text-sm text-purple-600 mb-1">Pendiente por Aplicar</div>
            <div className="text-2xl font-bold text-purple-700">
              ${stats.totalEarned.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">⚙️ Configuración de Comisiones</h2>
            {!editingSettings && (
              <button
                onClick={() => setEditingSettings(true)}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                Editar Montos
              </button>
            )}
          </div>

          {editingSettings ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comisión por Instalación
                </label>
                <input
                  type="number"
                  value={newInstallationCommission}
                  onChange={(e) => setNewInstallationCommission(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comisión Mensual
                </label>
                <input
                  type="number"
                  value={newMonthlyCommission}
                  onChange={(e) => setNewMonthlyCommission(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Meses con Comisión
                </label>
                <input
                  type="number"
                  value={newCommissionMonths}
                  onChange={(e) => setNewCommissionMonths(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="6"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={updateSettings}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Guardar Cambios
                </button>
                <button
                  onClick={() => {
                    setEditingSettings(false);
                    loadSettings();
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Comisión por Instalación</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${settings?.installationCommission || 0} {settings?.currency || 'MXN'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Comisión Mensual</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${settings?.monthlyCommission || 0} {settings?.currency || 'MXN'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Meses con Comisión</div>
                <div className="text-2xl font-bold text-gray-900">
                  {settings?.commissionMonths || 0} meses
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex gap-2 overflow-x-auto">
            {['ALL', 'PENDING', 'EARNED', 'APPLIED', 'PAID', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Commissions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referidor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCommissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          commission.type === 'INSTALLATION'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {commission.type === 'INSTALLATION' ? '💰 Instalación' : '📅 Mensual #' + commission.paymentNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {commission.referral?.referrerName || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">{commission.referral?.referrerEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{commission.referral?.referidoName || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{commission.referral?.referidoEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-gray-900">${commission.amount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          commission.status === 'EARNED'
                            ? 'bg-green-100 text-green-800'
                            : commission.status === 'APPLIED'
                            ? 'bg-blue-100 text-blue-800'
                            : commission.status === 'PAID'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {commission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {commission.earnedDate
                        ? new Date(commission.earnedDate).toLocaleDateString('es-MX')
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {commission.status === 'EARNED' && (
                          <button
                            onClick={() => applyCommission(commission.id)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                          >
                            Aplicar
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingCommission(commission);
                            setEditAmount(commission.amount);
                            setEditNotes(commission.notes || '');
                          }}
                          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteCommission(commission.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCommissions.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No hay comisiones con el filtro seleccionado
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingCommission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Editar Comisión</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Notas adicionales..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={updateCommission}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setEditingCommission(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
