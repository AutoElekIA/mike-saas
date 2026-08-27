'use client';

import { useState } from 'react';
import { 
  BookOpen, HelpCircle, MessageCircle, 
  ChevronDown, ChevronRight, Search, 
  FileText, User, Home, DollarSign, 
  Calendar, AlertCircle, Settings,
  Mail, Phone, ExternalLink,
  Shield, Users, Building2, CreditCard,
  FolderOpen, ClipboardList, Bell, QrCode,
  Smartphone, Copy, CheckCircle
} from 'lucide-react';
import RouteGuard from '@/app/components/auth/RouteGuard';
import Link from 'next/link';

// Preguntas frecuentes actualizadas
const faqs = [
  {
    category: '📱 Pago Rápido',
    questions: [
      {
        q: '¿Cómo puedo pagar mis cuotas rápidamente?',
        a: 'Ve al menú "Pago Rápido" en el sidebar. Allí encontrarás el código QR y los datos bancarios para realizar tu transferencia. Puedes escanear el QR con tu app bancaria o copiar la CLABE al portapapeles.'
      },
      {
        q: '¿Qué datos bancarios necesito para pagar?',
        a: 'En la sección "Pago Rápido" encontrarás: CLABE interbancaria, número de cuenta, referencia y concepto. Todos los datos están disponibles para copiar con un solo clic.'
      },
      {
        q: '¿Cómo uso el código QR para pagar?',
        a: 'Abre tu app bancaria, busca la opción "Pagar con QR" y escanea el código QR que aparece en la pantalla. Los datos se cargarán automáticamente.'
      },
      {
        q: '¿Puedo pagar desde mi app bancaria?',
        a: 'Sí, haz clic en "Abrir aplicación bancaria" y se abrirá la página de tu banco para realizar la transferencia. También puedes copiar los datos manualmente.'
      }
    ]
  },
  {
    category: '🔔 Notificaciones Push',
    questions: [
      {
        q: '¿Qué son las notificaciones push?',
        a: 'Son alertas que recibes en tu dispositivo móvil o computadora para mantenerte informado sobre: recordatorios de pago, convocatorias a asambleas, incidencias nuevas, avisos importantes y felicitaciones de cumpleaños.'
      },
      {
        q: '¿Cómo activo las notificaciones push?',
        a: 'Ve a "Mi Perfil" → sección "Notificaciones Push" → haz clic en "Activar notificaciones" y acepta el permiso en tu navegador.'
      },
      {
        q: '¿Qué tipo de notificaciones recibiré?',
        a: 'Recibirás: 💳 Recordatorios de pago, 📋 Convocatorias a asambleas, 🔧 Incidencias y reportes, 📢 Avisos y comunicados, 🎂 Felicitaciones de cumpleaños.'
      },
      {
        q: '¿Puedo desactivar las notificaciones?',
        a: 'Sí, ve a "Mi Perfil" y haz clic en "Desactivar notificaciones" en la sección de Notificaciones Push.'
      }
    ]
  },
  {
    category: '👤 Mi Perfil',
    questions: [
      {
        q: '¿Cómo actualizo mi información personal?',
        a: 'Ve a "Mi Perfil" en el sidebar. Allí puedes actualizar tu nombre y teléfono. El email no se puede modificar porque es tu identificador de acceso.'
      },
      {
        q: '¿Puedo cambiar mi contraseña?',
        a: 'Por ahora, el cambio de contraseña debe solicitarlo al administrador del sistema. Próximamente habrá una opción de autogestión.'
      },
      {
        q: '¿Cómo activo las notificaciones desde mi perfil?',
        a: 'En "Mi Perfil", busca la sección "Notificaciones Push" y haz clic en "Activar notificaciones". Acepta el permiso del navegador y listo.'
      }
    ]
  },
  {
    category: '🌓 Modo Oscuro y Claro',
    questions: [
      {
        q: '¿Cómo cambio entre modo oscuro y claro?',
        a: 'En el sidebar, al final de la navegación, verás un botón con ☀️ (Modo Claro) o 🌙 (Modo Oscuro). Haz clic para alternar entre ambos temas.'
      },
      {
        q: '¿El modo oscuro se guarda?',
        a: 'Sí, tu preferencia se guarda en el navegador. Al volver a entrar, el sistema recordará tu tema preferido.'
      }
    ]
  },
  {
    category: '🏠 Directorio y Expedientes',
    questions: [
      {
        q: '¿Cómo veo el directorio de propietarios?',
        a: 'Ve al menú "Directorio" en el panel lateral. Allí encontrarás la lista de todos los propietarios con sus datos de contacto.'
      },
      {
        q: '¿Cómo puedo ver mi expediente?',
        a: 'En el Directorio, haz clic en tu nombre o en cualquier propietario para ver su expediente completo con propiedades, pagos y más.'
      },
      {
        q: '¿Puedo editar mi información de contacto?',
        a: 'Sí, en tu expediente haz clic en "Editar" y podrás actualizar tu nombre, email, teléfono y otros datos.'
      }
    ]
  },
  {
    category: '💰 Cobranza y Pagos',
    questions: [
      {
        q: '¿Cómo sé cuánto debo pagar?',
        a: 'En la sección "Cobranza" puedes ver el detalle de tus cuotas, incluyendo el monto y la fecha de vencimiento.'
      },
      {
        q: '¿Cómo puedo subir un comprobante de pago?',
        a: 'En "Cobranza", busca tu pago pendiente, haz clic en el icono de subir (📤) y selecciona el archivo JPG o PDF del comprobante.'
      },
      {
        q: '¿Qué pasa si pago después de la fecha límite?',
        a: 'Los pagos después del día 10 del mes se consideran vencidos y se cobra el monto de $2,200 en lugar de $2,000.'
      },
      {
        q: '¿Cómo verifican mi comprobante de pago?',
        a: 'El administrador revisará tu comprobante y lo aprobará manualmente. Recibirás notificación cuando sea aprobado.'
      }
    ]
  },
  {
    category: '🔧 Incidencias y Mantenimiento',
    questions: [
      {
        q: '¿Cómo reporto una incidencia?',
        a: 'Ve a "Incidencias" y haz clic en "Nueva Incidencia". Describe el problema y el sistema lo asignará a mantenimiento.'
      },
      {
        q: '¿Cómo sé el estado de mi reporte?',
        a: 'En "Incidencias" verás el estado de cada reporte: Pendiente, En Progreso, Resuelto o Cerrado.'
      }
    ]
  },
  {
    category: '🏊 Áreas Comunes',
    questions: [
      {
        q: '¿Cómo reservo un área común?',
        a: 'Ve a "Áreas Comunes", selecciona el área que deseas reservar y elige la fecha y hora disponibles.'
      },
      {
        q: '¿Cuánto cuesta reservar un área?',
        a: 'Los costos varían según el área. El Salón de Eventos y Jardín tienen costo por hora. La Alberca y Gimnasio son gratuitos.'
      }
    ]
  },
  {
    category: '📊 Finanzas',
    questions: [
      {
        q: '¿Cómo veo el balance del condominio?',
        a: 'Ve a "Finanzas" para ver el balance en línea, ingresos, gastos y evolución mensual con gráficos interactivos.'
      },
      {
        q: '¿Puedo exportar los reportes financieros?',
        a: 'Sí, en la página de Finanzas puedes exportar los datos en formato Excel o PDF usando el botón "Exportar".'
      }
    ]
  },
  {
    category: '👔 Administración',
    questions: [
      {
        q: '¿Quién puede administrar el sistema?',
        a: 'Solo los usuarios con rol ADMIN o SUPER_ADMIN pueden gestionar configuraciones, roles y datos del sistema.'
      },
      {
        q: '¿Cómo funcionan los roles rotativos?',
        a: 'Los roles (Tesorero, Mantenimiento, etc.) se asignan por semestre. El administrador puede gestionarlos en la sección "Administración".'
      }
    ]
  },
  {
    category: '📱 PWA (Aplicación Web Progresiva)',
    questions: [
      {
        q: '¿Qué es una PWA y cómo la instalo?',
        a: 'Mike es una PWA, lo que significa que puedes instalarla como una app en tu celular o computadora. En Chrome, busca el icono de "+" en la barra de direcciones o selecciona "Instalar aplicación" en el menú.'
      },
      {
        q: '¿Funciona sin internet?',
        a: 'Sí, Mike está diseñado para funcionar offline con el Service Worker. Podrás acceder a la información básica incluso sin conexión.'
      },
      {
        q: '¿Recibiré notificaciones en mi celular?',
        a: 'Sí, si activas las notificaciones push desde "Mi Perfil", recibirás alertas en tu dispositivo móvil o computadora.'
      }
    ]
  }
];

// Secciones del manual actualizadas
const manualSections = [
  {
    title: '📋 Inicio Rápido',
    icon: Home,
    items: [
      '1. Ingresa con tus credenciales en la página de login',
      '2. Explora el menú lateral para acceder a los módulos',
      '3. Consulta tu expediente en el Directorio',
      '4. Revisa tus pagos pendientes en Cobranza',
      '5. Reporta incidencias desde el módulo correspondiente'
    ]
  },
  {
    title: '💳 Pago Rápido',
    icon: QrCode,
    items: [
      'Código QR para escanear con tu app bancaria',
      'Copia de CLABE al portapapeles con un clic',
      'Copia de número de cuenta y referencia',
      'Botón para abrir tu aplicación bancaria',
      'Instrucciones paso a paso para realizar el pago'
    ]
  },
  {
    title: '🔔 Notificaciones Push',
    icon: Bell,
    items: [
      'Recordatorios de pago automáticos',
      'Convocatorias a asambleas',
      'Alertas de nuevas incidencias',
      'Avisos y comunicados importantes',
      'Felicitaciones de cumpleaños'
    ]
  },
  {
    title: '🌓 Modo Oscuro/Claro',
    icon: Settings,
    items: [
      'Cambio instantáneo entre tema claro y oscuro',
      'Preferencia guardada automáticamente',
      'Menos fatiga visual en entornos oscuros',
      'Mejor legibilidad en diferentes condiciones de luz'
    ]
  },
  {
    title: '👤 Mi Perfil',
    icon: User,
    items: [
      'Actualización de nombre y teléfono',
      'Activación/desactivación de notificaciones push',
      'Prueba de envío de notificaciones',
      'Información de cuenta'
    ]
  },
  {
    title: '📱 PWA - App Instalable',
    icon: Smartphone,
    items: [
      'Instalación como aplicación nativa en celular',
      'Funciona sin conexión a internet',
      'Notificaciones push en tiempo real',
      'Icono en el escritorio de tu dispositivo',
      'Experiencia similar a una app nativa'
    ]
  }
];

function AyudaContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState<string[]>([]);

  const toggleFaq = (question: string) => {
    setExpandedFaqs(prev =>
      prev.includes(question)
        ? prev.filter(q => q !== question)
        : [...prev, question]
    );
  };

  // Filtrar FAQs
  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q =>
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📚 Ayuda y Documentación</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Manual de usuario, preguntas frecuentes y soporte</p>
        </div>
        <Link
          href="/ayuda/contacto"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Contactar Soporte
        </Link>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar en la ayuda (preguntas frecuentes, temas...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Novedades */}
<div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
  <h3 className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-2">
    <span className="text-xl">🎉</span> Novedades recientes
  </h3>
  <ul className="mt-2 text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside">
    <li>💳 Nuevo módulo: <strong>Pago Rápido</strong> con QR y datos bancarios</li>
    <li>🔔 <strong>Notificaciones push</strong> para recordatorios y alertas</li>
    <li>🌓 <strong>Modo oscuro/claro</strong> con preferencia guardada</li>
    <li>👤 Sección <strong>"Mi Perfil"</strong> para gestionar datos y notificaciones</li>
    <li>📱 <strong>PWA instalable</strong> para usar como app nativa</li>
  </ul>
</div>

      {/* Grid de secciones del manual */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📖 Manual de Usuario</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {manualSections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{section.title}</h3>
                </div>
                <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-blue-500 dark:text-blue-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preguntas Frecuentes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">❓ Preguntas Frecuentes</h2>
        <div className="space-y-4">
          {filteredFaqs.map((category, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <h3 className="font-medium text-gray-900 dark:text-white">{category.category}</h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {category.questions.map((faq, i) => {
                  const isExpanded = expandedFaqs.includes(`${category.category}-${i}`);
                  return (
                    <div key={i}>
                      <button
                        onClick={() => toggleFaq(`${category.category}-${i}`)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="text-gray-900 dark:text-white font-medium">{faq.q}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="px-6 pb-4 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              No se encontraron resultados para "{searchTerm}"
            </p>
          </div>
        )}
      </div>

      {/* Soporte */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📞 ¿Necesitas más ayuda?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Correo Electrónico</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">soporte@mike.com</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Respuesta en 24-48 horas</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Teléfono</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">(55) 1234-5678</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Lun-Vie 9am-6pm</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
              <MessageCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Chat en vivo</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">Disponible pronto</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Próximamente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AyudaPage() {
  return (
    <RouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'BOARD_MEMBER', 'RESIDENT', 'GUEST']}>
      <AyudaContent />
    </RouteGuard>
  );
}