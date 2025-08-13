"use client";

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Settings,
  Play,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  Tag,
  Hash,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AnalyticsSummary from '@/components/rankings/analytics-summary';

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
  status?: 'ranked' | 'not_ranked' | 'not_tracked' | 'queued' | 'pending';
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

const ITEMS_PER_PAGE = 50;

export default function ProjectRankingsPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;

  const [searchTerm, setSearchTerm] = useState('');
  const [searchEngine, setSearchEngine] = useState<string>('all');
  const [device, setDevice] = useState<string>('all');
  const [region, setRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'keyword' | 'position' | 'checked_at'>('position');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedKeywordInfo, setSelectedKeywordInfo] = useState<{
    id: number;
    projectId: number;
    engine: string;
    device: string;
    region: string;
  } | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const isRTL = i18n.language === 'ar';

  // Fetch project data
  const { data: project, error: projectError } = useSWR(
    projectId ? `/projects/${projectId}` : null,
    fetcher
  );

  // Fetch rankings with filters
  const rankingsUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (searchEngine !== 'all') params.append('search_engine', searchEngine);
    if (device !== 'all') params.append('device', device);
    if (region !== 'all') params.append('region', region);
    params.append('page', currentPage.toString());
    params.append('limit', ITEMS_PER_PAGE.toString());
    if (searchTerm) params.append('search', searchTerm);
    
    return `/projects/${projectId}/rankings?${params.toString()}`;
  }, [projectId, searchEngine, device, region, currentPage, searchTerm]);

  const { data: rankingsData, error, isLoading, mutate } = useSWR(
    projectId ? rankingsUrl : null,
    fetcher
  );

  const rankings = rankingsData?.rankings || [];
  const totalCount = rankingsData?.total || 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Fetch keyword history for dialog
  const { data: keywordHistory } = useSWR(
    selectedKeywordInfo
      ? `/rankings/history?keyword_id=${selectedKeywordInfo.id}&project_id=${selectedKeywordInfo.projectId}`
      : null,
    fetcher
  );

  // Sort rankings with custom logic for position
  const sortedRankings = useMemo(() => {
    const sorted = [...rankings];
    
    if (sortBy === 'position') {
      // Custom sorting for position: ranked first, not ranked next, not tracked last
      sorted.sort((a, b) => {
        const aPos = a.position;
        const bPos = b.position;
        const aStatus = a.status || (aPos ? 'ranked' : 'not_ranked');
        const bStatus = b.status || (bPos ? 'ranked' : 'not_ranked');
        
        // Priority order: ranked > not_ranked > queued/pending > not_tracked
        const statusPriority = {
          'ranked': 1,
          'not_ranked': 2,
          'queued': 3,
          'pending': 3,
          'not_tracked': 4
        };
        
        const aPriority = statusPriority[aStatus as keyof typeof statusPriority] || 4;
        const bPriority = statusPriority[bStatus as keyof typeof statusPriority] || 4;
        
        if (aPriority !== bPriority) {
          return sortOrder === 'asc' ? aPriority - bPriority : bPriority - aPriority;
        }
        
        // Within same status, sort by position
        if (aPos && bPos) {
          return sortOrder === 'asc' ? aPos - bPos : bPos - aPos;
        }
        
        return 0;
      });
    } else {
      // Regular sorting for other columns
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

        return 0;
      });
    }

    return sorted;
  }, [rankings, sortBy, sortOrder]);

  // Handle manual tracking
  const handleManualTracking = async () => {
    if (!project || isTracking) return;

    setIsTracking(true);
    try {
      await api.post(`/projects/${projectId}/scrape`, {
        search_engines: [project.search_engine],
        region: project.target_region || 'Global',
        device: project.device_type || 'desktop',
      });
      
      toast.success('Manual tracking started successfully!');
      
      // Refresh rankings data
      mutate();
      
      // Simulate tracking completion after some time (you might want to poll for actual status)
      setTimeout(() => {
        setIsTracking(false);
        mutate();
      }, 30000); // 30 seconds
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to start manual tracking';
      toast.error(errorMessage);
      setIsTracking(false);
    }
  };

  const getPositionBadge = (ranking: KeywordRanking) => {
    const status = ranking.status || (ranking.position ? 'ranked' : 'not_ranked');
    
    switch (status) {
      case 'queued':
        return <Badge variant="secondary" className="animate-pulse">Queued</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="animate-pulse">Tracking...</Badge>;
      case 'not_tracked':
        return <Badge variant="outline">Not Tracked</Badge>;
      case 'not_ranked':
        return <Badge variant="secondary">Not Ranked</Badge>;
      default:
        // Ranked with position
        if (!ranking.position) {
          return <Badge variant="secondary">Not Ranked</Badge>;
        }
        
        if (ranking.position <= 3) {
          return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">#{ranking.position}</Badge>;
        } else if (ranking.position <= 10) {
          return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">#{ranking.position}</Badge>;
        } else if (ranking.position <= 20) {
          return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">#{ranking.position}</Badge>;
        } else {
          return <Badge variant="outline">#{ranking.position}</Badge>;
        }
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
      setSortOrder(column === 'position' ? 'asc' : 'desc');
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchEngine('all');
    setDevice('all');
    setRegion('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Check permissions
  const canManageKeywords = project?.role === 'owner' || project?.role === 'editor';
  const canTrack = project?.role === 'owner' || project?.role === 'editor';

  if (projectError || !projectId) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Project not found</h3>
              <p className="text-muted-foreground mb-4">
                The project you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button asChild>
                <Link href="/projects">Back to Projects</Link>
              </Button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

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
            <Button variant="ghost" className="mb-4 p-0" asChild>
              <Link href="/projects">
                <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                Back to Projects
              </Link>
            </Button>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Rankings - {project?.name}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Track keyword positions and performance for this project
                </p>
              </div>
              
              <div className="flex gap-2">
                {canManageKeywords && (
                  <Button variant="outline" asChild>
                    <Link href={`/projects/${projectId}/keywords`}>
                      <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      Manage Keywords
                    </Link>
                  </Button>
                )}
                
                {canManageKeywords && (
                  <Button variant="outline" asChild>
                    <Link href={`/projects/${projectId}/tags`}>
                      <Tag className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      Manage Tags
                    </Link>
                  </Button>
                )}
                
                {canTrack && (
                  <Button 
                    onClick={handleManualTracking}
                    disabled={isTracking}
                    className="min-w-[140px]"
                  >
                    {isTracking ? (
                      <>
                        <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        Tracking...
                      </>
                    ) : (
                      <>
                        <Play className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        Manual Tracking
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Analytics Summary */}
          <AnalyticsSummary
            selectedProject={projectId}
            searchEngine={searchEngine}
            device={device}
            region={region}
          />

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
              Showing {rankings.length} of {totalCount.toLocaleString()} keywords
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select onValueChange={(value) => {
                const [column, order] = value.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(column);
                setSortOrder(order);
                setCurrentPage(1);
                mutate();
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="position-asc">Best Position</SelectItem>
                  <SelectItem value="position-desc">Worst Position</SelectItem>
                  <SelectItem value="keyword-asc">Keyword A-Z</SelectItem>
                  <SelectItem value="keyword-desc">Keyword Z-A</SelectItem>
                  <SelectItem value="checked_at-desc">Latest First</SelectItem>
                  <SelectItem value="checked_at-asc">Oldest First</SelectItem>
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
                    {canManageKeywords 
                      ? "Add keywords to this project to start tracking rankings."
                      : "No keywords have been added to this project yet."
                    }
                  </p>
                  {canManageKeywords && (
                    <Button asChild>
                      <Link href={`/projects/${projectId}/keywords`}>
                        <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        Add Keywords
                      </Link>
                    </Button>
                  )}
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
                            {getPositionBadge(ranking)}
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