'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Filter,
  Zap,
  FileText,
  User,
  Calendar,
  Hash,
  X,
} from 'lucide-react';
import { adminApi } from '@/lib/adminApi';

// ─── Tipos ───────────────────────────────────────────────────────────────────

type CommissionStatus = 'ACTIVE' | 'EARNED' | 'APPLIED' | 'CANCELLED';
type CommissionType = 'INSTALLATION' | 'MONTHLY';

interface CommissionApplication {
  id: string;
  amount: number;
  appliedAt: string;
  invoiceMonth: string;
  appliedBy: string;
  wispChatInvoiceId: string;
}

interface Commission {
  id: string;
  type: CommissionType;
  amount: number;
  status: CommissionStatus;
  statusReason: string | null;
  monthNumber: number | null;
  monthDate: string | null;
  notas: string | null;
  createdAt: string;
  client: {
    id: string;
    nombre: string;
    email: string;
    wispChatClientId: string;
    isPaymentCurrent: boolean;
  };
  referral: {
    id: string;
    nombre: string;
    telefono: string;
    wispChatClientId: string | null;
    status: string;
  };
  applications: CommissionApplication[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusLabel(s: CommissionStatus) {
  const map: Record<CommissionStatus, string> = {
    ACTIVE: 'Activa',
    EARNED: 'En espera',
    APPLIED: 'Aplicada',
    CANCELLED: 'Cancelada',
  };
  return map[s] ?? s;
}

function statusColor(s: CommissionStatus) {
  const map: Record<CommissionStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    EARNED: 'bg-yellow-100 text-yellow-800',
    APPLIED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return map[s] ?? 'bg-gray-100 text-gray-800';
}

function typeLabel(t: CommissionType) {
  return t === 'INSTALLATION' ? 'Instalación' : 'Mensual';
}

function appliedAmount(c: Commission): number {
  return c.applications.reduce((sum, a) => sum + a.amount, 0);
}

function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

// ─── Modal Aplicar ────────────────────────────────────────────────────────────

interface ApplyModalProps {
  commission: Commission;
  onClose: () => void;
  onSuccess: () => void;
}

function ApplyModal({ commission, onClose, onSuccess }: ApplyModalProps) {
  const remaining = commission.amount - appliedAmount(commission);
  const [form, setForm] = useState({
    wispChatInvoiceId: '',
    invoiceMonth: new Date().toLocaleString('es-MX', { month: 'long', year: 'numeric' }),
    invoiceAmount: '',
    amount: String(remaining.toFixed(2)),
    appliedBy: '',
    notas: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.wispChatInvoiceId || !form.invoiceMonth || !form.invoiceAmount || !form.appliedBy) {
      setError('Todos los campos marcados con * son obligatorios');
      return;
    }
    setLoading(true);
    try {
      const result = await adminApi.applyCommission(commission.id, {
        wispChatInvoiceId: form.wispChatInvoiceId,
        invoiceMonth: form.invoiceMonth,
        invoiceAmount: parseFloat(form.invoiceAmount),
        amount: parseFloat(form.amount),
        appliedBy: form.appliedBy,
        notas: form.notas || undefined,
      });
      if (!result.success) throw new Error(result.error?.message || 'Error al aplicar');
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-800">Aplicar comisión a factura</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Info de la comisión */}
        <div className="px-6 py-4 bg-blue-50 border-b text-sm">
          <p className="font-medium text-blue-900">{commission.referral.nombre} → {commission.client.nombre}</p>
          <p className="text-blue-700">
            {typeLabel(commission.type)}{commission.monthNumber ? ` (mes ${commission.monthNumber}/6)` : ''} —
            Disponible: <strong>{fmt(remaining)}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                # Factura WispChat *
              </label>
              <input
                type="text"
                value={form.wispChatInvoiceId}
                onChange={e => setForm(f => ({ ...f, wispChatInvoiceId: e.target.value }))}
                placeholder="Ej: 1042"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mes de factura *
              </label>
              <input
                type="text"
                value={form.invoiceMonth}
                onChange={e => setForm(f => ({ ...f, invoiceMonth: e.target.value }))}
                placeholder="Ej: Febrero 2026"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total factura ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={form.invoiceAmount}
                onChange={e => setForm(f => ({ ...f, invoiceAmount: e.target.value }))}
                placeholder="Ej: 299.00"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto a aplicar ($) *
              </label>
              <input
                type="number"
                step="0.01"
                max={remaining}
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Máximo: {fmt(remaining)}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aplicado por (tu nombre) *
            </label>
            <input
              type="text"
              value={form.appliedBy}
              onChange={e => setForm(f => ({ ...f, appliedBy: e.target.value }))}
              placeholder="Tu nombre"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              rows={2}
              value={form.notas}
              onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {loading ? 'Aplicando...' : 'Aplicar Comisión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Modal Cancelar ───────────────────────────────────────────────────────────

interface CancelModalProps {
  commission: Commission;
  onClose: () => void;
  onSuccess: () => void;
}

function CancelModal({ commission, onClose, onSuccess }: CancelModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) { setError('La razón es obligatoria'); return; }
    setLoading(true);
    try {
      const result = await adminApi.cancelCommission(commission.id, reason);
      if (!result.success) throw new Error(result.error?.message || 'Error al cancelar');
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-800">Cancelar comisión</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-sm text-gray-600">
            Comisión de <strong>{commission.referral.nombre}</strong> por {fmt(commission.amount)}.
            Esta acción no se puede deshacer.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Razón *</label>
            <textarea
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              placeholder="Ej: El referido canceló el servicio"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
              Volver
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2">
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
              Cancelar comisión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Tarjeta de comisión ──────────────────────────────────────────────────────

interface CommissionCardProps {
  commission: Commission;
  onApply: (c: Commission) => void;
  onCancel: (c: Commission) => void;
  onActivate: (clientId: string, clientName: string) => void;
}

function CommissionCard({ commission: c, onApply, onCancel, onActivate }: CommissionCardProps) {
  const [showApps, setShowApps] = useState(false);
  const applied = appliedAmount(c);
  const remaining = c.amount - applied;

  return (
    <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Info principal */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(c.status)}`}>
                {statusLabel(c.status)}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                {typeLabel(c.type)}
                {c.monthNumber ? ` — Mes ${c.monthNumber}/6` : ''}
              </span>
            </div>

            <div className="flex items-center gap-1 text-sm text-gray-800 font-medium mb-1">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="truncate">{c.referral.nombre}</span>
              <span className="text-gray-400 mx-1">→</span>
              <span className="truncate text-blue-700">{c.client.nombre}</span>
            </div>

            {c.referral.wispChatClientId && (
              <p className="text-xs text-gray-400 mb-1">
                WispChat ID referido: {c.referral.wispChatClientId}
              </p>
            )}

            {c.monthDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{new Date(c.monthDate).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</span>
              </div>
            )}

            {c.status === 'EARNED' && c.statusReason && (
              <div className="mt-2 flex items-start gap-1.5 text-xs text-yellow-700 bg-yellow-50 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>{c.statusReason}</span>
              </div>
            )}

            {!c.client.isPaymentCurrent && c.status === 'EARNED' && (
              <div className="mt-2">
                <button
                  onClick={() => onActivate(c.client.id, c.client.nombre)}
                  className="text-xs text-blue-700 hover:text-blue-900 underline flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  Activar comisiones del cliente
                </button>
              </div>
            )}
          </div>

          {/* Monto */}
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold text-gray-900">{fmt(c.amount)}</p>
            {applied > 0 && (
              <p className="text-xs text-gray-400">
                Aplicado: {fmt(applied)} / Restante: {fmt(remaining)}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {new Date(c.createdAt).toLocaleDateString('es-MX')}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          {c.status === 'ACTIVE' && (
            <button
              onClick={() => onApply(c)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
            >
              <DollarSign className="w-3.5 h-3.5" />
              Aplicar a factura
            </button>
          )}
          {(c.status === 'ACTIVE' || c.status === 'EARNED') && c.applications.length === 0 && (
            <button
              onClick={() => onCancel(c)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancelar
            </button>
          )}
          {c.applications.length > 0 && (
            <button
              onClick={() => setShowApps(v => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              {c.applications.length} aplicación(es)
              {showApps ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>

        {/* Historial de aplicaciones */}
        {showApps && c.applications.length > 0 && (
          <div className="mt-3 space-y-2">
            {c.applications.map(app => (
              <div key={app.id} className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 flex justify-between">
                <div>
                  <span className="font-medium">{fmt(app.amount)}</span>
                  <span className="text-gray-400 ml-2">— {app.invoiceMonth}</span>
                  <span className="text-gray-400 ml-2">#{app.wispChatInvoiceId}</span>
                </div>
                <div className="text-right text-gray-400">
                  <p>{app.appliedBy}</p>
                  <p>{new Date(app.appliedAt).toLocaleDateString('es-MX')}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

const TABS: { label: string; value: CommissionStatus | 'ALL' }[] = [
  { label: 'Activas (cobrar)', value: 'ACTIVE' },
  { label: 'En espera', value: 'EARNED' },
  { label: 'Aplicadas', value: 'APPLIED' },
  { label: 'Canceladas', value: 'CANCELLED' },
  { label: 'Todas', value: 'ALL' },
];

export default function AdminCommissionsPage() {
  const router = useRouter();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [activeTab, setActiveTab] = useState<CommissionStatus | 'ALL'>('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Modals
  const [applyTarget, setApplyTarget] = useState<Commission | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Commission | null>(null);

  // Stats
  const [stats, setStats] = useState<Record<string, number>>({});

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const checkAuth = () => {
    const token = localStorage.getItem('referral_auth_token');
    if (!token) router.push('/admin/auth');
  };

  const loadCommissions = useCallback(async (tab: CommissionStatus | 'ALL') => {
    setLoading(true);
    try {
      const result = await adminApi.getCommissions(
        tab !== 'ALL' ? { status: tab } : undefined
      );
      if (result.success) {
        setCommissions(result.data.commissions);
        setPagination(result.data.pagination);
      }
    } catch {
      showToast('error', 'Error al cargar comisiones');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      // Load counts for all statuses in parallel
      const statuses: CommissionStatus[] = ['ACTIVE', 'EARNED', 'APPLIED', 'CANCELLED'];
      const results = await Promise.all(
        statuses.map(s => adminApi.getCommissions({ status: s }))
      );
      const newStats: Record<string, number> = {};
      statuses.forEach((s, i) => {
        if (results[i].success) newStats[s] = results[i].data.pagination.total;
      });
      setStats(newStats);
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  useEffect(() => {
    loadCommissions(activeTab);
  }, [activeTab, loadCommissions]);

  const handleApplySuccess = () => {
    setApplyTarget(null);
    showToast('success', '¡Comisión aplicada exitosamente!');
    loadCommissions(activeTab);
    loadStats();
  };

  const handleCancelSuccess = () => {
    setCancelTarget(null);
    showToast('success', 'Comisión cancelada');
    loadCommissions(activeTab);
    loadStats();
  };

  const handleActivate = async (clientId: string, clientName: string) => {
    try {
      const result = await adminApi.activateClientCommissions(clientId);
      if (result.success) {
        showToast('success', result.data.message || `Comisiones de ${clientName} activadas`);
        loadCommissions(activeTab);
        loadStats();
      } else {
        showToast('error', result.error?.message || 'Error al activar');
      }
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  const tabCount = (tab: CommissionStatus | 'ALL') => {
    if (tab === 'ALL') return null;
    const n = stats[tab];
    return n != null ? n : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Comisiones</h1>
            <p className="text-gray-500 text-sm mt-1">
              Revisa, activa y aplica comisiones de referidos a las facturas de los clientes
            </p>
          </div>
          <button
            onClick={() => { loadCommissions(activeTab); loadStats(); }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-50 shadow-sm text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Resumen rápido */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Activas', key: 'ACTIVE', color: 'text-green-700 bg-green-50', icon: CheckCircle },
            { label: 'En espera', key: 'EARNED', color: 'text-yellow-700 bg-yellow-50', icon: Clock },
            { label: 'Aplicadas', key: 'APPLIED', color: 'text-blue-700 bg-blue-50', icon: DollarSign },
            { label: 'Canceladas', key: 'CANCELLED', color: 'text-red-700 bg-red-50', icon: XCircle },
          ].map(({ label, key, color, icon: Icon }) => (
            <div key={key} className={`rounded-xl p-4 ${color} flex items-center gap-3 cursor-pointer`} onClick={() => setActiveTab(key as CommissionStatus)}>
              <Icon className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold">{stats[key] ?? '—'}</p>
                <p className="text-xs font-medium">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border shadow-sm p-1 overflow-x-auto">
          {TABS.map(tab => {
            const count = tabCount(tab.value);
            const active = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label}
                {count != null && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="text-center">
              <RefreshCw className="w-10 h-10 text-blue-400 animate-spin mx-auto mb-3" />
              <p className="text-gray-500">Cargando comisiones...</p>
            </div>
          </div>
        ) : commissions.length === 0 ? (
          <div className="bg-white rounded-2xl border shadow-sm py-20 text-center">
            <DollarSign className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No hay comisiones en este estado</p>
            <p className="text-gray-400 text-sm mt-1">
              {activeTab === 'ACTIVE'
                ? 'Las comisiones activas aparecerán al procesar el CSV de facturas'
                : 'Prueba seleccionando otra pestaña'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {commissions.map(c => (
                <CommissionCard
                  key={c.id}
                  commission={c}
                  onApply={setApplyTarget}
                  onCancel={setCancelTarget}
                  onActivate={handleActivate}
                />
              ))}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 pt-2">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    disabled={loading}
                    onClick={() => loadCommissions(activeTab)}
                    className="px-3 py-1.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {applyTarget && (
        <ApplyModal
          commission={applyTarget}
          onClose={() => setApplyTarget(null)}
          onSuccess={handleApplySuccess}
        />
      )}
      {cancelTarget && (
        <CancelModal
          commission={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onSuccess={handleCancelSuccess}
        />
      )}

      {/* Toast */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-medium text-white transition-all ${
            toastMsg.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {toastMsg.text}
          <button onClick={() => setToastMsg(null)}>
            <X className="w-4 h-4 ml-2 opacity-70 hover:opacity-100" />
          </button>
        </div>
      )}
    </div>
  );
}
