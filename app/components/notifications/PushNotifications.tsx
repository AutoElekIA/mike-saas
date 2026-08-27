'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X, Loader2 } from 'lucide-react';

export function PushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Verificar soporte
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Verificar suscripción existente
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error al verificar suscripción:', error);
    }
  };

  const subscribeToPush = async () => {
    setLoading(true);
    try {
      // Solicitar permiso
      if (Notification.permission === 'default') {
        const result = await Notification.requestPermission();
        setPermission(result);
        if (result !== 'granted') {
          alert('Necesitamos tu permiso para enviar notificaciones');
          setLoading(false);
          return;
        }
      }

      // Registrar Service Worker
      const registration = await navigator.serviceWorker.ready;
      
      // Suscribirse a push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Guardar suscripción en el servidor
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (response.ok) {
        setIsSubscribed(true);
        alert('¡Notificaciones activadas correctamente!');
      } else {
        throw new Error('Error al guardar suscripción');
      }
    } catch (error) {
      console.error('Error al suscribirse:', error);
      alert('Error al activar notificaciones. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromPush = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Eliminar suscripción del servidor
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        
        setIsSubscribed(false);
        alert('Notificaciones desactivadas');
      }
    } catch (error) {
      console.error('Error al desuscribirse:', error);
      alert('Error al desactivar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        🔔 Tu navegador no soporta notificaciones
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="text-sm text-red-600 dark:text-red-400">
        ⛔ Notificaciones bloqueadas. Actívalas en la configuración de tu navegador.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {isSubscribed ? (
        <button
          onClick={unsubscribeFromPush}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Check className="w-4 h-4" />
          )}
          Notificaciones activas
        </button>
      ) : (
        <button
          onClick={subscribeToPush}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
          Activar notificaciones
        </button>
      )}
    </div>
  );
}