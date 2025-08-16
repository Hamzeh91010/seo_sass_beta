"use client";

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { ProjectCreate } from '@/lib/types';
import useSWR from 'swr';
import { api } from '@/lib/api';

// Data fetcher
const fetcher = (url: string) => api.get(url).then(res => res.data);

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProjectCreate) => Promise<void>;
}

export default function CreateProjectDialog({ open, onOpenChange, onSubmit }: CreateProjectDialogProps) {
  const { t, i18n } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch regions from API
  const { data: regionsData, isLoading: regionsLoading } = useSWR('/api/regions', fetcher);
  
  const [formData, setFormData] = useState<ProjectCreate>({
    name: '',
    url: '',
    description: '',
    search_engine: 'Google',
    target_region: 'Global',
    device_type: 'desktop',
    tracking_frequency: 'manual',
    language: 'English',
  });

  const isRTL = i18n.language === 'ar';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.url.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        name: '',
        url: '',
        description: '',
        search_engine: 'Google',
        target_region: 'Global',
        device_type: 'desktop',
        tracking_frequency: 'manual',
        language: 'English',
      });
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      url: '',
      description: '',
      search_engine: 'Google',
      target_region: 'Global',
      language: 'English',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Add a new project to start tracking its SEO performance
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter project name"
                required
                disabled={isSubmitting}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="url">Website URL *</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
                required
                disabled={isSubmitting}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the project"
                rows={3}
                disabled={isSubmitting}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Search Engine</Label>
                <Select
                  value={formData.search_engine}
                  onValueChange={(value: 'Google' | 'Bing' | 'Yahoo') => 
                    setFormData({ ...formData, search_engine: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Bing">Bing</SelectItem>
                    <SelectItem value="Yahoo">Yahoo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Target Region</Label>
                <Select
                  value={formData.target_region}
                  onValueChange={(value) => setFormData({ ...formData, target_region: value })}
                  disabled={isSubmitting || regionsLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {regionsLoading ? (
                      <SelectItem value="" disabled>Loading regions...</SelectItem>
                    ) : regionsData?.regions && regionsData.regions.length > 0 ? (
                      regionsData.regions.map((regionName: string) => (
                        <SelectItem key={regionName} value={regionName}>
                          {regionName}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="Global">Global</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="grid gap-2">
                <Label>Device Type</Label>
                <Select
                  value={formData.device_type}
                  onValueChange={(value: 'desktop' | 'mobile') => 
                    setFormData({ ...formData, device_type: value })
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Tracking Frequiency</Label>
                <Select
                  value={formData.tracking_frequency}
                  onValueChange={(value: 'manual' | 'daily' | 'weekly') => setFormData({ ...formData, tracking_frequency: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Arabic">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  Creating...
                </>
              ) : (
                'Create Project'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}