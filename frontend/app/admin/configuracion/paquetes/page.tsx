'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Eye, EyeOff, Save, X, Loader2, CheckCircle, XCircle, Star } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wispchat-referral-backend.onrender.com';

interface InternetPlan {
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

type ModalMode = 'create' | 'edit' | null;

export default function PaquetesPage() {
  const [plans, setPlans] = useState<InternetPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingPlan, setEditingPlan] = useState<Partial<InternetPlan> | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('referral_auth_token');
      
      const response = await fetch(`${API_URL}/api/plans/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error cargando planes');
      }

      const data = await response.json();
      setPlans(data.data);
    } catch (error: any) {
      showMessage('error', error.message || 'Error al cargar planes');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreate = () => {
    setEditingPlan({
      name: '',
      slug: '',
      speed: '',
      speedDownload: 0,
      speedUpload: null,
      price: '',
      currency: 'MXN',
      priceLabel: null,
      popular: false,
      badge: null,
      features: [],
      maxDevices: null,
      recommendedFor: null,
      order: plans.length + 1,
      active: true,
    });
    setModalMode('create');
  };

  const handleEdit = (plan: InternetPlan) => {
    setEditingPlan(plan);
    setModalMode('edit');
  };

  const handleSave = async () => {
    if (!editingPlan) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('referral_auth_token');
      
      const url = modalMode === 'create' 
        ? `${API_URL}/api/plans/admin`
        : `${API_URL}/api/plans/admin/${editingPlan.id}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editingPlan),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar');
      }

      showMessage('success', `Plan ${modalMode === 'create' ? 'creado' : 'actualizado'} exitosamente`);
      setModalMode(null);
      setEditingPlan(null);
      await loadPlans();
    } catch (error: any) {
      showMessage('error', error.message || 'Error al guardar plan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar el plan "${name}"?`)) return;

    try {
      const token = localStorage.getItem('referral_auth_token');
      
      const response = await fetch(`${API_URL}/api/plans/admin/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar plan');
      }

      showMessage('success', 'Plan eliminado exitosamente');
      await loadPlans();
    } catch (error: any) {
      showMessage('error', error.message || 'Error al eliminar plan');
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const token = localStorage.getItem('referral_auth_token');
      
      const response = await fetch(`${API_URL}/api/plans/admin/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cambiar estado');
      }

      await loadPlans();
    } catch (error: any) {
      showMessage('error', error.message || 'Error al cambiar estado');
    }
  };

  const updateEditingField = (field: keyof InternetPlan, value: any) => {
    if (!editingPlan) return;
    setEditingPlan({ ...editingPlan, [field]: value });
  };

  const addFeature = () => {
    if (!editingPlan) return;
    const features = editingPlan.features || [];
    setEditingPlan({ ...editingPlan, features: [...features, ''] });
  };

  const updateFeature = (index: number, value: string) => {
    if (!editingPlan) return;
    const features = [...(editingPlan.features || [])];
    features[index] = value;
    setEditingPlan({ ...editingPlan, features });
  };

  const removeFeature = (index: number) => {
    if (!editingPlan) return;
    const features = editingPlan.features?.filter((_, i) => i !== index) || [];
    setEditingPlan({ ...editingPlan, features });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Paquetes de Internet</h1>
          <p className="text-gray-600">Administra los planes que se muestran en la landing page</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Nuevo Paquete
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Plans Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Velocidad</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Popular</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {plans.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No hay paquetes creados. Haz clic en "Nuevo Paquete" para comenzar.
                </td>
              </tr>
            ) : (
              plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                      <span className="text-sm text-gray-900">{plan.order}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{plan.name}</span>
                      {plan.badge && (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{plan.speed}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    ${plan.price} {plan.currency}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(plan.id)}
                      className={`px-3 py-1 text-xs rounded-full font-medium ${
                        plan.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {plan.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {plan.popular && <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id, plan.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalMode && editingPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' ? 'Nuevo Paquete' : 'Editar Paquete'}
              </h2>
              <button
                onClick={() => {
                  setModalMode(null);
                  setEditingPlan(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Plan *
                  </label>
                  <input
                    type="text"
                    value={editingPlan.name || ''}
                    onChange={(e) => updateEditingField('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Plan Hogar"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (URL) *
                  </label>
                  <input
                    type="text"
                    value={editingPlan.slug || ''}
                    onChange={(e) => updateEditingField('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="plan-hogar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Velocidad *
                  </label>
                  <input
                    type="text"
                    value={editingPlan.speed || ''}
                    onChange={(e) => updateEditingField('speed', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="50 Mbps"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descarga (Mbps)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.speedDownload || ''}
                    onChange={(e) => updateEditingField('speedDownload', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subida (Mbps)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.speedUpload || ''}
                    onChange={(e) => updateEditingField('speedUpload', e.target.value ? parseFloat(e.target.value) : null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <input
                    type="number"
                    value={editingPlan.price || ''}
                    onChange={(e) => updateEditingField('price', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moneda
                  </label>
                  <select
                    value={editingPlan.currency || 'MXN'}
                    onChange={(e) => updateEditingField('currency', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="MXN">MXN</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Badge (opcional)
                  </label>
                  <input
                    type="text"
                    value={editingPlan.badge || ''}
                    onChange={(e) => updateEditingField('badge', e.target.value || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Mejor oferta"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dispositivos
                  </label>
                  <input
                    type="number"
                    value={editingPlan.maxDevices || ''}
                    onChange={(e) => updateEditingField('maxDevices', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recomendado para
                </label>
                <input
                  type="text"
                  value={editingPlan.recommendedFor || ''}
                  onChange={(e) => updateEditingField('recommendedFor', e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Familias con 3-4 personas"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Características
                  </label>
                  <button
                    onClick={addFeature}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Agregar
                  </button>
                </div>
                <div className="space-y-2">
                  {(editingPlan.features || []).map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Internet simétrico"
                      />
                      <button
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.popular || false}
                    onChange={(e) => updateEditingField('popular', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Marcar como Popular
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingPlan.active !== false}
                    onChange={(e) => updateEditingField('active', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Activo
                  </span>
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t">
              <button
                onClick={() => {
                  setModalMode(null);
                  setEditingPlan(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !editingPlan.name || !editingPlan.slug || !editingPlan.speed || !editingPlan.price}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
