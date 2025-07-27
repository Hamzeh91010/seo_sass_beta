"use client";

import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import ProtectedRoute from '@/components/layout/protected-route';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  Search,
  Link as LinkIcon,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  Calendar,
  Plus,
  ArrowUpRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Link from 'next/link';

// Mock data
const mockRankingData = [
  { date: '2024-01-01', keywords: 85, avgPosition: 12.3 },
  { date: '2024-01-02', keywords: 87, avgPosition: 11.8 },
  { date: '2024-01-03', keywords: 92, avgPosition: 11.2 },
  { date: '2024-01-04', keywords: 95, avgPosition: 10.7 },
  { date: '2024-01-05', keywords: 98, avgPosition: 10.1 },
  { date: '2024-01-06', keywords: 102, avgPosition: 9.8 },
  { date: '2024-01-07', keywords: 105, avgPosition: 9.3 },
];

const mockRecentAudits = [
  { id: 1, domain: 'example.com', score: 85, date: '2024-01-07', issues: 3 },
  { id: 2, domain: 'demo-site.org', score: 92, date: '2024-01-06', issues: 1 },
  { id: 3, domain: 'test-website.net', score: 78, date: '2024-01-05', issues: 7 },
];

const mockTopKeywords = [
  { keyword: 'seo optimization', position: 3, change: 2, volume: 12000 },
  { keyword: 'digital marketing', position: 5, change: -1, volume: 8500 },
  { keyword: 'web analytics', position: 8, change: 3, volume: 6200 },
  { keyword: 'content strategy', position: 12, change: 0, volume: 4800 },
];

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const isRTL = i18n.language === 'ar';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {t('dashboard.welcome')}, {user?.firstName}!
              </h1>
              <p className="text-muted-foreground mt-1">
                Here's what's happening with your SEO campaigns today.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild>
                <Link href="/projects">
                  <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('projects.createProject')}
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.totalProjects')}
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.trackedKeywords')}
                </CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +15% from last week
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.auditsThisMonth')}
                </CardTitle>
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +23% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('dashboard.teamMembers')}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
                <p className="text-xs text-muted-foreground">
                  +1 new member this week
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Chart */}
            <div className="lg:col-span-2">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{t('dashboard.overview')}</CardTitle>
                  <CardDescription>
                    Your keyword ranking performance over the last 7 days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockRankingData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="date" 
                          className="text-xs fill-muted-foreground"
                          tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis className="text-xs fill-muted-foreground" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="keywords" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Recent Activity */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('dashboard.recentActivity')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">New backlink detected</p>
                      <p className="text-muted-foreground text-xs">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">Audit completed</p>
                      <p className="text-muted-foreground text-xs">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">Keyword ranking changed</p>
                      <p className="text-muted-foreground text-xs">3 hours ago</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plan Usage */}
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Plan Usage</CardTitle>
                  <CardDescription>
                    {user?.subscription?.plan} plan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Keywords</span>
                      <span>1,247 / 3,000</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Audits</span>
                      <span>47 / 100</span>
                    </div>
                    <Progress value={47} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Projects</span>
                      <span>12 / 30</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/billing">
                      Upgrade Plan
                      <ArrowUpRight className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Top Keywords */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{t('dashboard.topRankingKeywords')}</CardTitle>
                <CardDescription>
                  Your best performing keywords this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTopKeywords.map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{keyword.keyword}</p>
                        <p className="text-xs text-muted-foreground">
                          {keyword.volume.toLocaleString()} monthly searches
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">#{keyword.position}</Badge>
                        {keyword.change > 0 && (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        )}
                        {keyword.change < 0 && (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        {keyword.change !== 0 && (
                          <span className={`text-xs ${keyword.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {keyword.change > 0 ? '+' : ''}{keyword.change}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Audits */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{t('dashboard.recentAudits')}</CardTitle>
                <CardDescription>
                  Latest site audit results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentAudits.map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{audit.domain}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(audit.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {audit.issues > 0 && (
                          <div className="flex items-center text-orange-600">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span className="text-xs">{audit.issues}</span>
                          </div>
                        )}
                        <div className={`text-sm font-medium px-2 py-1 rounded ${
                          audit.score >= 90 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          audit.score >= 70 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {audit.score}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4" asChild>
                  <Link href="/audits">
                    View all audits
                    <ArrowUpRight className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}