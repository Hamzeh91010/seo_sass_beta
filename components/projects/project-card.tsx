"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Globe,
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  Activity,
  MoreHorizontal,
  Edit,
  Trash2,
  Search,
  FileBarChart,
  Pause,
  Play,
  Users,
  Crown,
  Eye,
  Edit3,
  Monitor,
  Smartphone,
  Clock,
  Zap,
  MapPin,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, is_paused: boolean) => void;
}

export default function ProjectCard({ project, onEdit, onDelete, onToggleStatus }: ProjectCardProps) {
  const { t, i18n } = useTranslation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const isRTL = i18n.language === 'ar';

  // Role-based permissions
  const isOwner = project.role === 'owner';
  const isEditor = project.role === 'editor';
  const canEdit = isOwner || isEditor;
  const canDelete = isOwner;
  const canToggleStatus = isOwner || isEditor;
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'archived':
        return <Badge variant="outline">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  const getRoleBadge = (role: string) => {
    const variants = {
      owner: { 
        icon: Crown, 
        className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
        label: 'Owner'
      },
      editor: { 
        icon: Edit3, 
        className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        label: 'Editor'
      },
      viewer: { 
        icon: Eye, 
        className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        label: 'Viewer'
      },
    };
    
    const config = variants[role as keyof typeof variants];
    if (!config) return null;
    
    const IconComponent = config.icon;
    
    return (
      <Badge className={config.className}>
        <IconComponent className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getTrackingFrequencyIcon = (frequency: string) => {
    switch (frequency?.toLowerCase()) {
      case 'daily':
        return <Zap className="h-3 w-3 text-green-600" />;
      case 'weekly':
        return <Clock className="h-3 w-3 text-blue-600" />;
      case 'manual':
        return <Clock className="h-3 w-3 text-gray-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    return deviceType?.toLowerCase() === 'mobile' ? (
      <Smartphone className="h-3 w-3 text-primary" />
    ) : (
      <Monitor className="h-3 w-3 text-primary" />
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const handleToggleStatus = () => {
    const newStatus = project.is_paused === false;
    onToggleStatus(project.id, newStatus);
    
    // Trigger scraper when resuming project
    if (project.is_paused === true && canToggleStatus) {
      handleTriggerScraper();
    }
  };

  const handleTriggerScraper = async () => {
    try {
      await api.post(`/projects/${project.id}/scrape`, {
        search_engines: [project.search_engine],
        region: project.target_region || 'Global',
        device: project.device_type || 'desktop'
      });
      toast.success('Rank tracking started for this project');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to start rank tracking';
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-200 group border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {project.name}
              </CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Globe className="h-3 w-3 mr-1" />
                {project.url}
              </CardDescription>
              {project.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {project.description}
                </p>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem onClick={() => onEdit(project)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Settings
                  </DropdownMenuItem>
                )}
                {canToggleStatus && (
                  <DropdownMenuItem onClick={handleToggleStatus}>
                    {project.is_paused === false ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Project
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Resume Project
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Primary Badges Row */}
          <div className="flex items-center flex-wrap gap-2 mt-3">
            {getStatusBadge(project.is_paused === false ? 'active' : 'paused')}
            {project.role && getRoleBadge(project.role)}
            {getSearchEngineBadge(project.search_engine)}
          </div>

          {/* Secondary Info Row */}
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[80px]">{project.target_region}</span>
              </div>
              <div className="flex items-center space-x-1">
                {getDeviceIcon(project.device_type)}
                <span className="capitalize">{project.device_type}</span>
              </div>
              <div className="flex items-center space-x-1">
                {getTrackingFrequencyIcon(project.tracking_frequency)}
                <span className="capitalize">{project.tracking_frequency}</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {project.language}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center">
                <Search className="h-4 w-4 text-primary mr-1" />
                <span className="text-sm font-medium">{project.keywords || 0}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Keywords</p>
            </div>
            
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center">
                <Users className="h-4 w-4 text-primary mr-1" />
                <span className="text-sm font-medium">
                  {project.members || 1}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Members</p>
            </div>
          </div>

          {/* Performance */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              Last audit: {formatDate(project.lastAudit ?? null)}
            </div>
            
            {/* <div className="flex items-center">
              {project.change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : project.change < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              ) : null}
              <span className={`text-sm font-medium ${
                project.change > 0 ? 'text-green-600' : 
                project.change < 0 ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                {project.change > 0 ? '+' : ''}{project.change}%
              </span>
            </div> */}
            <div className="flex items-center">
              {typeof project.change === 'number' && project.change > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              ) : typeof project.change === 'number' && project.change < 0 ? (
                <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              ) : null}
              
              <span
                className={`text-sm font-medium ${
                  typeof project.change === 'number'
                    ? project.change > 0
                      ? 'text-green-600'
                      : project.change < 0
                      ? 'text-red-600'
                      : 'text-muted-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                {typeof project.change === 'number'
                  ? `${project.change > 0 ? '+' : ''}${project.change}%`
                  : '0%'}
              </span>
            </div>

          </div>

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/projects/${project.id}/keywords`}>
                <Search className="h-3 w-3 mr-1" />
                Keywords
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/projects/${project.id}/audits`}>
                <FileBarChart className="h-3 w-3 mr-1" />
                Audits
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href={`/projects/${project.id}/tags`}>
                <Tag className="h-3 w-3 mr-1" />
                Tags
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {canDelete && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{project.name}"? This action cannot be undone and will remove all associated keywords, audits, and data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  onDelete(project.id);
                  setShowDeleteDialog(false);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}