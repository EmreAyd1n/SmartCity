import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { supabase } from '../lib/supabase/client';
import { analyzeIssueWithAI } from '../services/aiService';
import type { AIAnalysisResult } from '../services/aiService';
import {
  MapPin, UploadCloud, X, Loader2, Sparkles,
  CheckCircle, Zap, Tag, Brain, ChevronRight, AlertTriangle,
} from 'lucide-react';

const CATEGORIES = [
  'Altyapı',
  'Çevre/Temizlik',
  'Ulaşım',
  'Park/Bahçe',
  'Aydınlatma',
  'Su / Kanalizasyon',
  'Diğer'
];

const PRIORITIES = [
  { value: 'low', label: 'Düşük', color: 'text-accent-600', bg: 'bg-accent-50' },
  { value: 'medium', label: 'Orta', color: 'text-info-500', bg: 'bg-blue-50' },
  { value: 'high', label: 'Yüksek', color: 'text-warning-500', bg: 'bg-amber-50' },
  { value: 'urgent', label: 'Kritik', color: 'text-danger-500', bg: 'bg-red-50' },
] as const;

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  urgent: 'Kritik',
};

export default function CreateIssuePage() {
  const { user, profile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // ── Form State ──
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [address, setAddress] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ── AI State ──
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalyzed, setAiAnalyzed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Image Handlers ──
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // Yeni görsel yüklendiğinde önceki AI sonucunu sıfırla
      setAiResult(null);
      setAiAnalyzed(false);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // AI sonucunu da sıfırla
    setAiResult(null);
    setAiAnalyzed(false);
  };

  // ── AI Analysis ──
  const handleAIAnalysis = async () => {
    if (!imageFile && !description.trim()) {
      addToast('error', 'Lütfen analiz için bir fotoğraf yükleyin veya açıklama girin.');
      return;
    }

    setAiLoading(true);
    setAiResult(null);

    try {
      const result = await analyzeIssueWithAI({
        imageFile,
        description: description.trim(),
      });
      setAiResult(result);
      setAiAnalyzed(true);
      addToast('success', 'AI analizi tamamlandı! Önerileri inceleyebilirsiniz.');
    } catch {
      addToast('error', 'AI analizi sırasında bir hata oluştu.');
    } finally {
      setAiLoading(false);
    }
  };

  // ── AI Öneri Uygulama ──
  const applyAISuggestion = (field: 'title' | 'category' | 'priority' | 'all') => {
    if (!aiResult) return;

    if (field === 'title' || field === 'all') {
      setTitle(aiResult.suggestedTitle);
    }
    if (field === 'category' || field === 'all') {
      setCategory(aiResult.category);
    }
    if (field === 'priority' || field === 'all') {
      setPriority(aiResult.priority);
    }

    if (field === 'all') {
      addToast('success', 'Tüm AI önerileri forma uygulandı.');
    }
  };

  // ── Form Submit ──
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
          priority,
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

  // ── AI butonunun aktiflik durumu ──
  const canAnalyze = !aiLoading && (!!imageFile || !!description.trim());

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

          {/* Aciliyet Seviyesi */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-surface-700">
              Aciliyet Seviyesi
            </label>
            <div className="mt-1">
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="block w-full rounded-md border-surface-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border bg-white"
              >
                {PRIORITIES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
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
                onChange={(e) => {
                  setDescription(e.target.value);
                  // Açıklama değişince AI sonucunu sıfırla
                  if (aiAnalyzed) {
                    setAiResult(null);
                    setAiAnalyzed(false);
                  }
                }}
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
                {/* AI Tarama Animasyonu */}
                {aiLoading && <div className="ai-scan-overlay" />}
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full hover:bg-white text-surface-700 transition-colors shadow-sm z-20"
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

          {/* ── AI Analiz Butonu ── */}
          <div className="border-t border-surface-200 pt-5">
            <button
              type="button"
              onClick={handleAIAnalysis}
              disabled={!canAnalyze}
              className={`
                w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-lg text-sm font-semibold
                transition-all duration-300 relative overflow-hidden
                ${canAnalyze
                  ? 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.01] active:scale-[0.99]'
                  : 'bg-surface-100 text-surface-400 cursor-not-allowed'
                }
                ${aiLoading ? 'animate-ai-pulse' : ''}
              `}
            >
              {aiLoading ? (
                <>
                  <Brain className="w-5 h-5 animate-spin" />
                  <span>Yapay Zeka İşliyor...</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-ai-shimmer" style={{ animation: 'ai-shimmer 1.5s ease-in-out infinite' }} />
                </>
              ) : aiAnalyzed ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Tekrar Analiz Et</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>🤖 AI ile Analiz Et</span>
                </>
              )}
            </button>
            {!canAnalyze && (
              <p className="text-xs text-surface-400 mt-1.5 text-center">
                Analiz için bir fotoğraf yükleyin veya açıklama girin
              </p>
            )}
          </div>

          {/* ── AI Öneri Kartı ── */}
          {aiResult && (
            <div className="ai-suggestion-card animate-ai-fade-in">
              {/* Kart Başlığı */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-surface-800">AI Analiz Sonuçları</h3>
                    <p className="text-[0.65rem] text-surface-500">Yapay zeka önerileri</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="ai-badge">
                    <Zap className="w-3 h-3" />
                    %{aiResult.confidence} güven
                  </span>
                </div>
              </div>

              {/* Öneri Satırları */}
              <div className="space-y-3">
                {/* Başlık Önerisi */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/60 border border-purple-100">
                  <div className="flex-1 min-w-0">
                    <span className="text-[0.65rem] uppercase tracking-wider text-purple-500 font-semibold">Başlık</span>
                    <p className="text-sm font-medium text-surface-800 truncate">{aiResult.suggestedTitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyAISuggestion('title')}
                    className="flex-shrink-0 ml-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors"
                  >
                    Uygula <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Kategori Önerisi */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/60 border border-purple-100">
                  <div className="flex-1 min-w-0">
                    <span className="text-[0.65rem] uppercase tracking-wider text-purple-500 font-semibold">Kategori</span>
                    <p className="text-sm font-medium text-surface-800">{aiResult.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyAISuggestion('category')}
                    className="flex-shrink-0 ml-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors"
                  >
                    Uygula <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Aciliyet Önerisi */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/60 border border-purple-100">
                  <div className="flex-1 min-w-0">
                    <span className="text-[0.65rem] uppercase tracking-wider text-purple-500 font-semibold">Aciliyet</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      {(aiResult.priority === 'urgent' || aiResult.priority === 'high') && (
                        <AlertTriangle className="w-3.5 h-3.5 text-warning-500" />
                      )}
                      <p className={`text-sm font-medium ${
                        aiResult.priority === 'urgent' ? 'text-danger-500' :
                        aiResult.priority === 'high' ? 'text-warning-500' :
                        aiResult.priority === 'low' ? 'text-accent-600' :
                        'text-info-500'
                      }`}>
                        {PRIORITY_LABELS[aiResult.priority] || aiResult.priority}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => applyAISuggestion('priority')}
                    className="flex-shrink-0 ml-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 transition-colors"
                  >
                    Uygula <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Etiketler */}
                {aiResult.tags.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-white/60 border border-purple-100">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Tag className="w-3 h-3 text-purple-500" />
                      <span className="text-[0.65rem] uppercase tracking-wider text-purple-500 font-semibold">Etiketler</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {aiResult.tags.map((tag) => (
                        <span key={tag} className="ai-tag">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Reasoning */}
              <p className="mt-3 text-[0.7rem] text-surface-500 italic leading-relaxed">
                {aiResult.reasoning}
              </p>

              {/* Tümünü Uygula */}
              <button
                type="button"
                onClick={() => applyAISuggestion('all')}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md shadow-purple-500/20 hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98]"
              >
                <Sparkles className="w-4 h-4" />
                Tümünü Uygula
              </button>
            </div>
          )}

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
