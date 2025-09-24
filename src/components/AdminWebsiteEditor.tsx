import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useWebsiteContent } from '@/hooks/useWebsiteContent';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Save, 
  Eye, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  AlertTriangle,
  History,
  Clock,
  CheckCircle
} from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/editor.css';

const SECTIONS = [
  { id: 'hero', name: 'Hero Section', description: 'Main landing section with title and call-to-action' },
  { id: 'about', name: 'About Section', description: 'What is UC Investments Academy section' },
  { id: 'program', name: 'Program Section', description: 'Our Complete Program section with process stages and features' },
  { id: 'benefits', name: 'Benefits Section', description: 'Why Choose UC Investments Academy section with benefit cards' },
  { id: 'how-it-works', name: 'How It Works', description: 'How the Program Works section with program components' },
  { id: 'faq', name: 'FAQ Section', description: 'Frequently Asked Questions section with Q&A pairs' },
];

const ICON_OPTIONS = [
  'TrendingUp', 'BookOpen', 'Network', 'Users', 'Target', 'GraduationCap', 
  'Building', 'Award', 'CheckCircle', 'Star', 'Shield', 'Zap'
];

const AdminWebsiteEditor = () => {
  const { content, loading, updateContent, uploadImage, getContentBySection } = useWebsiteContent();
  const [activeSection, setActiveSection] = useState('hero');
  const [editingData, setEditingData] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const currentContent = getContentBySection(activeSection);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !editingData[activeSection] || Object.keys(editingData[activeSection]).length === 0) {
      return;
    }

    setAutoSaving(true);
    try {
      await updateContent(activeSection, editingData[activeSection]);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
      setEditingData((prev) => ({
        ...prev,
        [activeSection]: {},
      }));
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setAutoSaving(false);
    }
  }, [activeSection, editingData, hasUnsavedChanges, updateContent]);

  // Set up auto-save interval
  useEffect(() => {
    if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }

    autoSaveIntervalRef.current = setInterval(autoSave, 30000); // Auto-save every 30 seconds

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [autoSave]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleInputChange = (field: string, value: string) => {
    setEditingData((prev: Record<string, any>) => ({
      ...prev,
      [activeSection]: {
        ...prev[activeSection],
        [field]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleMetadataChange = (key: string, value: any) => {
    setEditingData((prev: Record<string, any>) => ({
      ...prev,
      [activeSection]: {
        ...prev[activeSection],
        metadata: {
          ...prev[activeSection]?.metadata,
          [key]: value,
        },
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleArrayItemAdd = (metadataKey: string, newItem: any) => {
    const currentArray = getCurrentMetadata(metadataKey) || [];
    handleMetadataChange(metadataKey, [...currentArray, newItem]);
  };

  const handleArrayItemUpdate = (metadataKey: string, index: number, updatedItem: any) => {
    const currentArray = getCurrentMetadata(metadataKey) || [];
    const newArray = [...currentArray];
    newArray[index] = updatedItem;
    handleMetadataChange(metadataKey, newArray);
  };

  const handleArrayItemDelete = (metadataKey: string, index: number) => {
    const currentArray = getCurrentMetadata(metadataKey) || [];
    const newArray = currentArray.filter((_: any, i: number) => i !== index);
    handleMetadataChange(metadataKey, newArray);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await uploadImage(file, activeSection);
      handleInputChange('image_url', imageUrl);
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContent(activeSection, editingData[activeSection] || {});
      setEditingData((prev) => ({
        ...prev,
        [activeSection]: {},
      }));
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditingData((prev) => ({
      ...prev,
      [activeSection]: {},
    }));
    setHasUnsavedChanges(false);
  };

  const getCurrentValue = (field: string) => {
    return editingData[activeSection]?.[field] ?? currentContent?.[field] ?? '';
  };

  const getCurrentMetadata = (key: string) => {
    return editingData[activeSection]?.metadata?.[key] ?? currentContent?.metadata?.[key] ?? '';
  };

  const renderFAQEditor = () => {
    const faqs = getCurrentMetadata('faqs') || [];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">FAQ Items</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleArrayItemAdd('faqs', { question: '', answer: '' })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ
          </Button>
        </div>
        
        {faqs.map((faq: any, index: number) => (
          <Card key={index} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">FAQ #{index + 1}</Badge>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleArrayItemDelete('faqs', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>Question</Label>
                <Input
                  value={faq.question}
                  onChange={(e) => handleArrayItemUpdate('faqs', index, { ...faq, question: e.target.value })}
                  placeholder="Enter question"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Answer</Label>
                <Textarea
                  value={faq.answer}
                  onChange={(e) => handleArrayItemUpdate('faqs', index, { ...faq, answer: e.target.value })}
                  placeholder="Enter answer"
                  rows={3}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderBenefitsEditor = () => {
    const benefits = getCurrentMetadata('benefits') || [];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Benefit Cards</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleArrayItemAdd('benefits', { title: '', description: '', icon: 'Target' })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Benefit
          </Button>
        </div>
        
        {benefits.map((benefit: any, index: number) => (
          <Card key={index} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Benefit #{index + 1}</Badge>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleArrayItemDelete('benefits', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={benefit.title}
                    onChange={(e) => handleArrayItemUpdate('benefits', index, { ...benefit, title: e.target.value })}
                    placeholder="Enter benefit title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select
                    value={benefit.icon}
                    onValueChange={(value) => handleArrayItemUpdate('benefits', index, { ...benefit, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map(icon => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={benefit.description}
                  onChange={(e) => handleArrayItemUpdate('benefits', index, { ...benefit, description: e.target.value })}
                  placeholder="Enter benefit description"
                  rows={2}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderProgramFeaturesEditor = () => {
    const features = getCurrentMetadata('features') || [];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Program Features</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleArrayItemAdd('features', { title: '', description: '', icon: 'TrendingUp' })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </div>
        
        {features.map((feature: any, index: number) => (
          <Card key={index} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Feature #{index + 1}</Badge>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleArrayItemDelete('features', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={feature.title}
                    onChange={(e) => handleArrayItemUpdate('features', index, { ...feature, title: e.target.value })}
                    placeholder="Enter feature title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select
                    value={feature.icon}
                    onValueChange={(value) => handleArrayItemUpdate('features', index, { ...feature, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map(icon => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={feature.description}
                  onChange={(e) => handleArrayItemUpdate('features', index, { ...feature, description: e.target.value })}
                  placeholder="Enter feature description"
                  rows={2}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  const renderComponentsEditor = () => {
    const components = getCurrentMetadata('components') || [];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Program Components</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleArrayItemAdd('components', { title: '', icon: 'BookOpen', items: [] })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Component
          </Button>
        </div>
        
        {components.map((component: any, index: number) => (
          <Card key={index} className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">Component #{index + 1}</Badge>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleArrayItemDelete('components', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={component.title}
                    onChange={(e) => handleArrayItemUpdate('components', index, { ...component, title: e.target.value })}
                    placeholder="Enter component title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select
                    value={component.icon}
                    onValueChange={(value) => handleArrayItemUpdate('components', index, { ...component, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ICON_OPTIONS.map(icon => (
                        <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Items</Label>
                <Textarea
                  value={(component.items || []).join('\n')}
                  onChange={(e) => handleArrayItemUpdate('components', index, { 
                    ...component, 
                    items: e.target.value.split('\n').filter(item => item.trim()) 
                  })}
                  placeholder="Enter items (one per line)"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">Enter each item on a new line</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading website content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit Website Content</h1>
          <p className="text-muted-foreground">
            Update website sections with real-time preview capabilities
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Status indicators */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {autoSaving && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 animate-spin" />
                <span>Auto-saving...</span>
              </div>
            )}
            {hasUnsavedChanges && !autoSaving && (
              <div className="flex items-center gap-1 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span>Unsaved changes</span>
              </div>
            )}
            {lastSaved && !hasUnsavedChanges && !autoSaving && (
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              </div>
            )}
          </div>
          
          <Button
            variant="outline"
            onClick={() => window.open('/', '_blank')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Website
          </Button>
        </div>
      </div>

      <Tabs value={activeSection} onValueChange={setActiveSection}>
        <TabsList className="grid w-full grid-cols-6">
          {SECTIONS.map((section) => (
            <TabsTrigger key={section.id} value={section.id} className="text-xs">
              {section.name}
              {hasUnsavedChanges && activeSection === section.id && (
                <span className="ml-1 w-2 h-2 bg-amber-500 rounded-full"></span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {SECTIONS.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <Card>
              <CardHeader>
                <CardTitle>{section.name}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Fields */}
                <div className="grid gap-6">
                  {/* Title Field */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Section Title</Label>
                    <Input
                      id="title"
                      value={getCurrentValue('title')}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Enter section title"
                    />
                  </div>

                  {/* Subtitle Field */}
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle (Optional)</Label>
                    <Input
                      id="subtitle"
                      value={getCurrentValue('subtitle')}
                      onChange={(e) => handleInputChange('subtitle', e.target.value)}
                      placeholder="Enter subtitle"
                    />
                  </div>

                  {/* Content Field */}
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <div className="min-h-[200px]">
                      <ReactQuill
                        theme="snow"
                        value={getCurrentValue('content')}
                        onChange={(value) => handleInputChange('content', value)}
                        placeholder="Enter section content..."
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                            ['blockquote', 'code-block'],
                            ['link'],
                            ['clean']
                          ],
                        }}
                        style={{ height: '150px' }}
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>Section Image</Label>
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {uploading ? 'Uploading...' : 'Upload Image'}
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                      />
                      {getCurrentValue('image_url') && (
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          <span className="text-sm text-muted-foreground">Image uploaded</span>
                        </div>
                      )}
                    </div>
                    {getCurrentValue('image_url') && (
                      <div className="mt-2">
                        <img
                          src={getCurrentValue('image_url')}
                          alt="Preview"
                          className="max-w-xs h-auto rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Section-Specific Fields */}
                {section.id === 'hero' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Call-to-Action Buttons</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cta_primary">Primary CTA Button Text</Label>
                        <Input
                          id="cta_primary"
                          value={getCurrentMetadata('cta_primary')}
                          onChange={(e) => handleMetadataChange('cta_primary', e.target.value)}
                          placeholder="Access Portal"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cta_secondary">Secondary CTA Button Text</Label>
                        <Input
                          id="cta_secondary"
                          value={getCurrentMetadata('cta_secondary')}
                          onChange={(e) => handleMetadataChange('cta_secondary', e.target.value)}
                          placeholder="Explore the Program"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {section.id === 'faq' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">FAQ Management</h3>
                    {renderFAQEditor()}
                  </div>
                )}

                {section.id === 'benefits' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Benefits Management</h3>
                    {renderBenefitsEditor()}
                  </div>
                )}

                {section.id === 'program' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Program Features</h3>
                    {renderProgramFeaturesEditor()}
                    
                    <div className="space-y-2">
                      <Label htmlFor="closing_text">Closing Text</Label>
                      <Textarea
                        id="closing_text"
                        value={getCurrentMetadata('closing_text')}
                        onChange={(e) => handleMetadataChange('closing_text', e.target.value)}
                        placeholder="Enter closing text for the program section"
                        rows={2}
                      />
                    </div>
                  </div>
                )}

                {section.id === 'how-it-works' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Program Components</h3>
                    {renderComponentsEditor()}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button variant="outline" onClick={resetForm}>
                    Reset Changes
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminWebsiteEditor;