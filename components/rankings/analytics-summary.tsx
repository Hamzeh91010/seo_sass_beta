"use client";

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import useSWR from 'swr';
import { api } from '@/lib/api';

// Data fetcher
const fetcher = (url: string) => api.get(url).then(res => res.data);

interface AnalyticsSummaryProps {
  selectedProject: string;
  searchEngine: string;
  device: string;
  region: string;
}

interface TrendData {
  date: string;
  average_position: number;
  total_keywords: number;
}

interface SummaryData {
  top_3: number;
  top_10: number;
  top_100: number;
  not_ranking: number;
  total_keywords: number;
}

const TIME_RANGES = [
  { label: '7D', value: '7', days: 7 },
  { label: '14D', value: '14', days: 14 },
  { label: '30D', value: '30', days: 30 },
  { label: '90D', value: '90', days: 90 },
  { label: 'All Time', value: 'all', days: null },
];

const PIE_COLORS = [
  '#10b981', // Green for Top 3
  '#3b82f6', // Blue for Top 10
  '#f59e0b', // Amber for Top 100
  '#ef4444', // Red for Not Ranking
];

export default function AnalyticsSummary({
  selectedProject,
  searchEngine,
  device,
  region,
}: AnalyticsSummaryProps) {
  const [timeRange, setTimeRange] = useState('30');

  // Build API URLs with filters
  const trendUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedProject !== 'all') params.append('project_id', selectedProject);
    if (searchEngine !== 'all') params.append('search_engine', searchEngine);
    if (device !== 'all') params.append('device', device);
    if (region !== 'all') params.append('region', region);
    if (timeRange !== 'all') params.append('days', timeRange);
    
    return `/rankings/summary/trend?${params.toString()}`;
  }, [selectedProject, searchEngine, device, region, timeRange]);

  const summaryUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedProject !== 'all') params.append('project_id', selectedProject);
    if (searchEngine !== 'all') params.append('search_engine', searchEngine);
    if (device !== 'all') params.append('device', device);
    if (region !== 'all') params.append('region', region);
    
    return `/rankings/summary?${params.toString()}`;
  }, [selectedProject, searchEngine, device, region]);

  // Fetch data
  const { data: trendData, error: trendError, isLoading: trendLoading } = useSWR<TrendData[]>(trendUrl, fetcher);
  const { data: summaryData, error: summaryError, isLoading: summaryLoading } = useSWR<SummaryData>(summaryUrl, fetcher);

  // Prepare pie chart data
  const pieData = useMemo(() => {
    if (!summaryData) return [];
    
    return [
      { name: 'Top 3', value: summaryData.position_distribution.top_3, color: PIE_COLORS[0] },
      { name: 'Top 10', value: summaryData.position_distribution.top_10, color: PIE_COLORS[1] },
      { name: 'Top 100', value: summaryData.position_distribution.top_100, color: PIE_COLORS[2] },
      { name: 'Not Ranking', value: summaryData.position_distribution.not_ranking, color: PIE_COLORS[3] },
    ].filter(item => item.value > 0);
  }, [summaryData]);

  // Calculate trend
  const positionTrend = useMemo(() => {
    if (!trendData || trendData.length < 2) return null;
    
    const latest = trendData[trendData.length - 1]?.average_position;
    const previous = trendData[trendData.length - 2]?.average_position;
    
    if (!latest || !previous) return null;
    
    const change = previous - latest; // Positive change means improvement (lower position number)
    return {
      value: Math.abs(change),
      isImprovement: change > 0,
      percentage: Math.abs((change / previous) * 100),
    };
  }, [trendData]);

  // Custom tooltip for line chart
  const LineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{new Date(label).toLocaleDateString()}</p>
          <p className="text-sm text-primary">
            Avg Position: <span className="font-semibold">#{payload[0].value.toFixed(1)}</span>
          </p>
          {payload[0].payload.total_keywords && (
            <p className="text-xs text-muted-foreground">
              {payload[0].payload.total_keywords} keywords tracked
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = summaryData ? ((data.value / summaryData.position_distribution.total_keywords) * 100).toFixed(1) : '0';
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium" style={{ color: data.payload.color }}>
            {data.name}
          </p>
          <p className="text-sm">
            <span className="font-semibold">{data.value}</span> keywords ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const isLoading = trendLoading || summaryLoading;
  const hasError = trendError || summaryError;

  if (hasError) {
    return (
      <Card className="mb-6">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load analytics</h3>
            <p className="text-muted-foreground">
              There was an error loading the analytics data. Please try again.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-8 space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Keywords</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                summaryData?.total_keywords?.toLocaleString() || '0'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Keywords being tracked
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top 3 Rankings</CardTitle>
            <div className="w-3 h-3 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                summaryData?.top_3?.toLocaleString() || '0'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryData?.total_keywords ? 
                `${((summaryData.top_3 / summaryData.total_keywords) * 100).toFixed(1)}% of total` : 
                'Keywords in top 3'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top 10 Rankings</CardTitle>
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                summaryData?.top_10?.toLocaleString() || '0'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryData?.total_keywords ? 
                `${((summaryData.top_10 / summaryData.total_keywords) * 100).toFixed(1)}% of total` : 
                'Keywords in top 10'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Position</CardTitle>
            {positionTrend && (
              positionTrend.isImprovement ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : trendData && trendData.length > 0 ? (
                `#${trendData[trendData.length - 1]?.average_position?.toFixed(1) || '0'}`
              ) : (
                '#0'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {positionTrend ? (
                <span className={positionTrend.isImprovement ? 'text-green-600' : 'text-red-600'}>
                  {positionTrend.isImprovement ? '↑' : '↓'} {positionTrend.value.toFixed(1)} positions
                </span>
              ) : (
                'Current average ranking'
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Line Chart - Average Position Over Time */}
        <Card className="lg:col-span-2 hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Average Position Over Time
                </CardTitle>
                <CardDescription>
                  Track your keyword ranking performance trends
                </CardDescription>
              </div>
              
              {/* Time Range Selector */}
              <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
                {TIME_RANGES.map((range) => (
                  <Button
                    key={range.value}
                    variant={timeRange === range.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setTimeRange(range.value)}
                    className="text-xs px-3 py-1 h-7"
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-80">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading trend data...</span>
              </div>
            ) : trendData && trendData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs fill-muted-foreground"
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    />
                    <YAxis 
                      className="text-xs fill-muted-foreground"
                      domain={[1, 100]}
                      reversed
                      tickFormatter={(value) => `#${value}`}
                    />
                    <Tooltip content={<LineTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="average_position" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-80">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No trend data available</h3>
                  <p className="text-muted-foreground">
                    Start tracking keywords to see position trends over time.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart - Latest Ranking Distribution */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Ranking Distribution
            </CardTitle>
            <CardDescription>
              Current keyword position breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-80">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading distribution...</span>
              </div>
            ) : pieData.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1000}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry: any) => (
                        <span style={{ color: entry.color }} className="text-sm">
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Label */}
                {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {summaryData?.total_keywords?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                </div> */}
              </div>
            ) : (
              <div className="flex items-center justify-center h-80">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No ranking data</h3>
                  <p className="text-muted-foreground text-sm">
                    Start tracking keywords to see ranking distribution.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}