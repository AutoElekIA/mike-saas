'use client';

import { useState, useEffect } from 'react';
import { 
  Copy, Check, QrCode, ExternalLink, 
  Building2, User, DollarSign, Calendar,
  ArrowLeft, Smartphone, Banknote, Clock,
  AlertCircle, Shield, CheckCircle, Loader2
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useRouter } from 'next/navigation';
import RouteGuard from '@/app/components/auth/RouteGuard';

interface PaymentData {
  id: string;
  amount: number;
  dueDate: string;
  propertyCode: string;
  ownerName: string;
  status: string;
}

// Datos de la cuenta receptora (configurables)
const RECEIVER_DATA = {
  bank: 'BBVA',
  accountName: 'Condominios del Valle S.C.',
  accountNumber: '0123456789',
  clabe: '012345678901234567',
  reference: 'CONDOMINIO',
  concept: 'Cuota de Mantenimiento',
};

function PagoRapidoContent() {
  const router = useRouter();
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<'clabe' | 'account' | 'reference' | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('');
  const [payments, setPayments] = useState<PaymentData[]>([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/cobranza?month=' + new Date().toISOString().slice(0, 7));
      const data = await res.json();
      const pending = data.filter((p: any) => p.status === 'PENDING' || p.status === 'OVERDUE');
      setPayments(pending);
      if (pending.length > 0) {
        setSelectedPaymentId(pending[0].id);
        setPayment(pending[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handlePaymentSelect = (paymentId: string) => {
    const selected = payments.find(p => p.id === paymentId);
    if (selected) {
      setSelectedPaymentId(paymentId);
      setPayment(selected);
    }
  };

  const copyToClipboard = async (text: string, type: 'clabe' | 'account' | 'reference') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
    }
  };

  const getBankAppLink = (clabe: string) => {
    const links: Record<string, string> = {
      'BBVA': `https://www.bbva.mx/transferencias/${clabe}`,
      'Banamex': `https://www.banamex.com/transferencias/${clabe}`,
      'Santander': `https://www.santander.com.mx/transferencias/${clabe}`,
    };
    return links[RECEIVER_DATA.bank] || `https://www.google.com/search?q=transferencia+${clabe}`;
  };

  const handleOpenBankApp = () => {
    const url = getBankAppLink(RECEIVER_DATA.clabe);
    window.open(url, '_blank');
  };

  const getQrData = () => {
    return `SPEI*${RECEIVER_DATA.clabe}*${RECEIVER_DATA.accountName}*${payment?.amount || 0}*${RECEIVER_DATA.concept}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">¡Sin pagos pendientes!</h2>
        <p className="text-gray-500 dark:text-gray-400">No tienes cuotas pendientes por pagar</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Volver al Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">💳 Pago Rápido</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Realiza tu pago de forma sencilla y rápida</p>
        </div>
      </div>

      {/* Selector de pago */}
      {payments.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Selecciona la cuota a pagar:
          </label>
          <select
            value={selectedPaymentId}
            onChange={(e) => handlePaymentSelect(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {payments.map((p) => (
              <option key={p.id} value={p.id}>
                {p.propertyCode} - ${p.amount.toFixed(2)} ({p.status === 'OVERDUE' ? 'Vencido' : 'Pendiente'})
              </option>
            ))}
          </select>
        </div>
      )}

      {payment && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información del pago */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📋 Detalle del Pago</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Propiedad</span>
                  <span className="font-medium text-gray-900 dark:text-white">{payment.propertyCode}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Propietario</span>
                  <span className="font-medium text-gray-900 dark:text-white">{payment.ownerName}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Monto</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    ${payment.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Vencimiento</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(payment.dueDate).toLocaleDateString('es-MX')}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-gray-600 dark:text-gray-300">Estado</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    payment.status === 'OVERDUE' 
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' 
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                  }`}>
                    {payment.status === 'OVERDUE' ? 'Vencido' : 'Pendiente'}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de pago rápido */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⚡ Pago Rápido</h2>
              <div className="space-y-3">
                <button
                  onClick={handleOpenBankApp}
                  className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  Abrir aplicación bancaria
                </button>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Al hacer clic se abrirá la página de tu banco para realizar la transferencia
                </p>
              </div>
            </div>
          </div>

          {/* QR y datos bancarios */}
          <div className="space-y-4">
            {/* Código QR */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📱 Código QR</h2>
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg inline-block">
                  <QRCodeSVG
                    value={getQrData()}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin={true}
                  />
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Escanea con tu app bancaria para realizar el pago
              </p>
            </div>

            {/* Datos bancarios */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🏦 Datos Bancarios</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Banco</p>
                    <p className="font-medium text-gray-900 dark:text-white">{RECEIVER_DATA.bank}</p>
                  </div>
                  <Shield className="w-5 h-5 text-green-500" />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">CLABE</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">{RECEIVER_DATA.clabe}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(RECEIVER_DATA.clabe, 'clabe')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {copied === 'clabe' ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Número de cuenta</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">{RECEIVER_DATA.accountNumber}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(RECEIVER_DATA.accountNumber, 'account')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {copied === 'account' ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Referencia</p>
                    <p className="font-mono text-sm text-gray-900 dark:text-white">{RECEIVER_DATA.reference}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(RECEIVER_DATA.reference, 'reference')}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    {copied === 'reference' ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Concepto: <span className="font-medium">{RECEIVER_DATA.concept}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Instrucciones */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-2">📝 Instrucciones</h3>
              <ol className="text-sm text-blue-700 dark:text-blue-200 space-y-1 list-decimal list-inside">
                <li>Copia la CLABE o el número de cuenta</li>
                <li>Usa la referencia "{RECEIVER_DATA.reference}"</li>
                <li>Realiza la transferencia por el monto exacto</li>
                <li>Sube el comprobante en la sección de Cobranza</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PagoRapidoPage() {
  return (
    <RouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'BOARD_MEMBER', 'RESIDENT']}>
      <PagoRapidoContent />
    </RouteGuard>
  );
}