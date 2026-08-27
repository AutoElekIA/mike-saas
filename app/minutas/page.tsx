'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Eye, Download, Trash2, 
  Calendar, User, File, Loader2, Upload, X 
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import RouteGuard from '@/app/components/auth/RouteGuard';

interface Minute {
  id: string;
  title: string;
  content: string;
  fileUrl: string | null;
  meetingDate: string;
  createdAt: string;
  creator: {
    name: string;
  };
  condominium: {
    name: string;
  };
}

function MinutasContent() {
  const [minutes, setMinutes] = useState<Minute[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    meetingDate: new Date().toISOString().slice(0, 16),
  });

  useEffect(() => {
    fetchMinutas();
  }, []);

  const fetchMinutas = async () => {
    try {
      const res = await fetch('/api/minutas');
      const data = await res.json();
      setMinutes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error:', error);
      setMinutes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.meetingDate) {
      alert('Completa los campos requeridos');
      return;
    }

    setUploading(true);
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('content', formData.content || '');
    submitData.append('meetingDate', formData.meetingDate);
    if (selectedFile) {
      submitData.append('file', selectedFile);
    }

    try {
      const res = await fetch('/api/minutas', {
        method: 'POST',
        body: submitData,
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Minuta creada correctamente');
        setShowModal(false);
        setFormData({ title: '', content: '', meetingDate: new Date().toISOString().slice(0, 16) });
        setSelectedFile(null);
        fetchMinutas();
      } else {
        alert('Error: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      alert('Error al crear minuta');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta minuta?')) return;
    try {
      const res = await fetch(`/api/minutas/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchMinutas();
      } else {
        alert('Error al eliminar');
      }
    } catch (error) {
      alert('Error al eliminar');
    }
  };

  const filteredMinutes = minutes.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.content?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Minutas y Avisos</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gestión de minutas y documentos en PDF</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Minuta
        </button>
      </div>

      {/* Buscador */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar minutas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {/* Grid de minutas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMinutes.map((minute) => (
          <div key={minute.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{minute.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(minute.meetingDate), "d 'de' MMMM 'de' yyyy", { locale: es })}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {minute.fileUrl && (
                  <a
                    href={minute.fileUrl}
                    target="_blank"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <Eye className="w-5 h-5" />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(minute.id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {minute.content && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{minute.content}</p>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <User className="w-4 h-4 mr-1" />
                {minute.creator?.name || 'Admin'}
              </div>
              {minute.fileUrl && (
                <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                  <File className="w-3 h-3 mr-1" />
                  PDF adjunto
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredMinutes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
          <p className="mt-2 text-gray-500 dark:text-gray-400">No hay minutas registradas</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Crea tu primera minuta con el botón "Nueva Minuta"</p>
        </div>
      )}

      {/* Modal de creación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📄 Nueva Minuta</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Ej: Acta de Asamblea Agosto 2026"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de reunión *</label>
                <input
                  type="datetime-local"
                  value={formData.meetingDate}
                  onChange={(e) => setFormData({ ...formData, meetingDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contenido</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                  placeholder="Detalles de la minuta..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Archivo PDF (opcional)</label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file && file.type !== 'application/pdf') {
                      alert('Solo se permiten archivos PDF');
                      e.target.value = '';
                      return;
                    }
                    if (file && file.size > 5 * 1024 * 1024) {
                      alert('Archivo demasiado grande. Máximo 5MB');
                      e.target.value = '';
                      return;
                    }
                    setSelectedFile(file);
                  }}
                  accept=".pdf"
                  className="w-full text-gray-700 dark:text-gray-300"
                />
                {selectedFile && (
                  <p className="mt-2 text-sm text-green-600 dark:text-green-400">✅ {selectedFile.name}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedFile(null);
                    setFormData({ title: '', content: '', meetingDate: new Date().toISOString().slice(0, 16) });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? 'Guardando...' : 'Guardar Minuta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MinutasPage() {
  return (
    <RouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'BOARD_MEMBER', 'RESIDENT']}>
      <MinutasContent />
    </RouteGuard>
  );
}