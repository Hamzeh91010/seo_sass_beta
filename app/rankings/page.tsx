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

export default function RankingsRedirectPage() {
  const { t, i18n } = useTranslation();
  const { push } = useRouter();

  const isRTL = i18n.language === 'ar';
  
  // Fetch user's projects
  const { data: projects, isLoading } = useSWR('/projects', fetcher);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {/* Project Selection */}
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <BarChart3 className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Select a Project</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Choose a project to view its keyword rankings and performance analytics
            </p>
            
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                <span>Loading projects...</span>
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
                {projects.map((project: any) => (
                  <Card 
                    key={project.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 group"
                    onClick={() => push(`/rankings/${project.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="flex items-center">
                        <Globe className="h-3 w-3 mr-1" />
                        {project.url}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-muted-foreground">
                            {project.keywords || 0} keywords
                          </span>
                          <Badge variant="outline">
                            {project.search_engine}
                          </Badge>
                        </div>
                        <div className="flex items-center text-primary">
                          <span className="text-xs mr-1">View Rankings</span>
                          <BarChart3 className="h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <p className="text-muted-foreground mb-6">
                  You don't have any projects yet. Create your first project to start tracking keyword rankings.
                </p>
                <Button asChild>
                  <Link href="/projects">
                    <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    Create Your First Project
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}