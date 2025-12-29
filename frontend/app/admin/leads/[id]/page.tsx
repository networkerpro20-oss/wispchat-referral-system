'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  FileText,
  DollarSign,
  Edit,
  Save,
  X as CloseIcon,
  Loader2,
  ChevronRight
} from 'lucide-react';

import { API_URL } from '@/lib/apiConfig';

interface Referral {
  id: string;
  nombre: string;
  telefono: string;
  email: string | null;
  direccion: string | null;
  colonia: string | null;
  ciudad: string | null;
  codigoPostal: string | null;
  tipoServicio: string | null;
  velocidad: string | null;
  status: 'PENDING' | 'CONTACTED' | 'INSTALLED' | 'REJECTED';
  fechaContacto: string | null;
  fechaInstalacion: string | null;
  wispChatClientId: string | null;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    nombre: string;
    email: string;
    referralCode: string;
    isPaymentCurrent: boolean;
  };
  commissions: Array<{
    id: string;
    type: string;
    amount: number;
    status: string;
    monthNumber: number | null;
    createdAt: string;
  }>;
}

interface TimelineEvent {
  date: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;}

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [editForm, setEditForm] = useState({
    status: '',
    notas: ''
  });

  useEffect(() => {
    checkAuth();
    if (leadId) loadLead();
  }, [leadId]);

  const checkAuth = () => {
    const token = localStorage.getItem('referral_auth_token');
    if (!token) {
      router.push('/admin/auth');
    }
  };

  const loadLead = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('referral_auth_token');
      
      const response = await fetch(`${API_URL}/admin/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLead(data.data);
        setEditForm({
          status: data.data.status,
          notas: data.data.notas || ''
        });
      }
    } catch (error) {
      console.error('Error loading lead:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('referral_auth_token');
      
      const response = await fetch(`${API_URL}/admin/leads/${leadId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          notas: newNote || undefined
        })
      });
      
      if (response.ok) {
        await loadLead();
        setNewNote('');
        alert('Estado actualizado correctamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'No se pudo actualizar'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    } finally {
      setSaving(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      setSaving(true);
      const token = localStorage.getItem('referral_auth_token');
      
      const response = await fetch(`${API_URL}/admin/leads/${leadId}/note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ note: newNote })
      });
      
      if (response.ok) {
        await loadLead();
        setNewNote('');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setSaving(false);
    }
  };

  const buildTimeline = (): TimelineEvent[] => {
    if (!lead) return [];
    
    const events: TimelineEvent[] = [
      {
        date: lead.createdAt,
        title: 'Lead Registrado',
        description: `${lead.nombre} se registró a través del link de referido`,
        icon: <User className="w-4 h-4" />,
        color: 'blue'
      }
    ];

    if (lead.fechaContacto) {
      events.push({
        date: lead.fechaContacto,
        title: 'Contactado',
        description: 'El lead fue contactado por el equipo de ventas',
        icon: <Phone className="w-4 h-4" />,
        color: 'yellow'
      });
    }

    if (lead.fechaInstalacion) {
      events.push({
        date: lead.fechaInstalacion,
        title: 'Instalación Completada',
        description: `Servicio instalado. ID WispChat: ${lead.wispChatClientId || 'N/A'}`,
        icon: <CheckCircle className="w-4 h-4" />,
        color: 'green'
      });
    }

    if (lead.status === 'REJECTED') {
      events.push({
        date: lead.updatedAt,
        title: 'Lead Rechazado',
        description: 'El lead fue rechazado (sin cobertura u otro motivo)',
        icon: <XCircle className="w-4 h-4" />,
        color: 'red'
      });
    }

    // Agregar comisiones al timeline
    lead.commissions?.forEach(comm => {
      events.push({
        date: comm.createdAt,
        title: comm.type === 'INSTALLATION' ? 'Comisión de Instalación' : `Comisión Mensual #${comm.monthNumber}`,
        description: `$${comm.amount} MXN - Estado: ${comm.status}`,
        icon: <DollarSign className="w-4 h-4" />,
        color: comm.status === 'ACTIVE' ? 'green' : comm.status === 'APPLIED' ? 'blue' : 'gray'
      });
    });

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
      PENDING: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        icon: <Clock className="w-5 h-5" />,
        label: 'Pendiente'
      },
      CONTACTED: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        icon: <Phone className="w-5 h-5" />,
        label: 'Contactado'
      },
      INSTALLED: { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        icon: <CheckCircle className="w-5 h-5" />,
        label: 'Instalado'
      },
      REJECTED: { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        icon: <XCircle className="w-5 h-5" />,
        label: 'Rechazado'
      }
    };
    return configs[status] || configs.PENDING;
  };

  const getTimelineColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      yellow: 'bg-yellow-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      gray: 'bg-gray-400'
    };
    return colors[color] || 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lead no encontrado</h2>
          <Link href="/admin/clientes" className="text-blue-600 hover:underline">
            Volver a clientes
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(lead.status);
  const timeline = buildTimeline();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/clientes" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Link href="/admin" className="hover:text-blue-600">Admin</Link>
                  <ChevronRight className="w-4 h-4" />
                  <Link href="/admin/clientes" className="hover:text-blue-600">Clientes</Link>
                  <ChevronRight className="w-4 h-4" />
                  <span>Detalle Lead</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{lead.nombre}</h1>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
              {statusConfig.icon}
              <span className="font-medium">{statusConfig.label}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información del Lead */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Información del Lead
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Teléfono</div>
                      <div className="font-medium">{lead.telefono}</div>
                    </div>
                  </div>
                  
                  {lead.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium">{lead.email}</div>
                      </div>
                    </div>
                  )}
                  
                  {lead.direccion && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Dirección</div>
                        <div className="font-medium">{lead.direccion}</div>
                        {lead.colonia && <div className="text-sm text-gray-600">{lead.colonia}</div>}
                        {lead.ciudad && <div className="text-sm text-gray-600">{lead.ciudad} {lead.codigoPostal}</div>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {lead.tipoServicio && (
                    <div>
                      <div className="text-sm text-gray-500">Tipo de Servicio</div>
                      <div className="font-medium capitalize">{lead.tipoServicio}</div>
                    </div>
                  )}
                  
                  {lead.velocidad && (
                    <div>
                      <div className="text-sm text-gray-500">Velocidad</div>
                      <div className="font-medium">{lead.velocidad}</div>
                    </div>
                  )}
                  
                  <div>
                    <div className="text-sm text-gray-500">Fecha de Registro</div>
                    <div className="font-medium">
                      {new Date(lead.createdAt).toLocaleDateString('es-MX', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Historial / Timeline
              </h2>
              
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                <div className="space-y-6">
                  {timeline.map((event, idx) => (
                    <div key={idx} className="relative flex gap-4 ml-4">
                      <div className={`absolute -left-4 w-8 h-8 rounded-full ${getTimelineColor(event.color)} flex items-center justify-center text-white z-10`}>
                        {event.icon}
                      </div>
                      <div className="ml-6 pt-1">
                        <div className="text-sm text-gray-500">
                          {new Date(event.date).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="font-medium text-gray-900">{event.title}</div>
                        <div className="text-sm text-gray-600">{event.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                Notas
              </h2>
              
              {lead.notas && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 whitespace-pre-wrap text-sm text-gray-700">
                  {lead.notas}
                </div>
              )}
              
              <div className="flex gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Agregar una nota..."
                  rows={3}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
              <button
                onClick={addNote}
                disabled={saving || !newNote.trim()}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Agregar Nota'}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Referidor */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Referidor</h2>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {lead.client.nombre.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{lead.client.nombre}</div>
                  <div className="text-sm text-gray-600">{lead.client.email}</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-sm text-gray-600">Código</span>
                <span className="font-mono text-blue-600">{lead.client.referralCode}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-t">
                <span className="text-sm text-gray-600">Estado Pago</span>
                {lead.client.isPaymentCurrent ? (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Al día
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Con adeudo
                  </span>
                )}
              </div>
            </div>

            {/* Cambiar Estado */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Estado</h2>
              
              <div className="space-y-2">
                {['PENDING', 'CONTACTED', 'INSTALLED', 'REJECTED'].map(status => {
                  const config = getStatusConfig(status);
                  const isActive = lead.status === status;
                  
                  return (
                    <button
                      key={status}
                      onClick={() => updateStatus(status)}
                      disabled={saving || isActive}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-colors ${
                        isActive 
                          ? `${config.bg} ${config.text} border-current` 
                          : 'hover:bg-gray-50 border-gray-200'
                      } disabled:opacity-50`}
                    >
                      {config.icon}
                      <span className="font-medium">{config.label}</span>
                      {isActive && <CheckCircle className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comisiones */}
            {lead.commissions?.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Comisiones
                </h2>
                
                <div className="space-y-3">
                  {lead.commissions.map(comm => (
                    <div key={comm.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <div className="font-medium text-sm">
                          {comm.type === 'INSTALLATION' ? 'Instalación' : `Mensual #${comm.monthNumber}`}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(comm.createdAt).toLocaleDateString('es-MX')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${comm.amount}</div>
                        <div className={`text-xs ${
                          comm.status === 'ACTIVE' ? 'text-green-600' : 
                          comm.status === 'APPLIED' ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {comm.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Total</span>
                    <span className="text-xl font-bold text-green-600">
                      ${lead.commissions.reduce((sum, c) => sum + c.amount, 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
