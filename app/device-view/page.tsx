// app/device-view/page.tsx
"use client";
import { useState, useEffect, useMemo } from 'react';
import { fetchMarketingData } from '../../src/lib/api';
import { MarketingData, Campaign, DevicePerformance } from '../../src/types/marketing';
import { Navbar } from '../../src/components/ui/navbar';
import { Footer } from '../../src/components/ui/footer';
import { CardMetric } from '../../src/components/ui/card-metric';
import { BarChart } from '../../src/components/ui/bar-chart';
import { Table, TableColumn } from '../../src/components/ui/table';
import { Smartphone, Monitor, DollarSign, TrendingUp, Users, Zap } from 'lucide-react';

interface DeviceMetrics {
  spend: number;
  revenue: number;
  clicks: number;
  conversions: number;
}

// Helper function to sum metrics
const sumMetrics = (breakdowns: DevicePerformance[]): DeviceMetrics => {
  return breakdowns.reduce((acc, b) => {
    acc.spend += b.spend;
    acc.revenue += b.revenue;
    acc.clicks += b.clicks;
    acc.conversions += b.conversions;
    return acc;
  }, { spend: 0, revenue: 0, clicks: 0, conversions: 0 });
};

export default function DeviceView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Data Aggregation for Cards/Charts (FIX 1) ---
  const { desktopMetrics, mobileMetrics } = useMemo(() => {
    if (!marketingData?.campaigns) {
      return { 
        desktopMetrics: { spend: 0, revenue: 0, clicks: 0, conversions: 0 },
        mobileMetrics: { spend: 0, revenue: 0, clicks: 0, conversions: 0 }
      };
    }

    // FIX: Use (c.device_breakdown || []) to safely default to an empty array
    const allDesktopBreakdowns = marketingData.campaigns.flatMap(c => 
      (c.device_performance || []).filter(d => d.device === 'Desktop')
    );
    const allMobileBreakdowns = marketingData.campaigns.flatMap(c => 
      (c.device_performance || []).filter(d => d.device === 'Mobile')
    );

    return {
      desktopMetrics: sumMetrics(allDesktopBreakdowns),
      mobileMetrics: sumMetrics(allMobileBreakdowns)
    };
  }, [marketingData?.campaigns]);
  
  // Prepare data for Table (FIX 2)
  const tableData = useMemo(() => {
    if (!marketingData?.campaigns) return [];
    
    return marketingData.campaigns.map(campaign => {
      // FIX: Use (campaign.device_breakdown || []) to safely default to an empty array
      const breakdowns = campaign.device_performance || [];
      
      const desktop = breakdowns.find(d => d.device === 'Desktop');
      const mobile = breakdowns.find(d => d.device === 'Mobile');
      
      return {
        id: campaign.id,
        name: campaign.name,
        desktopRevenue: desktop?.revenue || 0,
        mobileRevenue: mobile?.revenue || 0,
        desktopRoas: desktop?.roas || 0,
        mobileRoas: mobile?.roas || 0,
      };
    });
  }, [marketingData?.campaigns]);


  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-white">Loading Device Data...</div>
      </div>
    );
  }

  if (error || !marketingData) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-red-400">
          Error: {error || "No data available"}
        </div>
      </div>
    );
  }

  const tableColumns: TableColumn[] = [
    { key: 'name', header: 'Campaign Name', width: '40%', sortable: true, sortType: 'string' },
    { key: 'desktopRevenue', header: 'Desktop Revenue', align: 'right', sortable: true, sortType: 'number', render: (v: number) => `$${v.toLocaleString()}` },
    { key: 'mobileRevenue', header: 'Mobile Revenue', align: 'right', sortable: true, sortType: 'number', render: (v: number) => `$${v.toLocaleString()}` },
    { key: 'desktopRoas', header: 'Desktop ROAS', align: 'right', sortable: true, sortType: 'number', render: (v: number) => <span className="text-blue-400">{v.toFixed(1)}x</span> },
    { key: 'mobileRoas', header: 'Mobile ROAS', align: 'right', sortable: true, sortType: 'number', render: (v: number) => <span className="text-blue-400">{v.toFixed(1)}x</span> },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900">
      <Navbar />
       
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Header */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-8">
          <div className="px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold">Device Performance</h1>
            <p className="text-gray-400 mt-2 text-base">Desktop vs. Mobile campaign analysis.</p>
          </div>
        </section>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          
          {/* === Card Metrics === */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <CardMetric title="Desktop Revenue" value={`$${desktopMetrics.revenue.toLocaleString()}`} icon={<Monitor className="text-blue-400" />} />
            <CardMetric title="Desktop Spend" value={`$${desktopMetrics.spend.toLocaleString()}`} icon={<DollarSign className="text-blue-400" />} />
            <CardMetric title="Desktop Conversions" value={desktopMetrics.conversions.toLocaleString()} icon={<Users className="text-blue-400" />} />
            
            <CardMetric title="Mobile Revenue" value={`$${mobileMetrics.revenue.toLocaleString()}`} icon={<Smartphone className="text-green-400" />} />
            <CardMetric title="Mobile Spend" value={`$${mobileMetrics.spend.toLocaleString()}`} icon={<DollarSign className="text-green-400" />} />
            <CardMetric title="Mobile Conversions" value={mobileMetrics.conversions.toLocaleString()} icon={<Users className="text-green-400" />} />
          </div>

          {/* === Bar Charts === */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <BarChart 
              title="Total Revenue by Device"
              data={[
                { label: 'Desktop', value: desktopMetrics.revenue, color: '#3B82F6' },
                { label: 'Mobile', value: mobileMetrics.revenue, color: '#10B981' },
              ]}
              formatValue={(v) => `$${v.toLocaleString()}`}
            />
            <BarChart 
              title="Total Conversions by Device"
              data={[
                { label: 'Desktop', value: desktopMetrics.conversions, color: '#3B82F6' },
                { label: 'Mobile', value: mobileMetrics.conversions, color: '#10B981' },
              ]}
              formatValue={(v) => v.toLocaleString()}
            />
          </div>

          {/* === Detailed Table === */}
          <Table
            title="Campaign Performance by Device"
            columns={tableColumns}
            data={tableData}
            defaultSort={{ key: 'desktopRevenue', direction: 'desc' }}
            maxHeight="500px"
          />

        </div>
         
        <Footer />
      </div>
    </div>
  );
}