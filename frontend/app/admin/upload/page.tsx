'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Users, FileUp, Database, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wispchat-referral-backend.onrender.com';

type UploadType = 'clients' | 'invoices';

interface ClientUploadResult {
  stats: {
    total: number;
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
  };
}

interface InvoiceUploadResult {
  uploadId: string;
  stats: {
    totalInvoices: number;
    referrerInvoices: number;
    referralInvoices: number;
    commissionsGenerated: number;
    commissionsActivated: number;
    errors: string[];
  };
}

export default function AdminUploadPage() {
  const [uploadType, setUploadType] = useState<UploadType>('clients');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [clientResult, setClientResult] = useState<ClientUploadResult | null>(null);
  const [invoiceResult, setInvoiceResult] = useState<InvoiceUploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
        setSelectedFile(file);
        // Auto-detect upload type from file name
        if (file.name.toLowerCase().includes('cliente')) {
          setUploadType('clients');
        } else if (file.name.toLowerCase().includes('factura')) {
          setUploadType('invoices');
        }
      } else {
        toast.error('Solo se permiten archivos .txt o .csv');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto-detect upload type from file name
      if (file.name.toLowerCase().includes('cliente')) {
        setUploadType('clients');
      } else if (file.name.toLowerCase().includes('factura')) {
        setUploadType('invoices');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    if (uploadType === 'invoices' && (!periodStart || !periodEnd)) {
      toast.error('Por favor selecciona las fechas del período para facturas');
      return;
    }

    if (uploadType === 'invoices' && new Date(periodEnd) < new Date(periodStart)) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    setUploading(true);
    setClientResult(null);
    setInvoiceResult(null);

    try {
      const token = localStorage.getItem('referral_auth_token');
      if (!token) {
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
        window.location.href = '/easyaccess';
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      
      let endpoint: string;
      if (uploadType === 'clients') {
        endpoint = '/api/admin/clients/upload';
        formData.append('uploadedBy', 'admin');
      } else {
        endpoint = '/api/admin/invoices/upload';
        formData.append('periodStart', periodStart);
        formData.append('periodEnd', periodEnd);
        formData.append('uploadedBy', 'admin');
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        if (uploadType === 'clients') {
          setClientResult(data.data);
        } else {
          setInvoiceResult(data.data);
        }
        toast.success(`${uploadType === 'clients' ? 'Clientes' : 'Facturas'} procesadas exitosamente`);
        
        // Limpiar form
        setSelectedFile(null);
        setPeriodStart('');
        setPeriodEnd('');
        
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(data.error?.message || 'Error al procesar CSV');
      }
    } catch (error: any) {
      console.error('Error uploading CSV:', error);
      toast.error(error.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const resetResults = () => {
    setClientResult(null);
    setInvoiceResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/admin" className="text-blue-600 hover:text-blue-800">
              ← Panel Admin
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📤 Importar Datos (CSV)
          </h1>
          <p className="text-gray-600">
            Sube archivos de WispHub para sincronizar clientes y procesar facturas
          </p>
        </div>

        {/* Upload Type Selector */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Selecciona el tipo de archivo</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setUploadType('clients'); resetResults(); }}
              className={`p-6 rounded-xl border-2 transition-all ${
                uploadType === 'clients'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <Users className={`w-10 h-10 mx-auto mb-3 ${uploadType === 'clients' ? 'text-blue-600' : 'text-gray-400'}`} />
              <h3 className={`font-semibold ${uploadType === 'clients' ? 'text-blue-900' : 'text-gray-700'}`}>
                Clientes (EAClientes)
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Importa/actualiza lista de clientes
              </p>
            </button>

            <button
              onClick={() => { setUploadType('invoices'); resetResults(); }}
              className={`p-6 rounded-xl border-2 transition-all ${
                uploadType === 'invoices'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <FileText className={`w-10 h-10 mx-auto mb-3 ${uploadType === 'invoices' ? 'text-green-600' : 'text-gray-400'}`} />
              <h3 className={`font-semibold ${uploadType === 'invoices' ? 'text-green-900' : 'text-gray-700'}`}>
                Facturas (EAfacturas)
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Procesa pagos y genera comisiones
              </p>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Upload className={`w-6 h-6 ${uploadType === 'clients' ? 'text-blue-600' : 'text-green-600'}`} />
              Subir {uploadType === 'clients' ? 'Clientes' : 'Facturas'}
            </h2>

            {/* File Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer
                ${dragActive 
                  ? uploadType === 'clients' ? 'border-blue-500 bg-blue-50' : 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }
              `}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".txt,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="flex flex-col items-center gap-3">
                <FileUp className={`w-12 h-12 ${
                  dragActive 
                    ? uploadType === 'clients' ? 'text-blue-500' : 'text-green-500'
                    : 'text-gray-400'
                }`} />
                
                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="text-xs text-red-600 hover:text-red-700 underline"
                    >
                      Cambiar archivo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-700">
                      Arrastra tu archivo aquí o haz clic para seleccionar
                    </p>
                    <p className="text-xs text-gray-500">
                      {uploadType === 'clients' 
                        ? 'EAClientes DDMMYY.txt' 
                        : 'EAfacturas DDMMYY.txt'
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Period Selection (only for invoices) */}
            {uploadType === 'invoices' && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Período de las facturas</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || (uploadType === 'invoices' && (!periodStart || !periodEnd)) || uploading}
              className={`
                w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                ${!selectedFile || (uploadType === 'invoices' && (!periodStart || !periodEnd)) || uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : uploadType === 'clients'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                }
              `}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Database className="w-5 h-5" />
                  {uploadType === 'clients' ? 'Importar Clientes' : 'Procesar Facturas'}
                </>
              )}
            </button>

            {/* Info Box */}
            <div className={`border rounded-lg p-4 text-sm ${
              uploadType === 'clients' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-green-50 border-green-200 text-green-800'
            }`}>
              <p className="font-semibold mb-2">ℹ️ Formato esperado</p>
              {uploadType === 'clients' ? (
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Delimitador: TAB (\t)</li>
                  <li>Columnas: ID Servicio, Cliente, Email, Telefono, Usuario</li>
                  <li>El ID Servicio será el identificador único del cliente</li>
                </ul>
              ) : (
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Delimitador: TAB (\t)</li>
                  <li>Columnas: #Factura, Cliente, Fecha Pago, Estado, ID Servicio, Total</li>
                  <li>Estado: "Pagada" o "Pendiente de pago"</li>
                </ul>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Client Upload Results */}
            {clientResult && (
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="flex items-center gap-2 text-blue-600">
                  <CheckCircle className="w-6 h-6" />
                  <h2 className="text-xl font-semibold">Importación de Clientes Exitosa</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <p className="text-sm font-medium text-blue-600 mb-1">Total Procesados</p>
                    <p className="text-3xl font-bold text-blue-900">{clientResult.stats.total}</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <p className="text-sm font-medium text-green-600 mb-1">Nuevos Creados</p>
                    <p className="text-3xl font-bold text-green-900">{clientResult.stats.created}</p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <p className="text-sm font-medium text-purple-600 mb-1">Actualizados</p>
                    <p className="text-3xl font-bold text-purple-900">{clientResult.stats.updated}</p>
                  </div>

                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-600 mb-1">Omitidos</p>
                    <p className="text-3xl font-bold text-gray-900">{clientResult.stats.skipped}</p>
                  </div>
                </div>

                {clientResult.stats.errors && clientResult.stats.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <p className="font-semibold">Errores ({clientResult.stats.errors.length})</p>
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-800 space-y-1 max-h-32 overflow-y-auto">
                      {clientResult.stats.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Invoice Upload Results */}
            {invoiceResult && (
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  <h2 className="text-xl font-semibold">Facturas Procesadas Exitosamente</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <FileText className="w-5 h-5" />
                      <p className="text-sm font-medium">Total Facturas</p>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">
                      {invoiceResult.stats.totalInvoices}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                      <Users className="w-5 h-5" />
                      <p className="text-sm font-medium">Referidores</p>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">
                      {invoiceResult.stats.referrerInvoices}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <Users className="w-5 h-5" />
                      <p className="text-sm font-medium">Referidos</p>
                    </div>
                    <p className="text-3xl font-bold text-green-900">
                      {invoiceResult.stats.referralInvoices}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                      <DollarSign className="w-5 h-5" />
                      <p className="text-sm font-medium">Comisiones</p>
                    </div>
                    <p className="text-3xl font-bold text-orange-900">
                      {invoiceResult.stats.commissionsGenerated}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-emerald-700 mb-3">
                    <TrendingUp className="w-6 h-6" />
                    <h3 className="text-lg font-semibold">Comisiones Activadas</h3>
                  </div>
                  <p className="text-4xl font-bold text-emerald-900 mb-2">
                    {invoiceResult.stats.commissionsActivated}
                  </p>
                  <p className="text-sm text-emerald-700">
                    Referidores están al día con sus pagos
                  </p>
                </div>

                {invoiceResult.stats.errors && invoiceResult.stats.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <p className="font-semibold">Errores Encontrados</p>
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-800 space-y-1 max-h-32 overflow-y-auto">
                      {invoiceResult.stats.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-xs text-gray-500 font-mono bg-gray-50 rounded p-2">
                  Upload ID: {invoiceResult.uploadId}
                </div>
              </div>
            )}

            {/* Instructions (when no results) */}
            {!clientResult && !invoiceResult && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📋 Proceso de Importación
                </h3>
                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-blue-900 mb-2">1️⃣ Primero: Importar Clientes</h4>
                    <p className="text-sm text-gray-600">
                      Sube el archivo <strong>EAClientes</strong> para registrar todos los clientes de WispHub en el sistema de referidos.
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-green-900 mb-2">2️⃣ Después: Procesar Facturas</h4>
                    <p className="text-sm text-gray-600">
                      Sube el archivo <strong>EAfacturas</strong> para actualizar estados de pago y generar/activar comisiones.
                    </p>
                  </div>
                </div>

                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>⚡ Importante:</strong> El "ID Servicio" del CSV de facturas debe coincidir con el "ID Servicio" del CSV de clientes para que el sistema pueda vincularlos correctamente.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
