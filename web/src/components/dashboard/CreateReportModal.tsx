import React, { useState, useRef } from 'react'
import { X, UploadCloud, MapPin, Loader2 } from 'lucide-react'
import { uploadReportImage, createReport } from '../../services/reports'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import type { Category } from '../../types'

interface CreateReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  categories: Category[]
}

export default function CreateReportModal({ isOpen, onClose, onSuccess, categories }: CreateReportModalProps) {
  const { profile } = useAuth()
  const { addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        addToast('error', 'Dosya boyutu en fazla 5MB olabilir.')
        return
      }
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !categoryId || !address || !description || !selectedFile) {
      addToast('error', 'Lütfen tüm alanları doldurun ve bir fotoğraf ekleyin.')
      return
    }

    if (!profile) {
      addToast('error', 'Oturum açmanız gerekiyor.')
      return
    }

    try {
      setIsSubmitting(true)

      // 1. Görseli yükle
      const imageUrl = await uploadReportImage(selectedFile)

      // 2. Raporu oluştur
      await createReport(
        {
          title,
          description,
          category_id: categoryId,
          address,
          image_url: imageUrl,
        },
        profile.id
      )

      addToast('success', 'Bildiriminiz başarıyla oluşturuldu.')
      onSuccess() // Dashboard listesini yenilemek için
      
      // Formu temizle ve kapat
      setTitle('')
      setCategoryId('')
      setAddress('')
      setDescription('')
      removeFile()
      onClose()
    } catch (error: any) {
      addToast('error', error.message || 'Bildirim oluşturulurken bir hata oluştu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-surface-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card flex flex-col shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200">
        
        {/* Başlık Alanı */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-surface-200/50 bg-white/80 backdrop-blur-md">
          <h2 className="text-xl font-bold text-surface-900">Yeni Sorun Bildir</h2>
          <button
            onClick={onClose}
            className="p-2 text-surface-400 transition-colors rounded-full hover:text-surface-600 hover:bg-surface-100/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Alanı */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Fotoğraf Yükleme Alanı */}
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">Sorunun Fotoğrafı</label>
              {!previewUrl ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed border-surface-300 rounded-xl bg-surface-50/50 hover:bg-surface-100/50 hover:border-primary-400 transition-all group"
                >
                  <UploadCloud className="w-10 h-10 text-surface-400 group-hover:text-primary-500 transition-colors mb-3" />
                  <p className="text-sm font-medium text-surface-700">Fotoğraf yüklemek için tıklayın</p>
                  <p className="text-xs text-surface-500 mt-1">PNG, JPG, JPEG (Maks 5MB)</p>
                </button>
              ) : (
                <div className="relative rounded-xl overflow-hidden group w-full aspect-[16/9] bg-surface-100 flex items-center justify-center">
                  <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-surface-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={removeFile}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-lg text-white font-medium shadow-sm transition-all flex items-center gap-2"
                    >
                      <X className="w-4 h-4" /> Kaldır
                    </button>
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileSelect}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Başlık */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-700 mb-1">Başlık</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Kısaca sorunu tanımlayın (örn. Sokak lambası çalışmıyor)"
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Kategori</label>
                <select
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-surface-700"
                >
                  <option value="" disabled>Seçiniz</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Adres/Konum */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Adres / Konum</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Sokak, Mahalle vb."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all placeholder:text-surface-400"
                  />
                </div>
              </div>

              {/* Açıklama */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-700 mb-1">Detaylı Açıklama</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Lütfen sorunu detaylıca anlatın..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none placeholder:text-surface-400"
                />
              </div>
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex items-center justify-end gap-3 pt-4 mt-6 border-t border-surface-200/50">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-medium text-surface-600 bg-surface-100 hover:bg-surface-200 rounded-xl transition-colors disabled:opacity-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  'Gönder'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
