"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from '@/components/layout/protected-route';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  CreditCard,
  DollarSign,
  Activity,
  Search,
  MoreHorizontal,
  UserCheck,
  UserX,
  Eye,
  Server,
  Database,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data
const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    plan: 'Growth',
    status: 'active',
    joinedAt: '2024-01-15',
    lastLogin: '2024-01-07',
    revenue: 59,
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah@company.com',
    plan: 'Pro Agency',
    status: 'active',
    joinedAt: '2023-12-10',
    lastLogin: '2024-01-06',
    revenue: 149,
  },
  {
    id: 3,
    name: 'Mike Chen',
    email: 'mike@startup.io',
    plan: 'Starter',
    status: 'suspended',
    joinedAt: '2024-01-01',
    lastLogin: '2024-01-03',
    revenue: 29,
  },
];

const mockRevenueData = [
  { month: 'Sep', revenue: 12400 },
  { month: 'Oct', revenue: 15200 },
  { month: 'Nov', revenue: 18300 },
  { month: 'Dec', revenue: 22100 },
  { month: 'Jan', revenue: 25800 },
];

const mockSystemHealth = {
  server: { status: 'healthy', uptime: '99.9%', load: '23%' },
  database: { status: 'healthy', connections: '47/100', size: '2.3GB' },
  queue: { status: 'healthy', pending: 12, failed: 0 },
  scraper: { status: 'warning', active: 8, errors: 3 },
};

export default function AdminPage() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);

  const isRTL = i18n.language === 'ar';

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserAction = (userId: number, action: 'suspend' | 'activate' | 'view') => {
    if (action === 'view') {
      const user = users.find(u => u.id === userId);
      setSelectedUser(user);
      setShowUserDialog(true);
      return;
    }

    const newStatus = action === 'suspend' ? 'suspended' : 'active';
    setUsers(users.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getHealthStatus = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {t('admin.title')}
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage users, subscriptions, and monitor system health
            </p>
          </div>

          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('admin.totalUsers')}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,247</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('admin.activeSubscriptions')}
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">892</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('admin.revenue')}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$25,800</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +23% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('admin.systemStatus')}
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Healthy</div>
                <p className="text-xs text-muted-foreground">
                  99.9% uptime this month
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>
                    Monthly recurring revenue over the last 5 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mockRevenueData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                        <YAxis className="text-xs fill-muted-foreground" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px'
                          }}
                          formatter={(value) => [`$${value}`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t('admin.systemHealth')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getHealthStatus(mockSystemHealth.server.status)}
                    <span className={`text-sm font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
                      {t('admin.serverHealth')}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {mockSystemHealth.server.uptime}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getHealthStatus(mockSystemHealth.database.status)}
                    <span className={`text-sm font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
                      Database
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {mockSystemHealth.database.connections}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getHealthStatus(mockSystemHealth.queue.status)}
                    <span className={`text-sm font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
                      {t('admin.queueStatus')}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {mockSystemHealth.queue.pending} pending
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {getHealthStatus(mockSystemHealth.scraper.status)}
                    <span className={`text-sm font-medium ${isRTL ? 'mr-2' : 'ml-2'}`}>
                      Scrapers
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {mockSystemHealth.scraper.active} active
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('admin.userManagement')}</CardTitle>
                  <CardDescription>
                    Manage user accounts and subscriptions
                  </CardDescription>
                </div>
                <div className="relative w-72">
                  <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4`} />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={isRTL ? 'pr-10' : 'pl-10'}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.plan}</Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">${user.revenue}/mo</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(user.lastLogin).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUserAction(user.id, 'view')}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('admin.viewDetails')}
                            </DropdownMenuItem>
                            {user.status === 'active' ? (
                              <DropdownMenuItem 
                                onClick={() => handleUserAction(user.id, 'suspend')}
                                className="text-destructive"
                              >
                                <UserX className="h-4 w-4 mr-2" />
                                {t('admin.suspend')}
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUserAction(user.id, 'activate')}>
                                <UserCheck className="h-4 w-4 mr-2" />
                                {t('admin.activate')}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* User Details Dialog */}
          <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>
                  Detailed information about {selectedUser?.name}
                </DialogDescription>
              </DialogHeader>
              
              {selectedUser && (
                <div className="space-y-4 py-4">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="text-lg">
                        {selectedUser.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedUser.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Plan:</span>
                      <p className="text-muted-foreground">{selectedUser.plan}</p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <p className="text-muted-foreground">{selectedUser.status}</p>
                    </div>
                    <div>
                      <span className="font-medium">Revenue:</span>
                      <p className="text-muted-foreground">${selectedUser.revenue}/month</p>
                    </div>
                    <div>
                      <span className="font-medium">Joined:</span>
                      <p className="text-muted-foreground">
                        {new Date(selectedUser.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </ProtectedRoute>
  );
}