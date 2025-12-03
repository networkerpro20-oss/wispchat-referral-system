'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Upload, CheckCircle, AlertCircle, FileText, User } from 'lucide-react';
import api from '@/lib/api';

interface Referral {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  referrerName: string;
  documents: any[];
}

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const shareUrl = params.shareUrl as string;

  const [referral, setReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'info' | 'documents' | 'complete'>('info');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  // Documentos
  const [ineFile, setIneFile] = useState<File | null>(null);
  const [proofAddressFile, setProofAddressFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadReferral();
  }, [shareUrl]);

  const loadReferral = async () => {
    try {
      const response = await api.get(`/referrals/share/${shareUrl}`);
      setReferral(response.data.data);
      
      // Si ya tiene datos, pre-llenar formulario
      if (response.data.data.name !== 'Pendiente') {
        setFormData({
          name: response.data.data.name,
          email: response.data.data.email,
          phone: response.data.data.phone,
          address: response.data.data.address,
          city: response.data.data.city || '',
          state: response.data.data.state || '',
          zipCode: response.data.data.zipCode || '',
        });
        
        // Si ya hay documentos, ir a step de documentos
        if (response.data.data.documents.length > 0) {
          setStep('documents');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar el referido');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Por ahora solo avanzar a step de documentos
    // En producción, actualizarías el referido aquí
    setStep('documents');
  };

  const handleFileUpload = async (file: File, type: 'INE' | 'PROOF_ADDRESS') => {
    if (!referral) return;
    
    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      
      await api.post(`/documents/${referral.id}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess(`${type === 'INE' ? 'INE' : 'Comprobante de domicilio'} subido correctamente`);
      
      // Recargar referral
      await loadReferral();
      
      // Si ambos documentos están subidos, marcar como completo
      const hasINE = referral.documents.some((d: any) => d.type === 'INE') || type === 'INE';
      const hasProof = referral.documents.some((d: any) => d.type === 'PROOF_ADDRESS') || type === 'PROOF_ADDRESS';
      
      if (hasINE && hasProof) {
        setTimeout(() => {
          setStep('complete');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Enlace No Encontrado
          </h2>
          <p className="text-gray-600">
            El enlace de referido no existe o ha expirado.
          </p>
        </div>
      </div>
    );
  }

  const hasINE = referral.documents.some((d: any) => d.type === 'INE');
  const hasProof = referral.documents.some((d: any) => d.type === 'PROOF_ADDRESS');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registro de Nuevo Cliente
          </h1>
          <p className="text-gray-600">
            Recomendado por: <span className="font-semibold">{referral.referrerName}</span>
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'info' ? 'text-blue-600' : 'text-gray-400'}`}>
              <User className="w-5 h-5" />
              <span className="font-medium">Información</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step === 'documents' ? 'text-blue-600' : 'text-gray-400'}`}>
              <FileText className="w-5 h-5" />
              <span className="font-medium">Documentos</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Completo</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          )}

          {step === 'info' && (
            <form onSubmit={handleInfoSubmit}>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Información Personal
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-8 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                Continuar a Documentos
              </button>
            </form>
          )}

          {step === 'documents' && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Subir Documentos Requeridos
              </h2>

              <div className="space-y-6">
                {/* INE */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    INE (Identificación Oficial) *
                  </label>
                  {hasINE ? (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span>INE subida correctamente</span>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIneFile(file);
                            handleFileUpload(file, 'INE');
                          }
                        }}
                        disabled={uploading}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Formatos aceptados: JPG, PNG, PDF (máx. 5MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* Comprobante de Domicilio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comprobante de Domicilio *
                  </label>
                  {hasProof ? (
                    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span>Comprobante subido correctamente</span>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setProofAddressFile(file);
                            handleFileUpload(file, 'PROOF_ADDRESS');
                          }
                        }}
                        disabled={uploading}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Recibo de luz, agua, teléfono, etc. (máx. 3 meses de antigüedad)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {uploading && (
                <div className="mt-6 flex items-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span>Subiendo archivo...</span>
                </div>
              )}
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center py-8">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ¡Registro Completo!
              </h2>
              <p className="text-gray-600 mb-8">
                Tu solicitud ha sido recibida. Nuestro equipo la revisará y se
                pondrá en contacto contigo para agendar la instalación.
              </p>
              <div className="p-6 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Próximos pasos:</strong>
                </p>
                <ul className="text-left text-sm text-gray-600 mt-2 space-y-1">
                  <li>• Revisión de documentos (1-2 días hábiles)</li>
                  <li>• Contacto para agendar instalación</li>
                  <li>• Instalación del servicio</li>
                  <li>• Activación de tu cuenta</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
