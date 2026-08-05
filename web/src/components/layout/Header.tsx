import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Menu, X, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Announcements from '../Announcements';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Raporlar', path: '/reports' },
    { name: 'Analiz & Raporlar', path: '/analytics' },
    { name: 'Hakkımızda', path: '/about' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-surface-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary-600 p-2 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-surface-900 tracking-tight">SmartCity</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-surface-600 hover:text-primary-600 font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-surface-600 font-medium">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center overflow-hidden">
                    {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </div>
                  <span className="hidden lg:block truncate max-w-[150px]">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 border-l border-surface-200 pl-4 ml-2">
                  <Announcements />
                  <Link
                    to="/profile"
                    className="flex items-center justify-center p-2 rounded-full text-surface-500 hover:text-primary-600 hover:bg-surface-100 transition-colors"
                    title="Profil & Ayarlar"
                  >
                    <Settings className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center justify-center p-2 rounded-full text-surface-500 hover:text-danger-600 hover:bg-danger-50 transition-colors"
                    title="Çıkış Yap"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-surface-700 hover:text-primary-600 font-medium px-3 py-2 transition-colors"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-surface-400 hover:text-surface-500 hover:bg-surface-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span className="sr-only">Menüyü aç</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-surface-200 shadow-lg absolute w-full">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-surface-700 hover:text-primary-600 hover:bg-primary-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-surface-200">
            {user ? (
              <div className="px-4 space-y-3">
                <div className="flex items-center px-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-surface-800 truncate">{user.email}</div>
                    <div className="text-xs font-medium text-surface-500 capitalize">{user.user_metadata?.role || 'Kullanıcı'}</div>
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex w-full items-center px-3 py-2 text-base font-medium text-surface-600 hover:text-primary-600 hover:bg-primary-50 rounded-md"
                >
                  <Settings className="h-5 w-5 mr-3" />
                  Profil & Ayarlar
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex w-full items-center px-3 py-2 text-base font-medium text-surface-600 hover:text-danger-600 hover:bg-danger-50 rounded-md"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Çıkış Yap
                </button>
              </div>
            ) : (
              <div className="px-5 space-y-3">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 border border-surface-300 shadow-sm text-base font-medium rounded-md text-surface-700 bg-white hover:bg-surface-50"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-2 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
