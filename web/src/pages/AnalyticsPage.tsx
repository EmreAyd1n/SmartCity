import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar
} from 'recharts';
import { Download, Loader2 } from 'lucide-react';
import { getAnalyticsData, AnalyticsData, TimeRangeFilter } from '../services/reports';

const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('30days');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const result = await getAnalyticsData(timeRange);
        setData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [timeRange]);

  const handleDownloadCsv = () => {
    if (!data) return;

    // Türkçe karakterlerin doğru görünmesi için BOM (Byte Order Mark) ekliyoruz.
    const BOM = "\uFEFF";
    let csvContent = BOM;
    
    // Kategoriler
    csvContent += "Kategori,Sayisi\n";
    data.categoryDistribution.forEach(row => {
      csvContent += `${row.name},${row.value}\n`;
    });
    csvContent += "\n";

    // Durumlar
    csvContent += "Durum,Sayisi\n";
    data.statusDistribution.forEach(row => {
      csvContent += `${row.name},${row.value}\n`;
    });
    csvContent += "\n";

    // Zaman Serisi
    csvContent += "Tarih,Sayisi\n";
    data.timeSeriesTrend.forEach(row => {
      csvContent += `${row.date},${row.count}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `analiz_raporu_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px] text-surface-500">
        Veri bulunamadı.
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Analiz ve Raporlar</h1>
          <p className="text-surface-500 mt-1">Sistemdeki bildirimlerin detaylı istatistikleri ve trendleri.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            className="flex-1 sm:flex-none border border-surface-200 bg-white text-surface-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 shadow-sm transition-shadow" 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value as TimeRangeFilter)}
          >
            <option value="7days">Son 7 Gün</option>
            <option value="30days">Son 30 Gün</option>
            <option value="all">Tüm Zamanlar</option>
          </select>
          
          <button 
            onClick={handleDownloadCsv}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white border border-surface-200 text-surface-700 hover:bg-surface-50 hover:text-surface-900 px-4 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Download className="w-4 h-4" />
            CSV İndir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Kategori Dağılımı (Pie Chart) */}
        <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-surface-800 mb-6">Kategori Dağılımı</h2>
          <div className="h-[300px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percent }) => percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : null}
                >
                  {data.categoryDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity outline-none" />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1e293b' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Durum Dağılımı (Bar Chart) */}
        <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-surface-800 mb-6">Durum Dağılımı</h2>
          <div className="h-[300px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.statusDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} name="Bildirim Sayısı" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bildirim Trendi (Area Chart) */}
        <div className="bg-white rounded-xl shadow-sm border border-surface-100 p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-surface-800 mb-6">Bildirim Trendi</h2>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeSeriesTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 13 }} 
                  dy={10}
                  tickFormatter={(val) => {
                    const date = new Date(val);
                    return `${date.getDate()} ${date.toLocaleString('tr-TR', { month: 'short' })}`;
                  }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(val) => {
                    const date = new Date(val);
                    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                  name="Bildirim Sayısı"
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
