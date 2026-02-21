'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  TrendingUp, 
  LogOut, 
  Loader2, 
  Settings, 
  Package,
  Users,
  DollarSign
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Skip auth check for /admin/auth page
    if (pathname?.includes('/admin/auth')) {
      setIsAuthenticated(true);
      return;
    }

    // Check authentication
    const checkAuth = () => {
      const token = localStorage.getItem('referral_auth_token');
      const userJson = localStorage.getItem('referral_auth_user');

      if (!token || !userJson) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const user = JSON.parse(userJson);
        const now = Date.now();
        const tokenAge = now - (user.timestamp || 0);
        const MAX_AGE = 24 * 60 * 60 * 1000; // 24 horas

        // Token expirado
        if (tokenAge > MAX_AGE) {
          console.log('[AUTH] Token expirado');
          handleLogout();
          return;
        }

        setIsAuthenticated(true);
        setUserEmail(user.email);
      } catch (error) {
        console.error('[AUTH] Error parsing user:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('referral_auth_token');
    localStorage.removeItem('referral_auth_user');
    setIsAuthenticated(false);
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Acceso Restringido
            </h1>
            <p className="text-gray-600 mb-6">
              Debes iniciar sesión desde WispChat para acceder al panel de administración.
            </p>
            <a
              href="https://wispchat.net/admin"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Ir a WispChat
            </a>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/clientes',
      label: 'Clientes',
      icon: Users,
    },
    {
      href: '/admin/commissions',
      label: 'Comisiones',
      icon: DollarSign,
    },
    {
      href: '/admin/upload',
      label: 'Subir CSV',
      icon: Upload,
    },
    {
      href: '/admin/uploads',
      label: 'Historial',
      icon: FileText,
    },
    {
      href: '/admin/configuracion',
      label: 'Configuración',
      icon: Settings,
    },
    {
      href: '/admin/configuracion/paquetes',
      label: 'Paquetes',
      icon: Package,
    },
  ];

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === href || pathname === '/admin';
    }
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Navigation */}
      <nav className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Easy Access - Panel Admin
                </h1>
                {userEmail && (
                  <p className="text-xs text-gray-500 mt-1">
                    {userEmail}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      px-4 py-2 rounded-lg flex items-center gap-2 transition-all
                      ${active
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="ml-4 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main>{children}</main>
    </div>
  );
}
