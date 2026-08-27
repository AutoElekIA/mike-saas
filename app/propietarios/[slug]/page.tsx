'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, User, Home, Phone, Mail, FileText, 
  DollarSign, CheckCircle, Clock, Building2, 
  Edit, Save, X, Camera, Loader2 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Property {
  id: string;
  code: string;
  areaM2: number | null;
  maintenanceFee: number | null;
  type: string;
  address: string | null;
  photoUrl: string | null;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt: string | null;
  voucherUrl: string | null;
}

interface Owner {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  documentId: string | null;
  photoUrl: string | null;
  properties: {
    property: Property;
    status: string;
    ownershipSince: string;
  }[];
  payments: Payment[];
}

export default function PropietarioPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    email: '',
    phone: '',
    documentId: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!slug) return;
    fetchOwner();
  }, [slug]);

  const fetchOwner = async () => {
    try {
      const res = await fetch(`/api/propietarios/${slug}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setOwner({
        ...data,
        properties: data.properties || [],
        payments: data.payments || [],
      });
      setEditData({
        fullName: data.fullName || '',
        email: data.email || '',
        phone: data.phone || '',
        documentId: data.documentId || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
  console.log('💾 Guardando datos:', editData);
  setSaving(true);
  try {
    const res = await fetch(`/api/propietarios/${slug}/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    });
    
    console.log('📡 Respuesta status:', res.status);
    const data = await res.json();
    console.log('📡 Respuesta data:', data);
    
    if (!res.ok) throw new Error(data.error || 'Error al guardar');
    
    setOwner(prev => ({ ...prev!, ...data.person }));
    setIsEditing(false);
    alert('Datos actualizados correctamente');
  } catch (err) {
    console.error('❌ Error:', err);
    alert('Error al guardar: ' + err.message);
  } finally {
    setSaving(false);
  }
};

  const handlePhotoUpload = async (type: 'person' | 'property', id: string) => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('id', id);

    try {
      const res = await fetch('/api/upload-photo', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Error al subir foto');
      await fetchOwner();
      alert('Foto actualizada correctamente');
    } catch (err) {
      alert('Error al subir foto: ' + err.message);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-medium">Error al cargar el expediente</p>
        <p className="text-gray-500 text-sm mt-2">{error}</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Volver
        </button>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Propietario no encontrado</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Volver
        </button>
      </div>
    );
  }

  const properties = owner.properties || [];
  const payments = owner.payments || [];

  const stats = {
    totalProperties: properties.length,
    totalPaid: payments.filter(p => p.status === 'PAID').length,
    totalPending: payments.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE').length,
    totalDebt: payments
      .filter(p => p.status === 'PENDING' || p.status === 'OVERDUE')
      .reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <div className="space-y-6">
      {/* Input oculto para fotos */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".jpg,.jpeg,.png"
        className="hidden"
        onChange={() => {}}
      />

      {/* Botón volver */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Volver al directorio
      </button>

      {/* Header con foto y edición */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-6">
          {/* Foto del propietario */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              {owner.photoUrl ? (
                <img src={owner.photoUrl} alt={owner.fullName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = '.jpg,.jpeg,.png';
                  fileInputRef.current.onchange = () => handlePhotoUpload('person', owner.id);
                  fileInputRef.current.click();
                }
              }}
              className="absolute bottom-0 right-0 p-1 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors"
              disabled={uploadingPhoto}
            >
              {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editData.fullName}
                  onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre completo"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Email"
                  />
                  <input
                    type="text"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Teléfono (ej: 5551234567)"
                  />
                </div>
                <input
                  type="text"
                  value={editData.documentId || ''}
                  onChange={(e) => setEditData({ ...editData, documentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="ID / RFC"
                />
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-gray-900">{owner.fullName}</h1>
                  <button
                    onClick={() => {
                      setEditData({
                        fullName: owner.fullName || '',
                        email: owner.email || '',
                        phone: owner.phone || '',
                        documentId: owner.documentId || '',
                      });
                      setIsEditing(true);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center text-sm"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-1">
                  {owner.email && (
                    <span className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-1" />
                      {owner.email}
                    </span>
                  )}
                  {owner.phone && (
                    <span className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-1" />
                      {owner.phone}
                    </span>
                  )}
                  {owner.documentId && (
                    <span className="flex items-center text-sm text-gray-600">
                      <FileText className="w-4 h-4 mr-1" />
                      ID: {owner.documentId}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Botones de guardar/cancelar cuando está en modo edición */}
        {isEditing && (
          <div className="flex justify-end space-x-3 mt-4 pt-3 border-t border-gray-200">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditData({
                  fullName: owner.fullName || '',
                  email: owner.email || '',
                  phone: owner.phone || '',
                  documentId: owner.documentId || '',
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar
            </button>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Propiedades</p>
              <p className="text-2xl font-bold">{stats.totalProperties}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Pagos realizados</p>
              <p className="text-2xl font-bold text-green-600">{stats.totalPaid}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Pagos pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.totalPending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Deuda total</p>
              <p className="text-2xl font-bold text-red-600">${stats.totalDebt.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Propiedades con fotos */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">🏠 Propiedades</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800">Agregar propiedad</button>
        </div>
        {properties.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No tiene propiedades registradas</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {properties.map((p, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {p.property.photoUrl ? (
                    <img src={p.property.photoUrl} alt={p.property.code} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400 m-4" />
                  )}
                  <button
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = '.jpg,.jpeg,.png';
                        fileInputRef.current.onchange = () => handlePhotoUpload('property', p.property.id);
                        fileInputRef.current.click();
                      }
                    }}
                    className="absolute bottom-0 right-0 p-0.5 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div className="ml-3 flex-1">
                  <p className="font-medium text-gray-900">{p.property.code}</p>
                  <p className="text-sm text-gray-500">
                    {p.property.type} • {p.property.areaM2 || 'N/A'} m²
                  </p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      p.status === 'OWNER' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {p.status === 'OWNER' ? 'Propietario' : 'Inquilino'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Desde {p.ownershipSince ? format(new Date(p.ownershipSince), 'MMM yyyy', { locale: es }) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historial de Pagos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Historial de Pagos</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comprobante</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                    No hay pagos registrados
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {payment.dueDate ? format(new Date(payment.dueDate), 'dd/MM/yyyy') : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ${(payment.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        payment.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        payment.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status === 'PAID' ? 'Pagado' :
                         payment.status === 'OVERDUE' ? 'Vencido' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {payment.voucherUrl ? (
                        <a href={payment.voucherUrl} target="_blank" className="text-blue-600 hover:text-blue-800">
                          Ver
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}