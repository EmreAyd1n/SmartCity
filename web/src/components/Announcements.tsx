import React, { useState, useEffect, useRef } from 'react';
import { Bell, Plus, X, Loader2, Megaphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchAnnouncements, createAnnouncement } from '../services/announcements';
import { Announcement } from '../types';
import { useToast } from '../context/ToastContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function Announcements() {
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Okunmuş duyuru id'lerini local storage'dan al
    const stored = localStorage.getItem('read_announcements');
    if (stored) {
      setReadIds(JSON.parse(stored));
    }
    loadAnnouncements();
  }, []);

  useEffect(() => {
    // Click outside handler
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Duyurular yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsCreating(false);
      // Mark all as read when opened
      const allIds = announcements.map(a => a.id);
      setReadIds(allIds);
      localStorage.setItem('read_announcements', JSON.stringify(allIds));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const newAnn = await createAnnouncement({
        title: newTitle,
        content: newContent,
        author_id: user.id,
        is_published: true
      });
      setAnnouncements(prev => [newAnn, ...prev]);
      addToast('success', 'Duyuru başarıyla yayınlandı.');
      setNewTitle('');
      setNewContent('');
      setIsCreating(false);
    } catch (error: any) {
      addToast('error', `Duyuru yayınlanamadı: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const unreadCount = announcements.filter(a => !readIds.includes(a.id)).length;
  const isOfficial = profile?.role === 'admin' || profile?.role === 'official';

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full text-surface-500 hover:text-primary-600 hover:bg-surface-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
        title="Duyurular"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-danger-500 rounded-full border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-surface-200 z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-surface-200 flex items-center justify-between bg-surface-50">
            <h3 className="text-sm font-semibold text-surface-900 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary-600" />
              Duyurular
            </h3>
            <div className="flex items-center gap-2">
              {isOfficial && !isCreating && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="p-1 rounded-md text-primary-600 hover:bg-primary-100 transition-colors"
                  title="Yeni Duyuru Ekle"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-surface-400 hover:bg-surface-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {isCreating ? (
              <form onSubmit={handleCreateSubmit} className="p-4 space-y-4">
                <div>
                  <label htmlFor="title" className="block text-xs font-medium text-surface-700">Başlık</label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-surface-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label htmlFor="content" className="block text-xs font-medium text-surface-700">İçerik</label>
                  <textarea
                    id="content"
                    required
                    rows={4}
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 text-sm border border-surface-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 resize-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-surface-700 bg-white border border-surface-300 rounded-md hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newTitle || !newContent}
                    className="flex-1 inline-flex justify-center items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                    Yayınla
                  </button>
                </div>
              </form>
            ) : (
              <div className="divide-y divide-surface-100">
                {loading ? (
                  <div className="p-8 flex justify-center text-primary-600">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="p-8 text-center text-surface-500 text-sm">
                    Henüz bir duyuru bulunmuyor.
                  </div>
                ) : (
                  announcements.map((ann) => (
                    <div key={ann.id} className="p-4 hover:bg-surface-50 transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-semibold text-surface-900 leading-tight">
                          {ann.title}
                        </h4>
                        <span className="text-[10px] text-surface-400 whitespace-nowrap ml-2">
                          {format(new Date(ann.created_at), 'd MMM HH:mm', { locale: tr })}
                        </span>
                      </div>
                      <p className="text-xs text-surface-600 whitespace-pre-wrap">
                        {ann.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
