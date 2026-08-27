'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, BellOff, Settings, User, Mail, Phone, Shield, Loader2 } from 'lucide-react';
import RouteGuard from '@/app/components/auth/RouteGuard';
import { PushNotifications } from '@/app/components/notifications/PushNotifications';

function PerfilContent() {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (session?.user) {
      setUserData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
      });
    }
  }, [session]);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: userData.name,
          phone: userData.phone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('✅ Datos actualizados correctamente');
        // Actualizar sesión
        await fetch('/api/auth/session');
      } else {
        setMessage('❌ Error al actualizar: ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">👤 Mi Perfil</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Configura tu cuenta y preferencias</p>
      </div>

      {/* Información personal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Información Personal
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input
              type="text"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={userData.email}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
            <input
              type="text"
              value={userData.phone}
              onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="555-1234-5678"
            />
          </div>
          {message && (
            <p className={`text-sm ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Notificaciones push */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Notificaciones Push
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Estado</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Recibe notificaciones importantes en tu dispositivo</p>
            </div>
            <PushNotifications />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              💳 Recordatorios de pago
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              📋 Convocatorias a asambleas
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              🔧 Incidencias y reportes
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              📢 Avisos y comunicados
            </div>
          </div>
        </div>
      </div>

      {/* Botón de prueba */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Prueba de Notificaciones
        </h2>
        <button
          onClick={async () => {
            try {
              const res = await fetch('/api/notifications/test');
              const data = await res.json();
              alert(data.message || 'Notificación enviada');
            } catch (error) {
              alert('Error al enviar notificación de prueba');
            }
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          🔔 Enviar notificación de prueba
        </button>
      </div>
    </div>
  );
}

export default function PerfilPage() {
  return (
    <RouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'BOARD_MEMBER', 'RESIDENT']}>
      <PerfilContent />
    </RouteGuard>
  );
}