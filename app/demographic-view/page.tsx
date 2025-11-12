// app/demographic-view/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Navbar } from "../../src/components/ui/navbar";
import { Footer } from "../../src/components/ui/footer";
import { CardMetric } from "../../src/components/ui/card-metric";
import { BarChart } from "../../src/components/ui/bar-chart";
// IMPORTS UPDATED: Added TableColumn for type safety.
import { Table, TableColumn } from "../../src/components/ui/table"; 
import { fetchMarketingData } from "../../src/lib/api";
// IMPORTS UPDATED: Added DemographicBreakdown and DemographicPerformance for local typing
import { MarketingData, DemographicBreakdown, DemographicPerformance } from "../../src/types/marketing"; 
// IMPORTS UPDATED: Added Venus and Mars for gender-specific icons
import { Users, DollarSign, TrendingUp, Venus, Mars } from "lucide-react"; 

// --- LOCAL TYPE DEFINITIONS (Optional, but helps TypeScript recognize data shape) ---
// Note: These must match the aggregation logic below
interface AggregatedAgeData {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  conversion_rate: number;
  spend: number;
  revenue: number;
}

export default function DemographicView() {
  const [marketingData, setMarketingData] = useState<MarketingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchMarketingData();
        setMarketingData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900 items-center justify-center text-white">
        Loading demographic data...
      </div>
    );
  }

  if (error || !marketingData) {
    return (
      <div className="flex h-screen bg-gray-900 items-center justify-center text-red-400">
        Error: {error || "No data received"}
      </div>
    );
  }

  // --- Data Aggregation Logic ---
  const campaigns = marketingData.campaigns || [];
  
  // Flatten all demographic breakdowns into one list for each gender
  const maleBreakdown = campaigns.flatMap(c => 
    c.demographic_breakdown.filter(d => d.gender === "Male")
  ) as DemographicBreakdown[]; // Type assertion needed here

  const femaleBreakdown = campaigns.flatMap(c => 
    c.demographic_breakdown.filter(d => d.gender === "Female")
  ) as DemographicBreakdown[]; // Type assertion needed here

  // Helper to safely calculate the click-based proportional split
  const calculateProportionalValue = (gender: 'Male' | 'Female', valueKey: 'spend' | 'revenue') => {
    return campaigns.reduce((sum, c) => {
      const genderBreakdown = c.demographic_breakdown.filter(d => d.gender === gender);
      const totalClicksInCampaign = c.demographic_breakdown.reduce((p, d) => p + d.performance.clicks, 0);
      const genderClicksInCampaign = genderBreakdown.reduce((p, d) => p + d.performance.clicks, 0);
      
      if (totalClicksInCampaign === 0) return sum; // Avoid division by zero
      
      const genderPortion = genderClicksInCampaign / totalClicksInCampaign;
      return sum + c[valueKey] * genderPortion;
    }, 0);
  };
  
  // CARD METRICS CALCULATION
  const totalClicksByMales = maleBreakdown.reduce((sum, d) => sum + d.performance.clicks, 0);
  const totalSpendByMales = calculateProportionalValue('Male', 'spend');
  const totalRevenueByMales = calculateProportionalValue('Male', 'revenue');

  const totalClicksByFemales = femaleBreakdown.reduce((sum, d) => sum + d.performance.clicks, 0);
  const totalSpendByFemales = calculateProportionalValue('Female', 'spend');
  const totalRevenueByFemales = calculateProportionalValue('Female', 'revenue');

  // AGGREGATION FOR CHARTS AND TABLES
  const aggregateByAgeGroup = (gender: string): Record<string, AggregatedAgeData> => {
    const relevantData = campaigns.flatMap(c =>
      c.demographic_breakdown.filter(d => d.gender === gender)
    ) as DemographicBreakdown[];

    const grouped: Record<string, AggregatedAgeData> = {};
    
    relevantData.forEach(d => {
      const age = d.age_group;
      if (!grouped[age]) {
        grouped[age] = { spend: 0, revenue: 0, clicks: 0, conversions: 0, impressions: 0, ctr: 0, conversion_rate: 0 };
      }
      
      // SUMMING RAW METRICS
      grouped[age].clicks += d.performance.clicks;
      grouped[age].conversions += d.performance.conversions;
      grouped[age].impressions += d.performance.impressions;
      
      // Using simulated/proxy spend and revenue for demo purposes (as in your original logic)
      // NOTE: In a real app, you would sum actual demographic spend/revenue fields.
      grouped[age].spend += 1000 * d.performance.clicks; 
      grouped[age].revenue += 1500 * d.performance.conversions;
    });

    // Finalize calculated metrics (like CTR/Conv. Rate) after summing raw values
    Object.keys(grouped).forEach(age => {
      const data = grouped[age];
      data.ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
      data.conversion_rate = data.clicks > 0 ? (data.conversions / data.clicks) * 100 : 0;
    });
    
    return grouped;
  };

  const maleAgeData = aggregateByAgeGroup("Male");
  const femaleAgeData = aggregateByAgeGroup("Female");

  // Prepare combined chart data
  const combinedAgeData = { ...maleAgeData, ...femaleAgeData };
  const spendByAgeGroup = Object.entries(combinedAgeData).map(([age, data]) => ({
    label: age,
    value: data.spend,
    color: "#3B82F6"
  }));

  const revenueByAgeGroup = Object.entries(combinedAgeData).map(([age, data]) => ({
    label: age,
    value: data.revenue,
    color: "#10B981"
  }));
  
  // --- TABLE COLUMN CONFIGURATION (Updated with type safety and sorting) ---
  const ageGroupTableColumns: TableColumn[] = [
    { 
        key: "age_group", 
        header: "Age Group", 
        width: "20%", 
        sortable: true, 
        sortType: "string" 
    },
    { 
        key: "impressions", 
        header: "Impressions", 
        align: "right", 
        sortable: true, 
        sortType: "number", 
        // FIX: Explicitly type 'v' as number
        render: (v: number) => v.toLocaleString() 
    },
    { 
        key: "clicks", 
        header: "Clicks", 
        align: "right", 
        sortable: true, 
        sortType: "number", 
        // FIX: Explicitly type 'v' as number
        render: (v: number) => v.toLocaleString() 
    },
    { 
        key: "conversions", 
        header: "Conversions", 
        align: "right", 
        sortable: true, 
        sortType: "number", 
        // FIX: Explicitly type 'v' as number
        render: (v: number) => v.toLocaleString() 
    },
    { 
        key: "ctr", 
        header: "CTR (%)", 
        align: "right", 
        sortable: true, 
        sortType: "number", 
        // FIX: Explicitly type 'v' as number
        render: (v: number) => `${v.toFixed(2)}%` 
    },
    { 
        key: "conversion_rate", 
        header: "Conv. Rate (%)", 
        align: "right", 
        sortable: true, 
        sortType: "number",
        // FIX: Explicitly type 'v' as number
        render: (v: number) => <span className="text-blue-400">{`${v.toFixed(2)}%`}</span>,
        // The defaultSort prop should be placed on the Table component, not the column itself.
        // I am removing the redundant defaultSort from the column definition here, 
        // as you already correctly placed it on the <Table> tag.
    },
];

  const formatTableData = (data: Record<string, AggregatedAgeData>) => {
    return Object.entries(data).map(([age, row]) => ({
      age_group: age,
      impressions: row.impressions,
      clicks: row.clicks,
      conversions: row.conversions,
      // Pass the raw number value, but keep the rendering on the Table component side
      ctr: row.ctr, 
      conversion_rate: row.conversion_rate, 
    }));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900">
      <Navbar />

      <div className="flex-1 flex flex-col transition-all duration-300 ease-in-out">
        {/* Header */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-8">
          <div className="px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold">Demographic Analytics</h1>
            <p className="text-gray-400 mt-2 text-base">Gender and Age-based Marketing Insights</p>
          </div>
        </section>

        {/* Content */}
        <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {/* Cards */}
          <h2 className="text-2xl font-semibold text-white mb-4">Performance Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <CardMetric title="Clicks (Male)" value={totalClicksByMales.toLocaleString()} icon={<Mars className="text-blue-400" />} />
            <CardMetric title="Spend (Male)" value={`$${totalSpendByMales.toLocaleString()}`} icon={<DollarSign className="text-blue-400" />} />
            <CardMetric title="Revenue (Male)" value={`$${totalRevenueByMales.toLocaleString()}`} icon={<TrendingUp className="text-blue-400" />} />
            
            <CardMetric title="Clicks (Female)" value={totalClicksByFemales.toLocaleString()} icon={<Venus className="text-pink-400" />} />
            <CardMetric title="Spend (Female)" value={`$${totalSpendByFemales.toLocaleString()}`} icon={<DollarSign className="text-pink-400" />} />
            <CardMetric title="Revenue (Female)" value={`$${totalRevenueByFemales.toLocaleString()}`} icon={<TrendingUp className="text-pink-400" />} />
          </div>

          {/* Charts */}
          <h2 className="text-2xl font-semibold text-white mb-4">Age Group Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <BarChart title="Total Spend by Age Group" data={spendByAgeGroup} formatValue={(v) => `$${v.toLocaleString()}`} />
            <BarChart title="Total Revenue by Age Group" data={revenueByAgeGroup} formatValue={(v) => `$${v.toLocaleString()}`} />
          </div>

          {/* Tables */}
          <h2 className="text-2xl font-semibold text-white mb-4">Detailed Age Group Performance</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Table
              title="Male Performance by Age Group"
              showIndex={true}
              maxHeight="400px"
              columns={ageGroupTableColumns}
              data={formatTableData(maleAgeData)}
              emptyMessage="No male performance data available."
              defaultSort={{ key: 'conversion_rate', direction: 'desc' }}
            />

            <Table
              title="Female Performance by Age Group"
              showIndex={true}
              maxHeight="400px"
              columns={ageGroupTableColumns}
              data={formatTableData(femaleAgeData)}
              emptyMessage="No female performance data available."
              defaultSort={{ key: 'conversion_rate', direction: 'desc' }}
            />
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}