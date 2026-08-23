import { supabase } from './supabase';

export interface Issue {
  id: string;
  title: string;
  description?: string;
  status: string;
  created_at: string;
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

export const getRecentIssues = async (limit: number = 4): Promise<Issue[]> => {
  try {
    const { data, error } = await supabase
      .from('issues')
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
      .from('issues')
      .select('*', { count: 'exact', head: true });

    if (totalError) {
       console.warn('Error fetching issue stats, using mock data:', totalError);
       return mockStats;
    }
    
    if (total === 0 || total === null) {
      return mockStats; // Fallback to mock stats if empty
    }

    const { count: resolvedCount } = await supabase
      .from('issues')
      .select('*', { count: 'exact', head: true })
      .in('status', ['resolved', 'çözüldü']);

    const { count: inProgressCount } = await supabase
      .from('issues')
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
