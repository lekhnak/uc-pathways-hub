import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface StudentRecord {
  firstName: string;
  lastName: string;
  email: string;
  campus?: string;
  [key: string]: any;
}

export interface ValidationError {
  row: number;
  field: string;
  value: any;
  message: string;
}

export interface UploadResult {
  success: boolean;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: ValidationError[];
  duplicates: StudentRecord[];
  uploadId?: string;
}

export interface ColumnMapping {
  [fileColumn: string]: string;
}

const REQUIRED_FIELDS = ['firstName', 'lastName', 'email'];
const VALID_FIELD_MAPPINGS = {
  'first_name': 'firstName',
  'firstname': 'firstName',
  'fname': 'firstName',
  'last_name': 'lastName',
  'lastname': 'lastName',
  'lname': 'lastName',
  'email_address': 'email',
  'email': 'email',
  'uc_campus': 'campus',
  'campus': 'campus',
  'school': 'campus'
};

export const useBulkUpload = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const { adminUser } = useAdminAuth();
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const parseFile = useCallback(async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            resolve(results.data);
          },
          error: (error) => reject(error)
        });
      } else if (extension === 'xlsx' || extension === 'xls') {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            resolve(jsonData);
          } catch (error) {
            reject(error);
          }
        };
        reader.readAsBinaryString(file);
      } else {
        reject(new Error('Unsupported file format. Please use CSV, XLS, or XLSX files.'));
      }
    });
  }, []);

  const suggestColumnMapping = useCallback((fileColumns: string[]): ColumnMapping => {
    const mapping: ColumnMapping = {};
    
    fileColumns.forEach(column => {
      const normalizedColumn = column.toLowerCase().replace(/\s+/g, '_');
      const mappedField = VALID_FIELD_MAPPINGS[normalizedColumn as keyof typeof VALID_FIELD_MAPPINGS];
      if (mappedField) {
        mapping[column] = mappedField;
      }
    });
    
    return mapping;
  }, []);

  const validateRecords = useCallback((records: any[], columnMapping: ColumnMapping): { 
    validRecords: StudentRecord[], 
    errors: ValidationError[] 
  } => {
    const validRecords: StudentRecord[] = [];
    const errors: ValidationError[] = [];

    records.forEach((record, index) => {
      const mappedRecord: StudentRecord = {
        firstName: '',
        lastName: '',
        email: '',
        campus: ''
      };

      // Apply column mapping
      Object.entries(columnMapping).forEach(([fileColumn, mappedField]) => {
        if (record[fileColumn] !== undefined) {
          mappedRecord[mappedField] = record[fileColumn];
        }
      });

      // Validate required fields
      REQUIRED_FIELDS.forEach(field => {
        const value = mappedRecord[field];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors.push({
            row: index + 2, // +2 because of header row and 0-based index
            field,
            value,
            message: `${field} is required`
          });
        }
      });

      // Validate email format
      if (mappedRecord.email && !validateEmail(mappedRecord.email)) {
        errors.push({
          row: index + 2,
          field: 'email',
          value: mappedRecord.email,
          message: 'Invalid email format'
        });
      }

      // If no errors for this record, add to valid records
      const recordErrors = errors.filter(e => e.row === index + 2);
      if (recordErrors.length === 0) {
        validRecords.push(mappedRecord);
      }
    });

    return { validRecords, errors };
  }, []);

  const checkForDuplicates = useCallback(async (records: StudentRecord[]): Promise<{
    uniqueRecords: StudentRecord[],
    duplicates: StudentRecord[]
  }> => {
    const emails = records.map(r => r.email.toLowerCase());
    
    // Check against existing applications
    const { data: existingApplications } = await supabase
      .from('applications')
      .select('email')
      .in('email', emails);

    const existingEmails = new Set(existingApplications?.map(app => app.email.toLowerCase()) || []);
    
    const uniqueRecords: StudentRecord[] = [];
    const duplicates: StudentRecord[] = [];
    const seenEmails = new Set<string>();

    records.forEach(record => {
      const email = record.email.toLowerCase();
      
      if (existingEmails.has(email) || seenEmails.has(email)) {
        duplicates.push(record);
      } else {
        uniqueRecords.push(record);
        seenEmails.add(email);
      }
    });

    return { uniqueRecords, duplicates };
  }, []);

  const createApplications = useCallback(async (records: StudentRecord[]): Promise<{
    successful: number,
    failed: number,
    errors: ValidationError[]
  }> => {
    let successful = 0;
    let failed = 0;
    const errors: ValidationError[] = [];

    for (let i = 0; i < records.length; i++) {
      const record = records[i];
      setProgress(((i + 1) / records.length) * 100);
      setCurrentStep(`Creating application ${i + 1} of ${records.length}`);

      try {
        const { error } = await supabase
          .from('applications')
          .insert({
            first_name: record.firstName,
            last_name: record.lastName,
            email: record.email.toLowerCase(),
            uc_campus: record.campus || null,
            status: 'pending',
            created_by_admin: true
          });

        if (error) {
          throw error;
        }
        successful++;
      } catch (error: any) {
        failed++;
        errors.push({
          row: i + 1,
          field: 'general',
          value: record.email,
          message: `Failed to create application: ${error.message}`
        });
      }
    }

    return { successful, failed, errors };
  }, []);

  const logUpload = useCallback(async (
    fileName: string,
    fileSize: number,
    fileType: string,
    result: Omit<UploadResult, 'uploadId'>
  ): Promise<string | null> => {
    if (!adminUser?.id) return null;

    try {
      const { data, error } = await supabase
        .from('bulk_upload_logs')
        .insert({
          admin_user_id: adminUser.id,
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType,
          total_records: result.totalRecords,
          successful_records: result.successfulRecords,
          failed_records: result.failedRecords,
          errors: result.errors as any, // Convert to Json type
          upload_status: result.success ? 'completed' : 'failed',
          summary_report: {
            duplicates: result.duplicates.length,
            processing_time: Date.now()
          } as any, // Convert to Json type
          created_by: adminUser.full_name || adminUser.username
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Failed to log upload:', error);
      return null;
    }
  }, [adminUser]);

  const processUpload = useCallback(async (
    file: File,
    columnMapping: ColumnMapping
  ): Promise<UploadResult> => {
    if (!adminUser) {
      throw new Error('Admin authentication required');
    }

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('Parsing file...');

    try {
      // Parse file
      const rawRecords = await parseFile(file);
      
      if (!rawRecords.length) {
        throw new Error('No data found in file');
      }

      setCurrentStep('Validating records...');
      setProgress(25);
      
      // Validate records
      const { validRecords, errors } = validateRecords(rawRecords, columnMapping);
      
      setCurrentStep('Checking for duplicates...');
      setProgress(50);
      
      // Check for duplicates
      const { uniqueRecords, duplicates } = await checkForDuplicates(validRecords);
      
      setCurrentStep('Creating applications...');
      setProgress(75);
      
      // Create applications
      const { successful, failed, errors: creationErrors } = await createApplications(uniqueRecords);
      
      const allErrors = [...errors, ...creationErrors];
      const result: UploadResult = {
        success: successful > 0 && failed === 0 && errors.length === 0,
        totalRecords: rawRecords.length,
        successfulRecords: successful,
        failedRecords: failed + errors.length,
        errors: allErrors,
        duplicates
      };

      // Log upload
      const uploadId = await logUpload(file.name, file.size, file.type, result);
      result.uploadId = uploadId || undefined;

      setProgress(100);
      setCurrentStep('Upload complete');

      return result;
    } catch (error: any) {
      const result: UploadResult = {
        success: false,
        totalRecords: 0,
        successfulRecords: 0,
        failedRecords: 0,
        errors: [{
          row: 0,
          field: 'general',
          value: '',
          message: error.message || 'Upload failed'
        }],
        duplicates: []
      };
      
      await logUpload(file.name, file.size, file.type, result);
      return result;
    } finally {
      setIsProcessing(false);
    }
  }, [adminUser, parseFile, validateRecords, checkForDuplicates, createApplications, logUpload]);

  const sendConfirmationEmail = useCallback(async (uploadResult: UploadResult, fileName: string) => {
    if (!adminUser || !uploadResult.uploadId) return;

    try {
      await supabase.functions.invoke('send-bulk-upload-confirmation', {
        body: {
          adminEmail: adminUser.email,
          adminName: adminUser.full_name || adminUser.username,
          fileName,
          uploadResult
        }
      });

      toast({
        title: "Confirmation Email Sent",
        description: "Upload summary has been sent to your email.",
      });
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      toast({
        title: "Email Failed",
        description: "Failed to send confirmation email, but upload was successful.",
        variant: "destructive"
      });
    }
  }, [adminUser, toast]);

  return {
    isProcessing,
    progress,
    currentStep,
    parseFile,
    suggestColumnMapping,
    validateRecords,
    processUpload,
    sendConfirmationEmail
  };
};