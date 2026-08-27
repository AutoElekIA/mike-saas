'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, Calendar, CheckCircle, AlertCircle, Clock, 
  Search, Eye, Upload, X, Check, FileCheck, FileX,
  TrendingUp, TrendingDown, Filter
} from 'lucide-react';
import RouteGuard from '@/app/components/auth/RouteGuard';

interface Payment {
  id: string;
  amount: number;
  status: string;
  dueDate: string;
  paidAt: string | null;
  voucherUrl: string | null;
  voucherVerified: boolean;
  verificationNotes: string | null;
  propertyOwner: {
    person: { fullName: string };
    property: { code: string };
  };
}

function CobranzaContent() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchPayments();
  }, [selectedMonth]);

  const fetchPayments = async () => {
    try {
      const res = await fetch(`/api/cobranza?month=${selectedMonth}`);
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !selectedPayment) {
      alert('No hay archivo seleccionado');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('paymentId', selectedPayment.id);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Comprobante subido correctamente. Pendiente de verificación.');
        setShowUploadModal(false);
        setSelectedFile(null);
        fetchPayments();
      } else {
        alert('Error: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      alert('Error al subir comprobante');
    } finally {
      setUploading(false);
    }
  };

  const handleVerify = async (paymentId: string, approved: boolean) => {
    const notes = approved ? 'Comprobante verificado y aprobado' : 'Comprobante rechazado';
    
    try {
      const res = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, approved, notes }),
      });
      const data = await res.json();
      
      if (data.success) {
        alert(data.message);
        fetchPayments();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error al verificar pago');
    }
  };

  // Filtrar pagos
  const filteredPayments = payments.filter(payment => {
    // Filtro por estado
    if (filterStatus !== 'all' && payment.status !== filterStatus) {
      return false;
    }
    // Filtro por búsqueda
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        payment.propertyOwner?.property?.code?.toLowerCase().includes(searchLower) ||
        payment.propertyOwner?.person?.fullName?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const stats = {
    total: payments.length,
    paid: payments.filter(p => p.status === 'PAID').length,
    pending: payments.filter(p => p.status === 'PENDING').length,
    overdue: payments.filter(p => p.status === 'OVERDUE').length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    paidAmount: payments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE').reduce((sum, p) => sum + p.amount, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">💰 Cobranza</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gestión de cuotas y pagos con comprobantes</p>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button 
            onClick={() => window.location.href = '/api/cobranza/export'}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            📥 Exportar
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Pagadas</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.paid}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Vencidas</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.overdue}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Recaudado</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${stats.paidAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <TrendingDown className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Por cobrar</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${stats.pendingAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Buscador y filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por casa o propietario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="all">Todos los estados</option>
          <option value="PENDING">Pendientes</option>
          <option value="OVERDUE">Vencidas</option>
          <option value="PAID">Pagadas</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Casa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Propietario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Vencimiento</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Comprobante</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {payment.propertyOwner?.property?.code || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {payment.propertyOwner?.person?.fullName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    ${payment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                    {new Date(payment.dueDate).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      payment.status === 'PAID' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                      payment.status === 'OVERDUE' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {payment.status === 'PAID' ? 'Pagada' :
                       payment.status === 'OVERDUE' ? 'Vencida' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {payment.voucherUrl && (
                      <div className="flex items-center space-x-2">
                        <a href={payment.voucherUrl} target="_blank" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                          <Eye className="w-5 h-5" />
                        </a>
                        {payment.voucherVerified ? (
                          <FileCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <FileX className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        )}
                      </div>
                    )}
                    {!payment.voucherUrl && payment.status !== 'PAID' && (
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowUploadModal(true);
                        }}
                        className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <Upload className="w-5 h-5" />
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {payment.voucherUrl && !payment.voucherVerified && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleVerify(payment.id, true)}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                          title="Aprobar pago"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleVerify(payment.id, false)}
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                          title="Rechazar pago"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {payment.status === 'PAID' && (
                      <span className="text-xs text-green-600 dark:text-green-400">✓ Verificado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="mt-2 text-gray-500 dark:text-gray-400">No hay pagos para mostrar</p>
        </div>
      )}

      {/* Modal de subida */}
      {showUploadModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📤 Subir Comprobante</h2>
            <div className="mb-4 space-y-1">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Casa: <span className="font-medium text-gray-900 dark:text-white">{selectedPayment.propertyOwner?.property?.code}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Propietario: <span className="font-medium text-gray-900 dark:text-white">{selectedPayment.propertyOwner?.person?.fullName}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Monto: <span className="font-medium text-gray-900 dark:text-white">${selectedPayment.amount.toFixed(2)}</span>
              </p>
            </div>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setSelectedFile(file);
                }}
                accept=".jpg,.jpeg,.png,.pdf"
                className="w-full"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-green-600 dark:text-green-400">✅ {selectedFile.name}</p>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Formatos: JPG, PNG, PDF (Máx 5MB)</p>
            </div>
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFile(null);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleFileUpload}
                disabled={!selectedFile || uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Subiendo...' : 'Subir Comprobante'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CobranzaPage() {
  return (
    <RouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <CobranzaContent />
    </RouteGuard>
  );
}