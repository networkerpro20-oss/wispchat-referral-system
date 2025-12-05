'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle, XCircle, DollarSign, Calendar, Phone, Video } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wispchat-referral-backend.onrender.com';

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

type TabType = 'comisiones' | 'promociones' | 'contacto' | 'video';

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState<TabType>('comisiones');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('referral_auth_token');
      
      const response = await fetch(`${API_URL}/api/settings/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error cargando configuración');
      }

      const data = await response.json();
      setSettings(data.data);
    } catch (error: any) {
      showMessage('error', error.message || 'Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    try {
      setSaving(true);
      const token = localStorage.getItem('referral_auth_token');

      const response = await fetch(`${API_URL}/api/settings/admin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar');
      }

      const data = await response.json();
      setSettings(data.data);
      showMessage('success', 'Configuración guardada exitosamente');
    } catch (error: any) {
      showMessage('error', error.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const updateField = (field: keyof Settings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
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

  if (!settings) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Error al cargar la configuración
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'comisiones' as TabType, label: 'Comisiones', icon: DollarSign },
    { id: 'promociones' as TabType, label: 'Promociones', icon: Calendar },
    { id: 'contacto' as TabType, label: 'Contacto', icon: Phone },
    { id: 'video' as TabType, label: 'Video', icon: Video },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración del Sistema</h1>
        <p className="text-gray-600">
          Configura comisiones, promociones, información de contacto y más
        </p>
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

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-8">
          {/* Comisiones Tab */}
          {activeTab === 'comisiones' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comisión por Instalación ($)
                </label>
                <input
                  type="number"
                  value={settings.installationAmount}
                  onChange={(e) => updateField('installationAmount', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Comisión única que recibe el referidor al instalar un nuevo cliente</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comisión Mensual ($)
                </label>
                <input
                  type="number"
                  value={settings.monthlyAmount}
                  onChange={(e) => updateField('monthlyAmount', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.01"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Comisión mensual recurrente</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meses de Comisión
                </label>
                <input
                  type="number"
                  value={settings.monthsToEarn}
                  onChange={(e) => updateField('monthsToEarn', parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="24"
                />
                <p className="text-xs text-gray-500 mt-1">Cantidad de meses que se paga la comisión mensual (siempre que el cliente esté al día)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moneda
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="MXN">MXN (Pesos Mexicanos)</option>
                  <option value="USD">USD (Dólares)</option>
                </select>
              </div>
            </div>
          )}

          {/* Promociones Tab */}
          {activeTab === 'promociones' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="promoActive"
                  checked={settings.promoActive}
                  onChange={(e) => updateField('promoActive', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="promoActive" className="text-sm font-medium text-gray-700">
                  Activar Promoción
                </label>
              </div>

              {settings.promoActive && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Promoción
                    </label>
                    <input
                      type="text"
                      value={settings.promoName || ''}
                      onChange={(e) => updateField('promoName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: Promoción de Verano"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Inicio
                      </label>
                      <input
                        type="date"
                        value={settings.promoStartDate || ''}
                        onChange={(e) => updateField('promoStartDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Fin
                      </label>
                      <input
                        type="date"
                        value={settings.promoEndDate || ''}
                        onChange={(e) => updateField('promoEndDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comisión Instalación Promo ($)
                      </label>
                      <input
                        type="number"
                        value={settings.promoInstallAmount || ''}
                        onChange={(e) => updateField('promoInstallAmount', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        step="0.01"
                        placeholder="Opcional"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comisión Mensual Promo ($)
                      </label>
                      <input
                        type="number"
                        value={settings.promoMonthlyAmount || ''}
                        onChange={(e) => updateField('promoMonthlyAmount', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        step="0.01"
                        placeholder="Opcional"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      value={settings.promoDescription || ''}
                      onChange={(e) => updateField('promoDescription', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Descripción de la promoción"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="promoDisplayBanner"
                      checked={settings.promoDisplayBanner}
                      onChange={(e) => updateField('promoDisplayBanner', e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="promoDisplayBanner" className="text-sm font-medium text-gray-700">
                      Mostrar Banner en Landing Page
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Contacto Tab */}
          {activeTab === 'contacto' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número WhatsApp (con código país)
                </label>
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={(e) => updateField('whatsappNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5215512345678"
                />
                <p className="text-xs text-gray-500 mt-1">Formato: código país + número (sin +, espacios ni guiones)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje WhatsApp (opcional)
                </label>
                <textarea
                  value={settings.whatsappMessage || ''}
                  onChange={(e) => updateField('whatsappMessage', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Mensaje predeterminado para WhatsApp"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario Telegram
                </label>
                <input
                  type="text"
                  value={settings.telegramUser || ''}
                  onChange={(e) => updateField('telegramUser', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="@usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grupo Telegram
                </label>
                <input
                  type="text"
                  value={settings.telegramGroup || ''}
                  onChange={(e) => updateField('telegramGroup', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://t.me/grupo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={settings.phoneNumber || ''}
                  onChange={(e) => updateField('phoneNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="55 1234 5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email de Soporte
                </label>
                <input
                  type="email"
                  value={settings.supportEmail || ''}
                  onChange={(e) => updateField('supportEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="soporte@easyaccess.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horario de Atención
                </label>
                <input
                  type="text"
                  value={settings.supportHours || ''}
                  onChange={(e) => updateField('supportHours', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Lunes a Viernes 9:00 - 18:00"
                />
              </div>
            </div>
          )}

          {/* Video Tab */}
          {activeTab === 'video' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="videoEnabled"
                  checked={settings.videoEnabled}
                  onChange={(e) => updateField('videoEnabled', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="videoEnabled" className="text-sm font-medium text-gray-700">
                  Mostrar Video en Landing Page
                </label>
              </div>

              {settings.videoEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL del Video
                    </label>
                    <input
                      type="url"
                      value={settings.videoUrl || ''}
                      onChange={(e) => updateField('videoUrl', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://www.youtube.com/embed/VIDEO_ID"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      URL de YouTube (embed), Vimeo u otro servicio de video
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título del Video
                    </label>
                    <input
                      type="text"
                      value={settings.videoTitle || ''}
                      onChange={(e) => updateField('videoTitle', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Conoce nuestro servicio"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL Thumbnail (opcional)
                    </label>
                    <input
                      type="url"
                      value={settings.videoThumbnail || ''}
                      onChange={(e) => updateField('videoThumbnail', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://..."
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg transition-all"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar Configuración
            </>
          )}
        </button>
      </div>
    </div>
  );
}
