import { supabase } from '../lib/supabase/client';
import type { ProfileUpdate } from '../types';

/**
 * Kullanıcı profil bilgilerini günceller
 */
export async function updateProfile(userId: string, data: ProfileUpdate) {
  const { error } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId);

  if (error) {
    throw new Error(error.message);
  }
}

/**
 * Kullanıcı profil fotoğrafını günceller
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

  // 1. Yeni resmi 'avatars' bucket'ına yükle
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  // 2. Yüklenen resmin public URL'ini al
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // 3. Profil tablosunu güncelle
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return publicUrl;
}

/**
 * Kullanıcı şifresini günceller
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) {
    throw new Error(error.message);
  }
}
