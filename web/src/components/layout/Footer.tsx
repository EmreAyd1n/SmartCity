import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Github, Twitter, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-900 border-t border-surface-800 pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary-600 p-1.5 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">SmartCity</span>
            </Link>
            <p className="text-surface-400 text-sm leading-relaxed mb-6">
              Şehrinizi daha yaşanabilir kılmak için vatandaşlar ve yerel yönetimleri bir araya getiren akıllı şehir platformu.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-surface-400 hover:text-primary-400 transition-colors">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-surface-400 hover:text-primary-400 transition-colors">
                <span className="sr-only">GitHub</span>
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-surface-400 hover:text-primary-400 transition-colors">
                <span className="sr-only">Email</span>
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/reports" className="text-surface-400 hover:text-white transition-colors text-sm">Vatandaş Raporları</Link></li>
              <li><Link to="/announcements" className="text-surface-400 hover:text-white transition-colors text-sm">Duyurular</Link></li>
              <li><Link to="/projects" className="text-surface-400 hover:text-white transition-colors text-sm">Belediye Projeleri</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Kurumsal</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-surface-400 hover:text-white transition-colors text-sm">Hakkımızda</Link></li>
              <li><Link to="/contact" className="text-surface-400 hover:text-white transition-colors text-sm">İletişim</Link></li>
              <li><Link to="/privacy" className="text-surface-400 hover:text-white transition-colors text-sm">Gizlilik Politikası</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Bize Katılın</h3>
            <p className="text-surface-400 text-sm mb-4">Şehrinizdeki gelişmelerden haberdar olmak için bültene abone olun.</p>
            <form className="flex">
              <input
                type="email"
                placeholder="E-posta adresiniz"
                className="w-full min-w-0 px-3 py-2 text-sm text-surface-900 placeholder-surface-500 bg-white border border-transparent rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Abone Ol
              </button>
            </form>
          </div>
          
        </div>
        
        <div className="border-t border-surface-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-surface-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} SmartCity Platformu. Tüm hakları saklıdır.
          </p>
          <div className="flex space-x-6 text-sm text-surface-400">
            <Link to="/terms" className="hover:text-white transition-colors">Kullanım Şartları</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Gizlilik</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
