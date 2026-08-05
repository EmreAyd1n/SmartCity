import { supabase } from '../lib/supabase/client';
import { Announcement, AnnouncementInsert, AnnouncementUpdate } from '../types';

/**
 * Tüm duyuruları getirir, yayınlanmış ve tarihe göre azalan sırada.
 */
export async function fetchAnnouncements(): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Announcement[];
}

/**
 * Yeni bir duyuru oluşturur (Yetkililer için)
 */
export async function createAnnouncement(data: AnnouncementInsert): Promise<Announcement> {
  const { data: announcement, error } = await supabase
    .from('announcements')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return announcement as Announcement;
}

/**
 * Bir duyuruyu günceller (Yetkililer için)
 */
export async function updateAnnouncement(id: string, data: AnnouncementUpdate): Promise<Announcement> {
  const { data: announcement, error } = await supabase
    .from('announcements')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return announcement as Announcement;
}

/**
 * Bir duyuruyu siler (Yetkililer için)
 */
export async function deleteAnnouncement(id: string): Promise<void> {
  const { error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}
