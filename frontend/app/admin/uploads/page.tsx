'use client';

import { useState, useEffect } from 'react';
import { FileText, Calendar, User, TrendingUp, RefreshCw, Eye, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wispchat-referral-backend.onrender.com';

interface InvoiceUpload {
  id: string;
  fileName: string;
  uploadedBy: string;
  periodStart: string;
  periodEnd: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalInvoices: number;
  referrerInvoices: number;
  referralInvoices: number;
  commissionsGenerated: number;
  commissionsActivated: number;
  errors: string[];
  createdAt: string;
}

interface UploadDetails extends InvoiceUpload {
  invoiceRecords: {
    id: string;
    invoiceNumber: string;
    clientName: string;
    amount: number;
    status: string;
    isReferrer: boolean;
    isReferral: boolean;
  }[];
}

export default function AdminUploadsPage() {
  const [uploads, setUploads] = useState<InvoiceUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUpload, setSelectedUpload] = useState<UploadDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [reprocessing, setReprocessing] = useState<string | null>(null);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/invoices/uploads`);
      const data = await response.json();
      
      if (data.success) {
        setUploads(data.data);
      } else {
        throw new Error(data.error?.message || 'Error al cargar uploads');
      }
    } catch (error: any) {
      console.error('Error fetching uploads:', error);
      toast.error('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadDetails = async (uploadId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/invoices/uploads/${uploadId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedUpload(data.data);
        setShowModal(true);
      } else {
        throw new Error(data.error?.message || 'Error al cargar detalles');
      }
    } catch (error: any) {
      console.error('Error fetching upload details:', error);
      toast.error('Error al cargar detalles');
    }
  };

  const handleReprocess = async (uploadId: string) => {
    if (!confirm('¿Estás seguro de reprocesar este upload? Esto puede generar comisiones duplicadas.')) {
      return;
    }

    setReprocessing(uploadId);
    try {
      const response = await fetch(`${API_URL}/api/admin/invoices/uploads/${uploadId}/reprocess`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Upload reprocesado exitosamente');
        fetchUploads();
        if (selectedUpload?.id === uploadId) {
          fetchUploadDetails(uploadId);
        }
      } else {
        throw new Error(data.error?.message || 'Error al reprocesar');
      }
    } catch (error: any) {
      console.error('Error reprocessing upload:', error);
      toast.error(error.message || 'Error al reprocesar');
    } finally {
      setReprocessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FAILED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Historial de Uploads
            </h1>
            <p className="text-gray-600">
              Registro de todos los archivos CSV procesados
            </p>
          </div>
          <button
            onClick={fetchUploads}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : uploads.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No hay uploads registrados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {upload.fileName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(upload.status)}`}>
                        {upload.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{upload.uploadedBy}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {new Date(upload.periodStart).toLocaleDateString()} - {new Date(upload.periodEnd).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{upload.totalInvoices} facturas</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{upload.commissionsGenerated} comisiones</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => fetchUploadDetails(upload.id)}
                      className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg flex items-center gap-1.5 text-sm transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalles
                    </button>
                    {upload.status === 'FAILED' && (
                      <button
                        onClick={() => handleReprocess(upload.id)}
                        disabled={reprocessing === upload.id}
                        className="px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg flex items-center gap-1.5 text-sm transition-colors disabled:opacity-50"
                      >
                        {reprocessing === upload.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Reprocesar
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{upload.referrerInvoices}</p>
                    <p className="text-xs text-gray-500">Referidores</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{upload.referralInvoices}</p>
                    <p className="text-xs text-gray-500">Referidos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{upload.commissionsGenerated}</p>
                    <p className="text-xs text-gray-500">Generadas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">{upload.commissionsActivated}</p>
                    <p className="text-xs text-gray-500">Activadas</p>
                  </div>
                </div>

                {/* Errors */}
                {upload.errors && upload.errors.length > 0 && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-600 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      <p className="text-sm font-semibold">{upload.errors.length} error(es)</p>
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <p className="text-xs text-gray-400 mt-4">
                  Subido el {formatDate(upload.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {selectedUpload.fileName}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Upload ID: {selectedUpload.id}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-3xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1">Total Facturas</p>
                  <p className="text-3xl font-bold text-blue-900">{selectedUpload.totalInvoices}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1">Comisiones Generadas</p>
                  <p className="text-3xl font-bold text-green-900">{selectedUpload.commissionsGenerated}</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <p className="text-sm text-emerald-600 mb-1">Comisiones Activadas</p>
                  <p className="text-3xl font-bold text-emerald-900">{selectedUpload.commissionsActivated}</p>
                </div>
              </div>

              {/* Errors */}
              {selectedUpload.errors && selectedUpload.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-red-900 mb-2">Errores Encontrados</h3>
                  <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                    {selectedUpload.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Invoice Records Table */}
              {selectedUpload.invoiceRecords && selectedUpload.invoiceRecords.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Registros Procesados ({selectedUpload.invoiceRecords.length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Factura #</th>
                          <th className="px-4 py-2 text-left">Cliente</th>
                          <th className="px-4 py-2 text-right">Monto</th>
                          <th className="px-4 py-2 text-center">Estado</th>
                          <th className="px-4 py-2 text-center">Tipo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedUpload.invoiceRecords.slice(0, 50).map((record) => (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-mono text-xs">{record.invoiceNumber}</td>
                            <td className="px-4 py-2">{record.clientName}</td>
                            <td className="px-4 py-2 text-right font-semibold">
                              ${record.amount.toFixed(2)}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className={`px-2 py-1 rounded text-xs ${
                                record.status === 'PAID' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {record.status}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center">
                              {record.isReferrer && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                  Referidor
                                </span>
                              )}
                              {record.isReferral && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs ml-1">
                                  Referido
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {selectedUpload.invoiceRecords.length > 50 && (
                      <p className="text-sm text-gray-500 mt-2 text-center">
                        Mostrando 50 de {selectedUpload.invoiceRecords.length} registros
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
