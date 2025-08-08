"use client";

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from '@/components/layout/protected-route';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  BarChart3,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Loader2,
  AlertCircle,
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Data fetcher
const fetcher = (url: string) => api.get(url).then(res => res.data);

interface KeywordRanking {
  id: number;
  keyword_id: number;
  project_id: number;
  search_engine: 'Google' | 'Bing' | 'Yahoo';
  region: string;
  device: 'desktop' | 'mobile';
  position: number | null;
  title: string | null;
  url: string | null;
  snippet: string | null;
  checked_at: string;
  keyword: {
    id: number;
    keyword: string;
    tag?: string;
  };
  project: {
    id: number;
    name: string;
  };
}

interface Project {
  id: number;
  name: string;
  is_paused: boolean;
  role: 'owner' | 'editor' | 'viewer';
}

const ITEMS_PER_PAGE = 50;

export default function RankingsPage() {
  const { t, i18n } = useTranslation();
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchEngine, setSearchEngine] = useState<string>('all');
  const [device, setDevice] = useState<string>('all');
  const [region, setRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'keyword' | 'position' | 'checked_at'>('checked_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedKeywordInfo, setSelectedKeywordInfo] = useState<{
    id: number;
    projectId: number;
    engine: string;
    device: string;
    region: string;
  } | null>(null);

  const isRTL = i18n.language === 'ar';
  const { data: projects } = useSWR<Project[]>('/projects', fetcher);

  // Fetch rankings with filters
  const rankingsUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (selectedProject !== 'all') params.append('project_id', selectedProject);
    if (searchEngine !== 'all') params.append('search_engine', searchEngine);
    if (device !== 'all') params.append('device', device);
    if (region !== 'all') params.append('region', region);
    params.append('page', currentPage.toString());
    params.append('limit', ITEMS_PER_PAGE.toString());
    // params.append('sort_by', sortBy);
    // params.append('sort_order', sortOrder);
    if (searchTerm) params.append('search', searchTerm);
    
    return `/rankings/?${params.toString()}`;
  }, [selectedProject, searchEngine, device, region, currentPage, sortBy, sortOrder, searchTerm]);

  const { data: rankingsData, error, isLoading, mutate } = useSWR(rankingsUrl, fetcher);
  const rankings = rankingsData?.rankings || [];

  const totalCount = rankingsData?.total || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const sortedRankings = useMemo(() => {
    const sorted = [...rankings];
    sorted.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (sortBy === 'keyword') {
        return sortOrder === 'asc'
          ? a.keyword.keyword.localeCompare(b.keyword.keyword)
          : b.keyword.keyword.localeCompare(a.keyword.keyword);
      }

      if (sortBy === 'checked_at') {
        return sortOrder === 'asc'
          ? new Date(aVal).getTime() - new Date(bVal).getTime()
          : new Date(bVal).getTime() - new Date(aVal).getTime();
      }

      if (sortBy === 'position') {
        return sortOrder === 'asc'
          ? (aVal ?? 9999) - (bVal ?? 9999)
          : (bVal ?? 9999) - (aVal ?? 9999);
      }

      return 0;
    });

    return sorted;
  }, [rankings, sortBy, sortOrder]);


  const { data: keywordHistory } = useSWR(
    selectedKeywordInfo
      ? `/rankings/history?keyword_id=${selectedKeywordInfo.id}&project_id=${selectedKeywordInfo.projectId}&search_engine=${selectedKeywordInfo.engine}&device=${selectedKeywordInfo.device}&region=${selectedKeywordInfo.region}`
      : null,
    fetcher
  );
  
  console.log("Keyword history:", keywordHistory);


  const getPositionBadge = (position: number | null) => {
    if (!position) {
      return <Badge variant="secondary">Not Found</Badge>;
    }
    
    if (position <= 3) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">#{position}</Badge>;
    } else if (position <= 10) {
      return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">#{position}</Badge>;
    } else if (position <= 20) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">#{position}</Badge>;
    } else {
      return <Badge variant="outline">#{position}</Badge>;
    }
  };

  const getSearchEngineBadge = (engine: string) => {
    const colors = {
      Google: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      Bing: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      Yahoo: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    };
    
    return (
      <Badge variant="outline" className={colors[engine as keyof typeof colors] || ''}>
        {engine}
      </Badge>
    );
  };

  const getDeviceIcon = (deviceType: string) => {
    return deviceType === 'mobile' ? (
      <Smartphone className="h-4 w-4" />
    ) : (
      <Monitor className="h-4 w-4" />
    );
  };

  const handleSort = (column: 'keyword' | 'position' | 'checked_at') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedProject('all');
    setSearchEngine('all');
    setDevice('all');
    setRegion('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Failed to load rankings</h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading the ranking data.
              </p>
              <Button onClick={() => mutate()}>Try Again</Button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Keyword Rankings
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your keyword positions across search engines
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Keywords</label>
                  <div className="relative">
                    <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4`} />
                    <Input
                      placeholder="Search keywords..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={isRTL ? 'pr-10' : 'pl-10'}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Project</label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Projects</SelectItem>
                      {(projects || []).map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Engine</label>
                  <Select value={searchEngine} onValueChange={setSearchEngine}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Engines</SelectItem>
                      <SelectItem value="Google">Google</SelectItem>
                      <SelectItem value="Bing">Bing</SelectItem>
                      <SelectItem value="Yahoo">Yahoo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Device</label>
                  <Select value={device} onValueChange={setDevice}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Devices</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Region</label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      <SelectItem value="Global">Global</SelectItem>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="United Arab Emirates">United Arab Emirates</SelectItem>
                      <SelectItem value="Saudi Arabia">Saudi Arabia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Actions</label>
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-muted-foreground">
              Showing {rankings.length} of {totalCount.toLocaleString()} rankings
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              {/* <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [column, order] = value.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(column);
                setSortOrder(order);
                setCurrentPage(1);
              }}> */}
              <Select onValueChange={(value) => {
                const [column, order] = value.split('-') as [typeof sortBy, typeof sortOrder];

                // Even if same value, force reset
                setSortBy(column);
                setSortOrder(order);
                setCurrentPage(1);

                // Add this to force revalidation of SWR
                mutate();
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="checked_at-desc">Latest First</SelectItem>
                  <SelectItem value="checked_at-asc">Oldest First</SelectItem> */}
                  <SelectItem value="position-asc">Best Position</SelectItem>
                  <SelectItem value="position-desc">Worst Position</SelectItem>
                  <SelectItem value="keyword-asc">Keyword A-Z</SelectItem>
                  <SelectItem value="keyword-desc">Keyword Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Rankings Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading rankings...</span>
                </div>
              ) : rankings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No rankings found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or check back later for updated rankings.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('keyword')}
                            className="h-auto p-0 font-semibold"
                          >
                            Keyword
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>Project</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('position')}
                            className="h-auto p-0 font-semibold"
                          >
                            Position
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>Engine</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>Region</TableHead>
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('checked_at')}
                            className="h-auto p-0 font-semibold"
                          >
                            Last Check
                            <ArrowUpDown className="ml-2 h-4 w-4" />
                          </Button>
                        </TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* {rankings.map((ranking: KeywordRanking) => ( */}
                      {sortedRankings.map((ranking: KeywordRanking) => (
                        <TableRow key={ranking.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{ranking.keyword?.keyword || '-'}</div>
                              {ranking.keyword.tag && (
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {ranking.keyword.tag}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link 
                              href={`/projects/${ranking.project_id}`}
                              className="text-primary hover:underline"
                            >
                              {ranking.project.name}
                            </Link>
                          </TableCell>
                          <TableCell>
                            {getPositionBadge(ranking.position)}
                          </TableCell>
                          <TableCell>
                            {getSearchEngineBadge(ranking.search_engine)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {getDeviceIcon(ranking.device)}
                              <span className="ml-2 capitalize">{ranking.device}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                              {ranking.region}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(ranking.checked_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  // onClick={() => setSelectedKeyword(ranking.keyword_id)}
                                  onClick={() => setSelectedKeywordInfo({
                                    id: ranking.keyword_id,
                                    projectId: ranking.project_id,
                                    engine: ranking.search_engine,
                                    device: ranking.device,
                                    region: ranking.region,
                                  })}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Ranking History: {ranking.keyword.keyword}</DialogTitle>
                                  <DialogDescription>
                                    Position tracking over time for this keyword
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="mt-4">
                                  {keywordHistory && keywordHistory.length > 0 ? (
                                    <div className="h-80">
                                      <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={keywordHistory}>
                                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                          <XAxis 
                                            dataKey="checked_at" 
                                            className="text-xs fill-muted-foreground"
                                            tick={{ fontSize: 12, fill: '#999' }}
                                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                          />
                                          <YAxis 
                                            className="text-xs fill-muted-foreground"
                                            domain={[1, 100]}
                                            reversed
                                            tick={{ fontSize: 12, fill: '#999' }}
                                            tickFormatter={(value) => `#${value}`}
                                          />
                                          <Tooltip 
                                            contentStyle={{ 
                                              backgroundColor: 'hsl(var(--card))', 
                                              border: '1px solid hsl(var(--border))',
                                              borderRadius: '8px'
                                            }}
                                            formatter={(value) => [`Position ${value}`, 'Ranking']}
                                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                          />
                                          <Line 
                                            type="monotone" 
                                            dataKey="position" 
                                            stroke="hsl(var(--primary))" 
                                            strokeWidth={2}
                                            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                                          />
                                        </LineChart>
                                      </ResponsiveContainer>
                                    </div>
                                  ) : (
                                    <div className="text-center py-8">
                                      <p className="text-muted-foreground">No historical data available</p>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}