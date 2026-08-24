import { supabase } from './supabase';

export interface Issue {
  id: string;
  title: string;
  description?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  status: string;
  created_at: string;
}

export interface CreateIssueInput {
  title: string;
  description?: string;
  category: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
}

export interface IssueStats {
  total: number;
  resolved: number;
  inProgress: number;
  activeTeams: number;
}

const mockIssues: Issue[] = [
  { id: '1', title: 'Çukur ve Asfalt Bozukluğu', status: 'pending', created_at: new Date().toISOString() },
  { id: '2', title: 'Sokak Lambası Arızası', status: 'in_progress', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: '3', title: 'Parkta Kırık Bank', status: 'resolved', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: '4', title: 'Su Sızıntısı', status: 'pending', created_at: new Date(Date.now() - 259200000).toISOString() },
];

const mockStats: IssueStats = {
  total: 145,
  resolved: 89,
  inProgress: 34,
  activeTeams: 12
};

/**
 * Uploads an issue image to the Supabase Storage 'issues' bucket.
 * Returns the public URL of the uploaded image.
 */
export const uploadIssueImage = async (imageUri: string): Promise<string> => {
  const fileName = `issue_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.jpg`;
  const filePath = `public/${fileName}`;

  // Fetch the image as a blob
  const response = await fetch(imageUri);
  const blob = await response.blob();

  // Convert blob to ArrayBuffer for Supabase upload
  const arrayBuffer = await new Response(blob).arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('issues')
    .upload(filePath, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Fotoğraf yüklenirken hata oluştu: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from('issues')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};

/**
 * Creates a new issue record in the 'issues' table with status 'pending'.
 */
export const createIssue = async (input: CreateIssueInput): Promise<Issue> => {
  const { data, error } = await supabase
    .from('reports')
    .insert({
      title: input.title,
      description: input.description || null,
      category: input.category,
      latitude: input.latitude || null,
      longitude: input.longitude || null,
      image_url: input.image_url || null,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Sorun kaydı oluşturulurken hata: ${error.message}`);
  }

  return data;
};

export const getRecentIssues = async (limit: number = 4): Promise<Issue[]> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Error fetching issues, using mock data:', error);
      return mockIssues.slice(0, limit);
    }

    return data && data.length > 0 ? data : mockIssues.slice(0, limit);
  } catch (err) {
    console.error('Unexpected error fetching issues:', err);
    return mockIssues.slice(0, limit);
  }
};

export const getIssueStats = async (): Promise<IssueStats> => {
  try {
    const { count: total, error: totalError } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
       console.warn('Error fetching issue stats, using mock data:', totalError);
       return mockStats;
    }
    
    if (total === 0 || total === null) {
      return mockStats; // Fallback to mock stats if empty
    }

    const { count: resolvedCount } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .in('status', ['resolved', 'çözüldü']);

    const { count: inProgressCount } = await supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .in('status', ['in_progress', 'devam_ediyor', 'işlemde']);

    return {
      total: total || mockStats.total,
      resolved: resolvedCount || 0,
      inProgress: inProgressCount || 0,
      activeTeams: mockStats.activeTeams,
    };

  } catch (err) {
    console.error('Unexpected error fetching stats:', err);
    return mockStats;
  }
};
