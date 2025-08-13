"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from '@/components/layout/protected-route';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Tag,
  X,
  Save,
  RotateCcw,
  Loader2,
  AlertCircle,
  Hash,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { api } from '@/lib/api';

// Data fetcher
const fetcher = (url: string) => api.get(url).then(res => res.data);

interface TagData {
  id: number;
  name: string;
  color?: string;
  keywords_count?: number;
}

interface KeywordData {
  id: number;
  keyword: string;
  tag?: string;
}

export default function TagsKeywordsPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  // State management
  const [selectedTag, setSelectedTag] = useState<TagData | null>(null);
  const [keywordInput, setKeywordInput] = useState('');
  const [keywordPills, setKeywordPills] = useState<string[]>([]);
  const [originalKeywords, setOriginalKeywords] = useState<string[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Dialog states
  const [showAddTagDialog, setShowAddTagDialog] = useState(false);
  const [showEditTagDialog, setShowEditTagDialog] = useState(false);
  const [showDeleteTagDialog, setShowDeleteTagDialog] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  
  // Form states
  const [tagName, setTagName] = useState('');
  const [editingTag, setEditingTag] = useState<TagData | null>(null);
  const [deletingTag, setDeletingTag] = useState<TagData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRTL = i18n.language === 'ar';

  // Fetch project tags
  const { data: tags, error: tagsError, mutate: mutateTags, isLoading: tagsLoading } = useSWR<TagData[]>(
    projectId ? `/projects/${projectId}/tags` : null,
    fetcher
  );

  // Fetch keywords for selected tag
  const { data: tagKeywords, mutate: mutateTagKeywords, isLoading: keywordsLoading } = useSWR<KeywordData[]>(
    selectedTag ? `/projects/${projectId}/tags/${selectedTag.id}/keywords` : null,
    fetcher
  );

  // Fetch project info for header
  const { data: project } = useSWR(
    projectId ? `/projects/${projectId}` : null,
    fetcher
  );

  // Role-based permissions
  const canEdit = project?.role === 'owner' || project?.role === 'editor';
  const canDelete = project?.role === 'owner' || project?.role === 'editor';

  // Load keywords when tag is selected
  useEffect(() => {
    if (tagKeywords) {
      const keywords = tagKeywords.map(k => k.keyword);
      setKeywordPills(keywords);
      setOriginalKeywords(keywords);
      setHasUnsavedChanges(false);
    }
  }, [tagKeywords]);

  // Track unsaved changes
  useEffect(() => {
    const currentSet = new Set(keywordPills);
    const originalSet = new Set(originalKeywords);
    
    const hasChanges = currentSet.size !== originalSet.size || 
      [...currentSet].some(keyword => !originalSet.has(keyword));
    
    setHasUnsavedChanges(hasChanges);
  }, [keywordPills, originalKeywords]);

  // Handle keyword input
  const handleKeywordInput = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      const newKeyword = keywordInput.trim().toLowerCase();
      
      // Check for duplicates
      if (!keywordPills.some(pill => pill.toLowerCase() === newKeyword)) {
        setKeywordPills(prev => [...prev, keywordInput.trim()]);
        setKeywordInput('');
      } else {
        toast.error('Keyword already exists');
      }
    }
  }, [keywordInput, keywordPills]);

  // Remove keyword pill
  const removeKeywordPill = useCallback((index: number) => {
    setKeywordPills(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle tag selection
  const handleTagSelect = useCallback((tag: TagData) => {
    if (hasUnsavedChanges) {
      setShowUnsavedChangesDialog(true);
      return;
    }
    setSelectedTag(tag);
  }, [hasUnsavedChanges]);

  // Add new tag
  const handleAddTag = async () => {
    if (!tagName.trim()) {
      toast.error('Tag name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/projects/${projectId}/tags`, {
        name: tagName.trim(),
      });
      
      setTagName('');
      setShowAddTagDialog(false);
      mutateTags();
      toast.success('Tag added successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to add tag';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit tag
  const handleEditTag = async () => {
    if (!editingTag || !tagName.trim()) {
      toast.error('Tag name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.put(`/projects/${projectId}/tags/${editingTag.id}`, {
        name: tagName.trim(),
      });
      
      setTagName('');
      setEditingTag(null);
      setShowEditTagDialog(false);
      mutateTags();
      toast.success('Tag updated successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to update tag';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete tag
  const handleDeleteTag = async () => {
    if (!deletingTag) return;

    setIsSubmitting(true);
    try {
      await api.delete(`/projects/${projectId}/tags/${deletingTag.id}`);
      
      if (selectedTag?.id === deletingTag.id) {
        setSelectedTag(null);
        setKeywordPills([]);
        setOriginalKeywords([]);
      }
      
      setDeletingTag(null);
      setShowDeleteTagDialog(false);
      mutateTags();
      toast.success('Tag deleted successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete tag';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save keywords
  const handleSaveKeywords = async () => {
    if (!selectedTag) return;

    setIsSubmitting(true);
    try {
      await api.post(`/projects/${projectId}/tags/${selectedTag.id}/keywords/save`, {
        keywords: keywordPills,
      });
      
      setOriginalKeywords([...keywordPills]);
      setHasUnsavedChanges(false);
      mutateTagKeywords();
      toast.success('Keywords saved successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to save keywords';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel changes
  const handleCancelChanges = () => {
    setKeywordPills([...originalKeywords]);
    setHasUnsavedChanges(false);
    setKeywordInput('');
  };

  // Open edit dialog
  const openEditDialog = (tag: TagData) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setShowEditTagDialog(true);
  };

  // Open delete dialog
  const openDeleteDialog = (tag: TagData) => {
    setDeletingTag(tag);
    setShowDeleteTagDialog(true);
  };

  if (!projectId) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Invalid Project</h1>
              <p className="text-muted-foreground mb-4">Project ID is missing or invalid.</p>
              <Button asChild>
                <Link href="/projects">Back to Projects</Link>
              </Button>
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <Button variant="ghost" className="mb-4 p-0" asChild>
                <Link href={`/rankings/${projectId}`}>
                  <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  Back to Rankings
                </Link>
              </Button>
              <h1 className="text-3xl font-bold text-foreground">
                Tags & Keywords Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Organize keywords with tags for {project?.name || `Project #${projectId}`}
              </p>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Tags Panel (Left) */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      <Tag className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      Tags
                    </CardTitle>
                    <CardDescription>
                      Organize your keywords with tags
                    </CardDescription>
                  </div>
                  {canEdit && (
                    <Button
                      size="sm"
                      onClick={() => setShowAddTagDialog(true)}
                      className="shrink-0"
                    >
                      <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      Add Tag
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {tagsLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
                    ))}
                  </div>
                ) : tagsError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <p className="text-muted-foreground">Failed to load tags</p>
                  </div>
                ) : !tags || tags.length === 0 ? (
                  <div className="text-center py-8">
                    <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No tags yet</p>
                    {canEdit && (
                      <Button onClick={() => setShowAddTagDialog(true)}>
                        <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        Create Your First Tag
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tags.map((tag) => (
                      <div
                        key={tag.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                          selectedTag?.id === tag.id
                            ? 'bg-primary/10 border-primary'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                        onClick={() => handleTagSelect(tag)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-primary rounded-full" />
                          <div>
                            <p className="font-medium">{tag.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {tag.keywords_count || 0} keywords
                            </p>
                          </div>
                        </div>
                        
                        {canEdit && (
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(tag);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDeleteDialog(tag);
                                }}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Keywords Panel (Right) */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  Keywords
                  {selectedTag && (
                    <Badge variant="outline" className="ml-2">
                      {selectedTag.name}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {selectedTag 
                    ? 'Add and manage keywords for the selected tag'
                    : 'Select a tag to manage its keywords'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedTag ? (
                  <div className="text-center py-12">
                    <Tag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Tag Selected</h3>
                    <p className="text-muted-foreground">
                      Select a tag from the left panel to manage its keywords
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Keyword Input */}
                    {canEdit && (
                      <div className="space-y-2">
                        <Label htmlFor="keyword-input">Add Keywords</Label>
                        <Input
                          id="keyword-input"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyDown={handleKeywordInput}
                          placeholder="Type a keyword and press Enter..."
                          disabled={isSubmitting}
                        />
                        <p className="text-xs text-muted-foreground">
                          Press Enter to add each keyword. Duplicates will be skipped.
                        </p>
                      </div>
                    )}

                    {/* Keyword Pills */}
                    <div className="space-y-2">
                      <Label>Keywords ({keywordPills.length})</Label>
                      {keywordsLoading ? (
                        <div className="flex flex-wrap gap-2">
                          {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-8 w-20 bg-muted animate-pulse rounded-full" />
                          ))}
                        </div>
                      ) : keywordPills.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No keywords yet</p>
                          {canEdit && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Start typing above to add keywords
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg min-h-[100px]">
                          {keywordPills.map((keyword, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="flex items-center space-x-2 px-3 py-1"
                            >
                              <span>{keyword}</span>
                              {canEdit && (
                                <button
                                  onClick={() => removeKeywordPill(index)}
                                  className="ml-2 hover:text-destructive transition-colors"
                                  disabled={isSubmitting}
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {canEdit && hasUnsavedChanges && (
                      <div className="flex items-center justify-end space-x-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={handleCancelChanges}
                          disabled={isSubmitting}
                        >
                          <RotateCcw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveKeywords}
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          ) : (
                            <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          )}
                          Save Keywords
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Add Tag Dialog */}
        <Dialog open={showAddTagDialog} onOpenChange={setShowAddTagDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tag</DialogTitle>
              <DialogDescription>
                Create a new tag to organize your keywords
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tag-name">Tag Name</Label>
                <Input
                  id="tag-name"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Enter tag name"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddTagDialog(false);
                  setTagName('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleAddTag} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                ) : (
                  <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                )}
                Add Tag
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Tag Dialog */}
        <Dialog open={showEditTagDialog} onOpenChange={setShowEditTagDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
              <DialogDescription>
                Update the tag name
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tag-name">Tag Name</Label>
                <Input
                  id="edit-tag-name"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Enter tag name"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditTagDialog(false);
                  setTagName('');
                  setEditingTag(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleEditTag} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                ) : (
                  <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Tag Dialog */}
        <AlertDialog open={showDeleteTagDialog} onOpenChange={setShowDeleteTagDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Tag</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the tag "{deletingTag?.name}"? 
                This will remove the tag from all associated keywords. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteTag}
                disabled={isSubmitting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete Tag
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Unsaved Changes Dialog */}
        <AlertDialog open={showUnsavedChangesDialog} onOpenChange={setShowUnsavedChangesDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes to your keywords. Do you want to discard these changes?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Editing</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleCancelChanges();
                  setShowUnsavedChangesDialog(false);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Discard Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
}