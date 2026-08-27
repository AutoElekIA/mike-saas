'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Calendar, Download, 
  FileText, PieChart, BarChart3, RefreshCw, Loader2
} from 'lucide-react';
import RouteGuard from '@/app/components/auth/RouteGuard';

interface FinanceSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  pendingPayments: number;
  totalProperties: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
  monthlyData: {
    month: string;
    income: number;
    expenses: number;
  }[];
}

function FinanzasContent() {
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const res = await fetch(`/api/finanzas?month=${selectedMonth}`);
      const data = await res.json();
      setSummary(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      if (showRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const handleRefresh = () => {
    fetchData(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  const { 
    totalIncome = 0, 
    totalExpenses = 0, 
    balance = 0, 
    pendingPayments = 0,
    totalProperties = 0,
    paidCount = 0,
    pendingCount = 0,
    overdueCount = 0,
    monthlyData = []
  } = summary || {};

  // Calcular porcentaje de ocupación (ejemplo)
  const occupancyRate = totalProperties > 0 ? Math.round((paidCount / totalProperties) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Finanzas</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Balance y reportes financieros del condominio</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos del mes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalIncome.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{paidCount} pagos</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Gastos del mes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalExpenses.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Por registrar</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${balance >= 0 ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
              <DollarSign className={`w-6 h-6 ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Balance del mes</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                ${balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Pagos Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                ${pendingPayments.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {pendingCount} pendientes, {overdueCount} vencidos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Balance en Línea */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📈 Balance en Línea</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400">
                +${totalIncome.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{paidCount} cuotas pagadas</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">Egresos</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                -${totalExpenses.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Gastos registrados</p>
            </div>
            <div className={`rounded-lg p-4 text-center ${balance >= 0 ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'}`}>
              <p className="text-sm text-gray-600 dark:text-gray-400">Balance</p>
              <p className={`text-xl font-bold ${balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
                ${balance.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {totalProperties} propiedades en total
              </p>
            </div>
          </div>
        </div>

        {/* Resumen de Adeudos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📋 Resumen de Adeudos</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-gray-600 dark:text-gray-300">Total Adeudos</span>
              <span className="font-medium text-red-600 dark:text-red-400">
                ${pendingPayments.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <span className="text-gray-600 dark:text-gray-300">Pagos Pendientes</span>
              <span className="font-medium text-yellow-600 dark:text-yellow-400">{pendingCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded">
              <span className="text-gray-600 dark:text-gray-300">Pagos Vencidos</span>
              <span className="font-medium text-red-600 dark:text-red-400">{overdueCount}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded">
              <span className="text-gray-600 dark:text-gray-300">Tasa de Ocupación</span>
              <span className="font-medium text-green-600 dark:text-green-400">{occupancyRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de evolución mensual (simplificado) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Evolución Mensual</h2>
        {monthlyData.length > 0 ? (
          <div className="space-y-3">
            {monthlyData.map((item, idx) => {
              const maxValue = Math.max(...monthlyData.map(d => Math.max(d.income, d.expenses)), 1);
              const incomeWidth = (item.income / maxValue) * 100;
              const expenseWidth = (item.expenses / maxValue) * 100;
              return (
                <div key={idx} className="flex items-center gap-4">
                  <span className="w-24 text-sm text-gray-600 dark:text-gray-300">{item.month}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-green-600 dark:text-green-400 w-16">Ingresos</span>
                      <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded transition-all duration-500"
                          style={{ width: `${Math.min(incomeWidth, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 w-20">
                        ${item.income.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600 dark:text-red-400 w-16">Gastos</span>
                      <div className="flex-1 h-4 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded transition-all duration-500"
                          style={{ width: `${Math.min(expenseWidth, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 w-20">
                        ${item.expenses.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No hay datos suficientes para mostrar el gráfico
          </p>
        )}
      </div>
    </div>
  );
}

export default function FinanzasPage() {
  return (
    <RouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
      <FinanzasContent />
    </RouteGuard>
  );
}