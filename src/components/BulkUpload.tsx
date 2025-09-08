import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Users, 
  UserPlus, 
  UserX,
  FileText,
  Download,
  Mail
} from 'lucide-react';
import { useBulkUpload, type StudentRecord, type ValidationError, type ColumnMapping, type UploadResult } from '@/hooks/useBulkUpload';
import { useToast } from '@/hooks/use-toast';

interface BulkUploadProps {
  onUploadComplete?: (result: UploadResult) => void;
}

const BulkUpload: React.FC<BulkUploadProps> = ({ onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [mappingComplete, setMappingComplete] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [step, setStep] = useState<'upload' | 'mapping' | 'processing' | 'results'>('upload');
  
  const { 
    isProcessing, 
    progress, 
    currentStep, 
    parseFile, 
    suggestColumnMapping, 
    processUpload,
    sendConfirmationEmail 
  } = useBulkUpload();
  
  const { toast } = useToast();

  const SUPPORTED_FORMATS = ['csv', 'xlsx', 'xls'];
  const REQUIRED_MAPPINGS = {
    firstName: 'First Name',
    lastName: 'Last Name', 
    email: 'Email Address'
  };
  const OPTIONAL_MAPPINGS = {
    // Academic Info
    campus: 'UC Campus',
    gpa: 'Overall GPA',
    classStanding: 'Class Standing',
    major: 'Field of Study',
    graduationYear: 'Graduation Year',
    
    // Program Interest & Questions
    programInterest: 'Why Interested in Program',
    informFutureJobs: 'Inform About Future Jobs',
    investmentClubMember: 'Investment Club Member', 
    completeAssignments: 'Complete Assignments/Exit Survey',
    
    // Employment
    currentlyEmployed: 'Currently Employed',
    currentEmployer: 'Current Employer',
    currentPosition: 'Current Position',
    
    // Demographics
    firstGenerationStudent: 'First Generation Student',
    pellGrantEligible: 'Pell Grant Eligible',
    genderIdentity: 'Gender Identity',
    racialIdentity: 'Racial Identity',
    sexualOrientation: 'Sexual Orientation',
    
    // Contact/Files
    linkedinUrl: 'LinkedIn Profile',
    transcriptFile: 'Transcript File',
    consentFormFile: 'Consent Form',
    timestamp: 'Application Timestamp'
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files?.[0]) {
      await handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!extension || !SUPPORTED_FORMATS.includes(extension)) {
      toast({
        title: "Unsupported File Format",
        description: "Please upload a CSV, XLS, or XLSX file.",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);

    try {
      // Parse file to get column headers
      const data = await parseFile(file);
      if (data.length > 0) {
        const columns = Object.keys(data[0]);
        setFileColumns(columns);
        
        // Suggest column mapping
        const suggestedMapping = suggestColumnMapping(columns);
        setColumnMapping(suggestedMapping);
        
        // Check if all required fields are mapped
        const requiredMapped = Object.keys(REQUIRED_MAPPINGS).every(field =>
          Object.values(suggestedMapping).includes(field)
        );
        setMappingComplete(requiredMapped);
        
        setStep('mapping');
      }
    } catch (error: any) {
      toast({
        title: "File Parse Error",
        description: error.message || "Failed to parse file. Please check the file format.",
        variant: "destructive"
      });
    }
  };

  const handleColumnMappingChange = (fileColumn: string, mappedField: string) => {
    const newMapping = { ...columnMapping };
    
    // Remove any existing mapping to this field
    Object.keys(newMapping).forEach(key => {
      if (newMapping[key] === mappedField) {
        delete newMapping[key];
      }
    });
    
    // Add new mapping
    if (mappedField !== 'skip') {
      newMapping[fileColumn] = mappedField;
    } else {
      delete newMapping[fileColumn];
    }
    
    setColumnMapping(newMapping);
    
    // Check if all required fields are mapped
    const requiredMapped = Object.keys(REQUIRED_MAPPINGS).every(field =>
      Object.values(newMapping).includes(field)
    );
    setMappingComplete(requiredMapped);
  };

  const handleProcessUpload = async () => {
    if (!selectedFile || !mappingComplete) return;
    
    setStep('processing');
    
    try {
      const result = await processUpload(selectedFile, columnMapping);
      setUploadResult(result);
      setStep('results');
      
      // Send confirmation email
      if (result.uploadId) {
        await sendConfirmationEmail(result, selectedFile.name);
      }
      
      onUploadComplete?.(result);
      
      toast({
        title: result.success ? "Upload Successful" : "Upload Completed with Issues",
        description: result.success 
          ? `Successfully created ${result.successfulRecords} applications.`
          : `Created ${result.successfulRecords} applications with ${result.failedRecords} errors.`,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
      setStep('mapping');
    }
  };

  const handleStartOver = () => {
    setSelectedFile(null);
    setFileColumns([]);
    setColumnMapping({});
    setMappingComplete(false);
    setUploadResult(null);
    setStep('upload');
  };

  const exportErrorReport = () => {
    if (!uploadResult?.errors.length) return;
    
    const csvContent = [
      ['Row', 'Field', 'Value', 'Error Message'],
      ...uploadResult.errors.map(error => [
        error.row.toString(),
        error.field,
        error.value?.toString() || '',
        error.message
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-upload-errors-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderFileUpload = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Student Upload
        </CardTitle>
        <CardDescription>
          Upload Excel, CSV, or Google Sheets files to create multiple student applications at once
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {dragActive ? 'Drop your file here' : 'Drag and drop your file here'}
            </p>
            <p className="text-sm text-muted-foreground">
              Supports CSV, XLS, and XLSX files up to 10MB
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('file-input')?.click()}
              >
                Choose File
              </Button>
            </div>
          </div>
        </div>
        
        <input
          id="file-input"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />

        <Alert className="mt-4">
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>Required columns:</strong> First Name, Last Name, Email Address
            <br />
            <strong>Available optional columns:</strong> UC Campus, GPA, Class Standing, Field of Study, 
            Program Interest, Employment Status, Demographics, LinkedIn Profile, and more
            <br />
            The system will automatically detect and map common column variations.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );

  const renderColumnMapping = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Column Mapping
        </CardTitle>
        <CardDescription>
          Map your file columns to student fields. Required fields must be mapped to proceed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{selectedFile?.name}</p>
            <p className="text-sm text-muted-foreground">
              {fileColumns.length} columns detected
            </p>
          </div>
          <Button variant="outline" onClick={handleStartOver}>
            <X className="h-4 w-4 mr-2" />
            Change File
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          {fileColumns.map((fileColumn) => (
            <div key={fileColumn} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <Label className="font-medium">{fileColumn}</Label>
              </div>
              <Select
                value={columnMapping[fileColumn] || 'skip'}
                onValueChange={(value) => handleColumnMappingChange(fileColumn, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mapping" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="skip">Skip Column</SelectItem>
                  {Object.entries({ ...REQUIRED_MAPPINGS, ...OPTIONAL_MAPPINGS }).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label} {REQUIRED_MAPPINGS[key as keyof typeof REQUIRED_MAPPINGS] ? '*' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-sm font-medium">Mapping Status:</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(REQUIRED_MAPPINGS).map(([key, label]) => {
              const isMapped = Object.values(columnMapping).includes(key);
              return (
                <Badge key={key} variant={isMapped ? "default" : "destructive"}>
                  {label} {isMapped ? <CheckCircle className="h-3 w-3 ml-1" /> : <X className="h-3 w-3 ml-1" />}
                </Badge>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleProcessUpload}
            disabled={!mappingComplete}
            className="flex-1"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Process Upload {mappingComplete ? '' : '(Mapping Required)'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderProcessing = () => (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Processing Upload
        </CardTitle>
        <CardDescription>
          Creating student applications from your file...
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{currentStep}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardContent>
    </Card>
  );

  const renderResults = () => {
    if (!uploadResult) return null;

    return (
      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              Upload Summary
            </CardTitle>
            <CardDescription>
              {selectedFile?.name} - Processed {new Date().toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold">{uploadResult.totalRecords}</div>
                <div className="text-sm text-muted-foreground">Total Records</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{uploadResult.successfulRecords}</div>
                <div className="text-sm text-muted-foreground">Created</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <UserX className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">{uploadResult.failedRecords}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">{uploadResult.duplicates.length}</div>
                <div className="text-sm text-muted-foreground">Duplicates</div>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-destructive">Errors Found</h4>
                  <Button variant="outline" size="sm" onClick={exportErrorReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Errors
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto border rounded-lg">
                  {uploadResult.errors.slice(0, 10).map((error, index) => (
                    <div key={index} className="p-3 border-b last:border-b-0">
                      <div className="text-sm">
                        <span className="font-medium">Row {error.row}:</span> {error.message}
                      </div>
                      {error.field !== 'general' && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Field: {error.field}, Value: {error.value}
                        </div>
                      )}
                    </div>
                  ))}
                  {uploadResult.errors.length > 10 && (
                    <div className="p-3 text-sm text-muted-foreground text-center">
                      ... and {uploadResult.errors.length - 10} more errors
                    </div>
                  )}
                </div>
              </div>
            )}

            {uploadResult.duplicates.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-yellow-600">Duplicate Emails Skipped</h4>
                <div className="max-h-32 overflow-y-auto border rounded-lg">
                  {uploadResult.duplicates.slice(0, 5).map((duplicate, index) => (
                    <div key={index} className="p-2 border-b last:border-b-0 text-sm">
                      {duplicate.firstName} {duplicate.lastName} - {duplicate.email}
                    </div>
                  ))}
                  {uploadResult.duplicates.length > 5 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      ... and {uploadResult.duplicates.length - 5} more duplicates
                    </div>
                  )}
                </div>
              </div>
            )}

            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                A detailed summary has been sent to your email address with the complete upload report.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button onClick={handleStartOver} className="flex-1">
                Upload Another File
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {step === 'upload' && renderFileUpload()}
      {step === 'mapping' && renderColumnMapping()}
      {step === 'processing' && renderProcessing()}
      {step === 'results' && renderResults()}
    </div>
  );
};

export default BulkUpload;