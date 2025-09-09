import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWebsiteContent } from '@/hooks/useWebsiteContent';
import { useToast } from '@/hooks/use-toast';
import { Upload, Save, Eye, Image as ImageIcon } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../styles/editor.css';

const SECTIONS = [
  { id: 'hero', name: 'Hero Section', description: 'Main landing section with title and call-to-action' },
  { id: 'about', name: 'About Section', description: 'What is UC Investments Academy section' },
  { id: 'program', name: 'Program Section', description: 'Our Complete Program section' },
  { id: 'benefits', name: 'Benefits Section', description: 'Why Choose UC Investments Academy section' },
  { id: 'how-it-works', name: 'How It Works', description: 'How the Program Works section' },
  { id: 'faq', name: 'FAQ Section', description: 'Frequently Asked Questions section' },
];

const AdminEditWebsite = () => {
  const { content, loading, updateContent, uploadImage, getContentBySection } = useWebsiteContent();
  const [activeSection, setActiveSection] = useState('hero');
  const [editingData, setEditingData] = useState<any>({});
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const currentContent = getContentBySection(activeSection);

  const handleInputChange = (field: string, value: string) => {
    setEditingData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMetadataChange = (key: string, value: string) => {
    setEditingData((prev: any) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [key]: value,
      },
    }));
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
      await updateContent(activeSection, editingData);
      setEditingData({});
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setEditingData({});
  };

  const getCurrentValue = (field: string) => {
    return editingData[field] ?? currentContent?.[field] ?? '';
  };

  const getCurrentMetadata = (key: string) => {
    return editingData.metadata?.[key] ?? currentContent?.metadata?.[key] ?? '';
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
        <div className="flex gap-2">
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

                {/* Hero Section Specific Fields */}
                {section.id === 'hero' && (
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
                )}

                {/* Action Buttons */}
                <div className="flex justify-between pt-4">
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

export default AdminEditWebsite;