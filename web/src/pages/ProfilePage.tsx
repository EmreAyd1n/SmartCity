import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { updateProfile, uploadAvatar, updatePassword } from '../services/profile';
import { User, Camera, Lock, Save, Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, profile } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');
  const [isSaving, setIsSaving] = useState(false);

  // Profil Form State
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Şifre Form State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await updateProfile(user.id, { full_name: fullName });
      addToast('success', 'Profil başarıyla güncellendi.');
    } catch (error: any) {
      addToast('error', `Profil güncellenemedi: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsSaving(true);
    try {
      const publicUrl = await uploadAvatar(user.id, file);
      setAvatarUrl(publicUrl);
      addToast('success', 'Profil fotoğrafı güncellendi.');
    } catch (error: any) {
      addToast('error', `Fotoğraf yüklenemedi: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('error', 'Şifreler eşleşmiyor.');
      return;
    }
    if (newPassword.length < 6) {
      addToast('error', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setIsSaving(true);
    try {
      await updatePassword(newPassword);
      addToast('success', 'Şifre başarıyla güncellendi.');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      addToast('error', `Şifre güncellenemedi: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">Profil & Ayarlar</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-surface-200">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
              activeTab === 'general'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
            }`}
          >
            Genel Bilgiler
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${
              activeTab === 'security'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-surface-500 hover:text-surface-700 hover:bg-surface-50'
            }`}
          >
            Güvenlik
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'general' && (
            <div className="space-y-8">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-surface-100 flex items-center justify-center overflow-hidden border-2 border-surface-200">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-surface-400" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Fotoğrafı Değiştir"
                    disabled={isSaving}
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-surface-900">Profil Fotoğrafı</h3>
                  <p className="text-sm text-surface-500">
                    JPG, GIF veya PNG. Maksimum 2MB.
                  </p>
                </div>
              </div>

              {/* Form Section */}
              <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-xl">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-surface-700">
                    E-posta
                  </label>
                  <input
                    type="email"
                    id="email"
                    disabled
                    value={user?.email || ''}
                    className="mt-1 block w-full px-3 py-2 border border-surface-300 rounded-md shadow-sm bg-surface-50 text-surface-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-surface-500">E-posta adresi değiştirilemez.</p>
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-surface-700">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-surface-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-surface-900"
                    placeholder="Adınızı ve soyadınızı girin"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-surface-700">
                    Rol
                  </label>
                  <input
                    type="text"
                    id="role"
                    disabled
                    value={profile?.role === 'admin' ? 'Yönetici' : profile?.role === 'official' ? 'Yetkili' : 'Vatandaş'}
                    className="mt-1 block w-full px-3 py-2 border border-surface-300 rounded-md shadow-sm bg-surface-50 text-surface-500 sm:text-sm"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Değişiklikleri Kaydet
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 max-w-xl">
              <div className="flex items-center gap-3 pb-4 border-b border-surface-200">
                <div className="p-2 bg-surface-100 rounded-lg text-surface-500">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-surface-900">Şifre Değiştir</h3>
                  <p className="text-sm text-surface-500">Hesabınızın güvenliğini artırmak için şifrenizi yenileyin.</p>
                </div>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-surface-700">
                    Yeni Şifre
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="mt-1 block w-full px-3 py-2 border border-surface-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-surface-900"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-700">
                    Yeni Şifre (Tekrar)
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="mt-1 block w-full px-3 py-2 border border-surface-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-surface-900"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving || !newPassword || !confirmPassword}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Şifreyi Güncelle
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
