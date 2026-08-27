'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Phone, Mail, Home, User, ChevronRight } from 'lucide-react';
import RouteGuard from '@/app/components/auth/RouteGuard';

interface Owner {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  properties: {
    code: string;
  }[];
}

function DirectorioContent() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/directorio')
      .then(res => res.json())
      .then(data => {
        setOwners(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredOwners = owners.filter(owner =>
    owner.fullName.toLowerCase().includes(search.toLowerCase()) ||
    owner.email?.toLowerCase().includes(search.toLowerCase()) ||
    owner.phone?.includes(search) ||
    owner.properties.some(p => p.code.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Directorio de Propietarios</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Directorio de contactos de propietarios del condominio</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Buscar por nombre, casa, teléfono o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOwners.map((owner) => (
          <Link
            key={owner.id}
            href={`/propietarios/${owner.id}`}
            className="group bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all p-4 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {owner.fullName}
                  </h3>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {owner.properties.map((p, idx) => (
                    <span key={idx} className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                      <Home className="w-3 h-3 mr-1" />
                      {p.code}
                    </span>
                  ))}
                </div>
                <div className="mt-1 space-y-0.5 text-sm text-gray-500 dark:text-gray-400">
                  {owner.phone && (
                    <div className="flex items-center">
                      <Phone className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                      <span>{owner.phone}</span>
                    </div>
                  )}
                  {owner.email && (
                    <div className="flex items-center">
                      <Mail className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                      <span className="truncate">{owner.email}</span>
                    </div>
                  )}
                </div>
                <div className="mt-1 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver expediente →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredOwners.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No se encontraron propietarios
        </div>
      )}
    </div>
  );
}

export default function DirectorioPage() {
  return (
    <RouteGuard allowedRoles={['SUPER_ADMIN', 'ADMIN', 'BOARD_MEMBER', 'RESIDENT', 'GUEST']}>
      <DirectorioContent />
    </RouteGuard>
  );
}