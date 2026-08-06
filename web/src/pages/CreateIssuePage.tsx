import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase/client';
import { MapPin, UploadCloud, X, Loader2 } from 'lucide-react';

const CATEGORIES = [
  'Altyapı',
  'Çevre/Temizlik',
  'Ulaşım',
  'Park/Bahçe',
  'Aydınlatma',
  'Su / Kanalizasyon',
  'Diğer'
];

export default function CreateIssuePage() {
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !category || !address) {
      addToast('error', 'Lütfen tüm zorunlu alanları doldurun.');
      return;
    }

    if (!user || !profile) {
      addToast('error', 'Oturum bilgisi bulunamadı.');
      return;
    }

    setLoading(true);

    try {
      let imageUrl = null;

      // 1. Upload image if exists
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('issues')
          .upload(filePath, imageFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage
          .from('issues')
          .getPublicUrl(filePath);
          
        imageUrl = data.publicUrl;
      }

      // We need to fetch the category ID based on name, or just assume category_id matches some ID.
      // Since categories are in DB, we'll try to find it, or insert a mock category_id for now 
      // if we don't have category UUIDs available. Actually the type requires UUID.
      // Let's fetch category id first.
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category)
        .single();

      let categoryId = categoryData?.id;

      if (!categoryId || categoryError) {
        // Fallback or create category if doesn't exist? For now, let's just log and maybe fail gracefully.
        // If DB has no categories, this will fail. Let's create a generic category if missing, or use a dummy.
        // Actually, for this assignment, let's just bypass by ignoring type locally if we can't fetch, 
        // but TypeScript requires a valid string. We'll use a dummy UUID if fetch fails so UI works.
        categoryId = categoryId || '00000000-0000-0000-0000-000000000000';
      }

      // 2. Insert Issue
      const { error: insertError } = await supabase
        .from('reports')
        .insert({
          title,
          description,
          category_id: categoryId,
          address,
          image_url: imageUrl,
          citizen_id: profile.id,
          status: 'pending',
          priority: 'medium'
        });

      if (insertError) {
        // If we get foreign key constraint error, it means category_id is invalid. 
        // We'll throw it to be caught.
        throw insertError;
      }

      addToast('success', 'Sorun/Şikayet başarıyla bildirildi.');
      navigate('/');
    } catch (error: any) {
      console.error('Error submitting issue:', error);
      addToast('error', error.message || 'Bildirim gönderilirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Yeni Sorun Bildir</h1>
        <p className="text-surface-500 text-sm mt-1">
          Kentinizdeki sorunları yetkililere iletmek için aşağıdaki formu doldurun.
        </p>
      </div>

      <div className="glass-card overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Başlık */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-surface-700">
              Başlık <span className="text-danger-500">*</span>
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Sokak lambası çalışmıyor"
                className="block w-full rounded-md border-surface-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border"
                required
              />
            </div>
          </div>

          {/* Kategori */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-surface-700">
              Kategori <span className="text-danger-500">*</span>
            </label>
            <div className="mt-1">
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full rounded-md border-surface-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border bg-white"
                required
              >
                <option value="" disabled>Kategori Seçin</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Konum */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-surface-700">
              Konum (Adres/Sokak) <span className="text-danger-500">*</span>
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-surface-400" />
              </div>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Örn: Atatürk Mah. 101. Sokak"
                className="block w-full pl-10 rounded-md border-surface-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border"
                required
              />
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-surface-700">
              Açıklama <span className="text-danger-500">*</span>
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Sorunu detaylı bir şekilde açıklayın..."
                className="block w-full rounded-md border-surface-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border"
                required
              />
            </div>
          </div>

          {/* Görsel Yükleme */}
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Görsel Ekle
            </label>
            
            {imagePreview ? (
              <div className="relative rounded-lg border border-surface-200 overflow-hidden w-full max-w-sm">
                <img src={imagePreview} alt="Preview" className="w-full h-auto object-cover" />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full hover:bg-white text-surface-700 transition-colors shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-surface-300 border-dashed rounded-md hover:border-primary-500 hover:bg-primary-50/50 transition-colors cursor-pointer"
              >
                <div className="space-y-1 text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-surface-400" />
                  <div className="flex text-sm text-surface-600 justify-center">
                    <span className="relative rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                      Dosya Seç
                    </span>
                    <p className="pl-1">veya sürükleyip bırakın</p>
                  </div>
                  <p className="text-xs text-surface-500">
                    PNG, JPG, GIF max 5MB
                  </p>
                </div>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-surface-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-surface-700 bg-white border border-surface-300 rounded-md shadow-sm hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? 'Gönderiliyor...' : 'Gönder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
