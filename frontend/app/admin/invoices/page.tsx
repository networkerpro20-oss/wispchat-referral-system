'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Calendar, Users, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wispchat-referral-backend.onrender.com';

interface UploadResult {
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

export default function AdminInvoicesPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [uploadedBy, setUploadedBy] = useState('admin');
  const [result, setResult] = useState<UploadResult | null>(null);
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
      } else {
        toast.error('Solo se permiten archivos .txt o .csv');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    if (!periodStart || !periodEnd) {
      toast.error('Por favor selecciona las fechas del período');
      return;
    }

    if (new Date(periodEnd) < new Date(periodStart)) {
      toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const token = localStorage.getItem('referral_auth_token');
      if (!token) {
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.');
        return;
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('periodStart', periodStart);
      formData.append('periodEnd', periodEnd);
      formData.append('uploadedBy', uploadedBy);

      const response = await fetch(`${API_URL}/api/admin/invoices/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        toast.success('CSV procesado exitosamente');
        
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Subir Facturas (CSV)
          </h1>
          <p className="text-gray-600">
            Procesa archivos de facturas de Easy Access para generar y activar comisiones
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Upload className="w-6 h-6 text-blue-600" />
              Subir Archivo
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
                  ? 'border-blue-500 bg-blue-50' 
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
                <FileText className={`w-12 h-12 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
                
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
                      Archivos .txt o .csv (EAfacturas DDMMYY.txt)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Period Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio del Período
                </label>
                <input
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin del Período
                </label>
                <input
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subido por
                </label>
                <input
                  type="text"
                  value={uploadedBy}
                  onChange={(e) => setUploadedBy(e.target.value)}
                  placeholder="admin"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={!selectedFile || !periodStart || !periodEnd || uploading}
              className={`
                w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2
                ${!selectedFile || !periodStart || !periodEnd || uploading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
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
                  <Upload className="w-5 h-5" />
                  Subir y Procesar CSV
                </>
              )}
            </button>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
              <p className="font-semibold mb-1">ℹ️ Formato del CSV</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Delimitador: TAB (\t)</li>
                <li>Columnas: #Factura, Usuario, Cliente, Fecha Emisión, Estado, ID Servicio, Total</li>
                <li>Estado: PAID o PENDING</li>
                <li>Fechas: DD/MM/YYYY</li>
              </ul>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {result && (
              <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  <h2 className="text-xl font-semibold">Procesamiento Exitoso</h2>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <FileText className="w-5 h-5" />
                      <p className="text-sm font-medium">Total Facturas</p>
                    </div>
                    <p className="text-3xl font-bold text-blue-900">
                      {result.stats.totalInvoices}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                      <Users className="w-5 h-5" />
                      <p className="text-sm font-medium">Referidores</p>
                    </div>
                    <p className="text-3xl font-bold text-purple-900">
                      {result.stats.referrerInvoices}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-600 mb-2">
                      <Users className="w-5 h-5" />
                      <p className="text-sm font-medium">Referidos</p>
                    </div>
                    <p className="text-3xl font-bold text-green-900">
                      {result.stats.referralInvoices}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                      <DollarSign className="w-5 h-5" />
                      <p className="text-sm font-medium">Comisiones</p>
                    </div>
                    <p className="text-3xl font-bold text-orange-900">
                      {result.stats.commissionsGenerated}
                    </p>
                  </div>
                </div>

                {/* Activation Stats */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 text-emerald-700 mb-3">
                    <TrendingUp className="w-6 h-6" />
                    <h3 className="text-lg font-semibold">Comisiones Activadas</h3>
                  </div>
                  <p className="text-4xl font-bold text-emerald-900 mb-2">
                    {result.stats.commissionsActivated}
                  </p>
                  <p className="text-sm text-emerald-700">
                    Referidores están al día con sus pagos
                  </p>
                </div>

                {/* Errors */}
                {result.stats.errors && result.stats.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                      <AlertCircle className="w-5 h-5" />
                      <p className="font-semibold">Errores Encontrados</p>
                    </div>
                    <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                      {result.stats.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Upload ID */}
                <div className="text-xs text-gray-500 font-mono bg-gray-50 rounded p-2">
                  Upload ID: {result.uploadId}
                </div>
              </div>
            )}

            {/* Instructions */}
            {!result && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📋 Instrucciones
                </h3>
                <ol className="list-decimal list-inside space-y-3 text-sm text-gray-700">
                  <li>
                    <strong>Selecciona el archivo CSV</strong> (EAfacturas DDMMYY.txt)
                  </li>
                  <li>
                    <strong>Indica las fechas del período</strong> que cubre el CSV
                  </li>
                  <li>
                    <strong>Haz clic en "Subir y Procesar"</strong>
                  </li>
                  <li>
                    El sistema automáticamente:
                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                      <li>Clasifica facturas de referidores y referidos</li>
                      <li>Actualiza estado de pago de referidores</li>
                      <li>Genera comisiones mensuales</li>
                      <li>Activa comisiones si el referidor está al día</li>
                    </ul>
                  </li>
                </ol>

                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>⚡ Activación Automática:</strong> Si un referidor paga su factura,
                    todas sus comisiones EARNED cambiarán a ACTIVE automáticamente.
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
