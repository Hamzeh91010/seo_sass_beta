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

import { Badge } from '@/components/ui/badge';
// Data fetcher
const fetcher = (url: string) => api.get(url).then(res => res.data);

interface AnalyticsSummaryProps {
  selectedProject: string;
  searchEngine: string;
  device: string;
  region: string;
}

interface MovementData {
  moved_up: number;
  moved_down: number;
  unchanged: number;
  total_keywords: number;
}

interface PositionDistribution {
  top_3: number;
  top_10: number;
  top_100: number;
  not_ranking: number;
  total_keywords: number;
}

interface SummaryData {
  movement: MovementData;
  position_distribution: {
    current: PositionDistribution;
    previous: PositionDistribution;
  };
  total_keywords: number;
}

interface TrendData {
  date: string;
  average_position: number;
  total_keywords: number;
}

const TIME_RANGES = [
  { label: '7D', value: '7', days: 7 },
  { label: '14D', value: '14', days: 14 },
  { label: '30D', value: '30', days: 30 },
  { label: '90D', value: '90', days: 90 },
  { label: 'All Time', value: 'all', days: null },
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

  // Prepare ranking comparison data
  const rankingComparison = useMemo(() => {
    if (!summaryData?.position_distribution) return [];
    
    const { current, previous } = summaryData.position_distribution;
    
    return [
      {
        label: 'Top 3',
        current: current.top_3,
        previous: previous.top_3,
        change: current.top_3 - previous.top_3,
        color: 'bg-green-500',
        lightColor: 'bg-green-100 dark:bg-green-900/20',
        textColor: 'text-green-800 dark:text-green-400'
      },
      {
        label: 'Top 10',
        current: current.top_10,
        previous: previous.top_10,
        change: current.top_10 - previous.top_10,
        color: 'bg-blue-500',
        lightColor: 'bg-blue-100 dark:bg-blue-900/20',
        textColor: 'text-blue-800 dark:text-blue-400'
      },
      {
        label: 'Top 100',
        current: current.top_100,
        previous: previous.top_100,
        change: current.top_100 - previous.top_100,
        color: 'bg-amber-500',
        lightColor: 'bg-amber-100 dark:bg-amber-900/20',
        textColor: 'text-amber-800 dark:text-amber-400'
      },
      {
        label: 'Not Ranking',
        current: current.not_ranking,
        previous: previous.not_ranking,
        change: current.not_ranking - previous.not_ranking,
        color: 'bg-red-500',
        lightColor: 'bg-red-100 dark:bg-red-900/20',
        textColor: 'text-red-800 dark:text-red-400'
      }
    ];
  }, [summaryData]);

  const getChangeIcon = (change: number) => {
    if (change > 0) {
      return <TrendingUp className="h-3 w-3 text-green-600" />;
    } else if (change < 0) {
      return <TrendingDown className="h-3 w-3 text-red-600" />;
    } else {
      return <Minus className="h-3 w-3 text-gray-500" />;
    }
  };

  const getChangeBadge = (change: number) => {
    if (change > 0) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
          +{change}
        </Badge>
      );
    } else if (change < 0) {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {change}
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary">
          0
        </Badge>
      );
    }
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
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
            <CardTitle className="text-sm font-medium">Moved Up</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                summaryData?.movement?.moved_up?.toLocaleString() || '0'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Keywords improved
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Moved Down</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                summaryData?.movement?.moved_down?.toLocaleString() || '0'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Keywords declined
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unchanged</CardTitle>
            <Minus className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                summaryData?.movement?.unchanged?.toLocaleString() || '0'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Keywords stable
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
                summaryData?.position_distribution?.current?.top_3?.toLocaleString() || '0'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryData?.position_distribution?.current ? 
                `${((summaryData.position_distribution.current.top_3 / summaryData.total_keywords) * 100).toFixed(1)}% of total` : 
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
                summaryData?.position_distribution?.current?.top_10?.toLocaleString() || '0'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {summaryData?.position_distribution?.current ? 
                `${((summaryData.position_distribution.current.top_10 / summaryData.total_keywords) * 100).toFixed(1)}% of total` : 
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

        {/* Ranking Distribution Comparison */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Ranking Changes
            </CardTitle>
            <CardDescription>
              Compare current vs previous rankings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading comparison...</span>
              </div>
            ) : rankingComparison.length > 0 ? (
              <div className="space-y-4">
                {rankingComparison.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="font-medium text-sm">{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getChangeIcon(item.change)}
                        {getChangeBadge(item.change)}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.previous} → {item.current}
                      </span>
                      <span className={`font-medium ${item.textColor}`}>
                        {item.current} keywords
                      </span>
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${item.color}`}
                        style={{ 
                          width: summaryData?.total_keywords 
                            ? `${Math.min((item.current / summaryData.total_keywords) * 100, 100)}%` 
                            : '0%' 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No comparison data</h3>
                  <p className="text-muted-foreground text-sm">
                    Start tracking keywords to see ranking changes.
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