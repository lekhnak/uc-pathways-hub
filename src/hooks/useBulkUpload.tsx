import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface StudentRecord {
  // Required Fields
  timestamp?: string; // 1. Timestamp
  email: string; // 2. Email Address
  fullName: string; // 3. Full Name
  
  // Academic Info
  campus?: string; // 4. Campus Currently Enrolled
  gpa?: number; // 5. Overall GPA
  classStanding?: string; // 6. Class Standing in Fall 2025
  fieldOfStudy?: string; // 21. Field of Study
  
  // Demographics
  firstGenerationStudent?: boolean; // 7. Are you a first generation college student?
  pellGrantEligible?: boolean; // 8. Are you Pell Grant Eligible?
  
  // Program Questions
  programInterest?: string; // 9. Briefly explain why you are interested in this program.
  employmentStatus?: string; // 10. Are you currently employed or are in an internship? If yes, where are you employed/interning?
  informFutureJobs?: string; // 11. Will you be able to inform UC Investments if you are able to get a related job/internship in the field after completing the program?
  investmentClubMember?: string; // 12. Are you currently a member of your campus investment / finance club?
  completeAssignments?: string; // 13. Will you be able to complete the all assigned materials including Training The Street, Forage, and Guest Speaker events?
  exitSurveyAgreement?: string; // 14. Do you agree to complete an exit survey at the completion of the program?
  
  // File Uploads
  transcriptFile?: string; // 15. Upload Unofficial Transcript
  consentFormFile?: string; // 16. Upload Consent Form (Template Form Link)
  
  // Contact/Links
  linkedinUrl?: string; // 17. Please enter your Linkedin profile link (Join UC Investments Academy LinkedIn Group here)
  
  // Optional Demographics
  optionalQuestion1?: string; // 18. Optional Question 1: Which of the following best describes you?
  optionalQuestion2?: string; // 19. Optional Question 2: I identify as?
  optionalQuestion3?: string; // 20. Optional Question 3: Do you consider yourself to be:
  
  [key: string]: any;
}

export interface ValidationError {
  row: number;
  field: string;
  value: any;
  message: string;
  severity: 'error' | 'warning' | 'info'; // Add severity levels
}

export interface DataCorrection {
  row: number;
  field: string;
  originalValue: any;
  correctedValue: any;
  reason: string;
}

export interface UploadResult {
  success: boolean;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors: ValidationError[];
  warnings: ValidationError[]; // Add warnings array
  corrections: DataCorrection[]; // Add corrections array
  duplicates: StudentRecord[];
  uploadId?: string;
}

export interface ColumnMapping {
  [fileColumn: string]: string;
}

const REQUIRED_FIELDS = ['fullName', 'email'];
const VALID_FIELD_MAPPINGS = {
  // 1. Timestamp
  'timestamp': 'timestamp',
  'date': 'timestamp',
  'submitted': 'timestamp',
  
  // 2. Email Address
  'email address': 'email',
  'email_address': 'email',
  'email': 'email',
  
  // 3. Full Name
  'full name': 'fullName',
  'full_name': 'fullName',
  'first and last name': 'fullName',
  'first_and_last_name': 'fullName',
  'name': 'fullName',
  'student_name': 'fullName',
  'student name': 'fullName',
  
  // 4. Campus Currently Enrolled
  'campus currently enrolled': 'campus',
  'campus_currently_enrolled': 'campus',
  'uc_campus': 'campus',
  'campus': 'campus',
  'school': 'campus',
  
  // 5. Overall GPA
  'overall gpa': 'gpa',
  'overall_gpa': 'gpa',
  'gpa': 'gpa',
  
  // 6. Class Standing in Fall 2025
  'class standing in fall 2025': 'classStanding',
  'class_standing_in_fall_2025': 'classStanding',
  'class_standing': 'classStanding',
  'class standing': 'classStanding',
  'standing': 'classStanding',
  
  // 7. Are you a first generation college student?
  'are you a first generation college student?': 'firstGenerationStudent',
  'are_you_a_first_generation_college_student?': 'firstGenerationStudent',
  'first generation college student': 'firstGenerationStudent',
  'first_generation_college_student': 'firstGenerationStudent',
  'first_generation': 'firstGenerationStudent',
  
  // 8. Are you Pell Grant Eligible?
  'are you pell grant eligible?': 'pellGrantEligible',
  'are_you_pell_grant_eligible?': 'pellGrantEligible',
  'pell grant eligible': 'pellGrantEligible',
  'pell_grant_eligible': 'pellGrantEligible',
  'pell_grant': 'pellGrantEligible',
  
  // 9. Briefly explain why you are interested in this program.
  'briefly explain why you are interested in this program.': 'programInterest',
  'briefly_explain_why_you_are_interested_in_this_program.': 'programInterest',
  'briefly explain why you are interested in this program': 'programInterest',
  'why_interested': 'programInterest',
  'program_interest': 'programInterest',
  'interest_reason': 'programInterest',
  
  // 10. Are you currently employed or are in an internship? If yes, where are you employed/interning?
  'are you currently employed or are in an internship? if yes, where are you employed/interning?': 'employmentStatus',
  'are_you_currently_employed_or_are_in_an_internship?_if_yes,_where_are_you_employed/interning?': 'employmentStatus',
  'current employment/internship status': 'employmentStatus',
  'current_employment/internship_status': 'employmentStatus',
  'employment_status': 'employmentStatus',
  'current_employment': 'employmentStatus',
  
  // 11. Will you be able to inform UC Investments if you are able to get a related job/internship in the field after completing the program?
  'will you be able to inform uc investments if you are able to get a related job/internship in the field after completing the program?': 'informFutureJobs',
  'will_you_be_able_to_inform_uc_investments_if_you_are_able_to_get_a_related_job/internship_in_the_field_after_completing_the_program?': 'informFutureJobs',
  'will you be able to inform uc investments about future jobs/internships?': 'informFutureJobs',
  'will_you_be_able_to_inform_uc_investments_about_future_jobs/internships?': 'informFutureJobs',
  'inform_future_jobs': 'informFutureJobs',
  'future_jobs': 'informFutureJobs',
  
  // 12. Are you currently a member of your campus investment / finance club?
  'are you currently a member of your campus investment / finance club?': 'investmentClubMember',
  'are_you_currently_a_member_of_your_campus_investment_/_finance_club?': 'investmentClubMember',
  'are you currently a member of your campus investment/finance club?': 'investmentClubMember',
  'are_you_currently_a_member_of_your_campus_investment/finance_club?': 'investmentClubMember',
  'investment_club_member': 'investmentClubMember',
  'finance_club': 'investmentClubMember',
  
  // 13. Will you be able to complete the all assigned materials including Training The Street, Forage, and Guest Speaker events?
  'will you be able to complete the all assigned materials including training the street, forage, and guest speaker events?': 'completeAssignments',
  'will_you_be_able_to_complete_the_all_assigned_materials_including_training_the_street,_forage,_and_guest_speaker_events?': 'completeAssignments',
  'will you be able to complete all assigned materials?': 'completeAssignments',
  'will_you_be_able_to_complete_all_assigned_materials?': 'completeAssignments',
  'complete_assignments': 'completeAssignments',
  'assigned_materials': 'completeAssignments',
  
  // 14. Do you agree to complete an exit survey at the completion of the program?
  'do you agree to complete an exit survey at the completion of the program?': 'exitSurveyAgreement',
  'do_you_agree_to_complete_an_exit_survey_at_the_completion_of_the_program?': 'exitSurveyAgreement',
  'do you agree to complete an exit survey?': 'exitSurveyAgreement',
  'do_you_agree_to_complete_an_exit_survey?': 'exitSurveyAgreement',
  'exit_survey': 'exitSurveyAgreement',
  'exit survey': 'exitSurveyAgreement',
  
  // 15. Upload Unofficial Transcript
  'upload unofficial transcript': 'transcriptFile',
  'upload_unofficial_transcript': 'transcriptFile',
  'unofficial_transcript': 'transcriptFile',
  'transcript': 'transcriptFile',
  
  // 16. Upload Consent Form (Template Form Link)
  'upload consent form (template form link)': 'consentFormFile',
  'upload_consent_form_(template_form_link)': 'consentFormFile',
  'upload consent form': 'consentFormFile',
  'upload_consent_form': 'consentFormFile',
  'consent_form': 'consentFormFile',
  'consent': 'consentFormFile',
  
  // 17. Please enter your Linkedin profile link (Join UC Investments Academy LinkedIn Group here)
  'please enter your linkedin profile link (join uc investments academy linkedin group here)': 'linkedinUrl',
  'please_enter_your_linkedin_profile_link_(join_uc_investments_academy_linkedin_group_here)': 'linkedinUrl',
  'please enter your linkedin profile link': 'linkedinUrl',
  'please_enter_your_linkedin_profile_link': 'linkedinUrl',
  'linkedin_profile_link': 'linkedinUrl',
  'linkedin': 'linkedinUrl',
  'linkedin_url': 'linkedinUrl',
  
  // 18. Optional Question 1: Which of the following best describes you?
  'optional question 1: which of the following best describes you? (for data collection purposes only. this question does not impact your application)': 'optionalQuestion1',
  'optional_question_1:_which_of_the_following_best_describes_you?_(for_data_collection_purposes_only._this_question_does_not_impact_your_application)': 'optionalQuestion1',
  'optional question 1': 'optionalQuestion1',
  'optional_question_1': 'optionalQuestion1',
  'which of the following best describes you?': 'optionalQuestion1',
  'which_of_the_following_best_describes_you?': 'optionalQuestion1',
  
  // 19. Optional Question 2: I identify as?
  'optional question 2: i identify as? (for data collection purposes only. this question does not impact your application)': 'optionalQuestion2',
  'optional_question_2:_i_identify_as?_(for_data_collection_purposes_only._this_question_does_not_impact_your_application)': 'optionalQuestion2',
  'optional question 2': 'optionalQuestion2',
  'optional_question_2': 'optionalQuestion2',
  'i identify as?': 'optionalQuestion2',
  'i_identify_as?': 'optionalQuestion2',
  'gender_identity': 'optionalQuestion2',
  'gender': 'optionalQuestion2',
  
  // 20. Optional Question 3: Do you consider yourself to be:
  'optional question 3: do you consider yourself to be: (for data collection purposes only. this question does not impact your application)': 'optionalQuestion3',
  'optional_question_3:_do_you_consider_yourself_to_be:_(for_data_collection_purposes_only._this_question_does_not_impact_your_application)': 'optionalQuestion3',
  'optional question 3': 'optionalQuestion3',
  'optional_question_3': 'optionalQuestion3',
  'do you consider yourself to be:': 'optionalQuestion3',
  'do_you_consider_yourself_to_be:': 'optionalQuestion3',
  'racial_identity': 'optionalQuestion3',
  'race': 'optionalQuestion3',
  'ethnicity': 'optionalQuestion3',
  
  // 21. Field of Study
  'field of study': 'fieldOfStudy',
  'field_of_study': 'fieldOfStudy',
  'major': 'fieldOfStudy',
  'study': 'fieldOfStudy'
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
    processedRecords: StudentRecord[], 
    errors: ValidationError[],
    warnings: ValidationError[],
    corrections: DataCorrection[]
  } => {
    const processedRecords: StudentRecord[] = [];
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const corrections: DataCorrection[] = [];

    records.forEach((record, index) => {
      const mappedRecord: StudentRecord = {
        fullName: '',
        email: ''
      };

      // Apply column mapping with corrections and warnings
      Object.entries(columnMapping).forEach(([fileColumn, mappedField]) => {
        if (record[fileColumn] !== undefined && record[fileColumn] !== null && record[fileColumn] !== '') {
          let value = record[fileColumn];
          const originalValue = value;
          
          // Handle Full Name field
          if (mappedField === 'fullName') {
            mappedRecord.fullName = String(value).trim() || 'Unknown';
            if (!String(value).trim()) {
              corrections.push({
                row: index + 2,
                field: 'fullName',
                originalValue: originalValue,
                correctedValue: 'Unknown',
                reason: 'Empty name replaced with default'
              });
            }
            return;
          }
          
          // Handle boolean fields for Yes/No questions
          if (['firstGenerationStudent', 'pellGrantEligible'].includes(mappedField)) {
            if (typeof value === 'string') {
              const lowerValue = value.toLowerCase().trim();
              if (['yes', 'true', '1', 'y'].includes(lowerValue)) {
                value = true;
              } else if (['no', 'false', '0', 'n'].includes(lowerValue)) {
                value = false;
              } else {
                value = null; // Unknown response
                corrections.push({
                  row: index + 2,
                  field: mappedField,
                  originalValue: originalValue,
                  correctedValue: null,
                  reason: 'Unrecognized yes/no response set to null'
                });
              }
            } else {
              value = Boolean(value);
            }
          }
          
          // Handle string fields for Yes/No answers that should remain as strings
          if (['informFutureJobs', 'investmentClubMember', 'completeAssignments', 'exitSurveyAgreement'].includes(mappedField)) {
            value = String(value).trim() || 'N/A';
            if (!String(originalValue).trim()) {
              corrections.push({
                row: index + 2,
                field: mappedField,
                originalValue: originalValue,
                correctedValue: 'N/A',
                reason: 'Empty response replaced with N/A'
              });
            }
          }
          
          // Handle numeric fields (GPA)
          if (['gpa'].includes(mappedField)) {
            const numValue = parseFloat(String(value));
            if (!isNaN(numValue)) {
              if (numValue < 0 || numValue > 4.0) {
                warnings.push({
                  row: index + 2,
                  field: 'gpa',
                  value: numValue,
                  message: `GPA ${numValue} is outside normal range (0.0-4.0) but kept as-is`,
                  severity: 'warning'
                });
              }
              value = numValue;
            } else {
              // Invalid number, keep as string for manual review
              value = String(originalValue).trim() || null;
              if (String(originalValue).trim()) {
                warnings.push({
                  row: index + 2,
                  field: 'gpa',
                  value: originalValue,
                  message: `Non-numeric GPA value "${originalValue}" stored for review`,
                  severity: 'warning'
                });
              }
            }
          }
          
          // Handle LinkedIn URL with automatic correction
          if (mappedField === 'linkedinUrl') {
            value = String(value).trim();
            const lowerValue = value.toLowerCase();
            
            // Check for placeholder values
            if (!value || ['n/a', 'not provided', 'none', 'no', 'null', 'na', 'don\'t use linkedin', 'dont use linkedin'].includes(lowerValue)) {
              value = null;
              if (originalValue && String(originalValue).trim()) {
                corrections.push({
                  row: index + 2,
                  field: 'linkedinUrl',
                  originalValue: originalValue,
                  correctedValue: null,
                  reason: 'Placeholder LinkedIn value set to null'
                });
              }
            } else if (!value.includes('linkedin.com')) {
              // Invalid LinkedIn URL, but keep as-is for review
              warnings.push({
                row: index + 2,
                field: 'linkedinUrl',
                value: originalValue,
                message: `LinkedIn URL "${originalValue}" doesn't appear to be valid but stored for review`,
                severity: 'warning'
              });
            }
          }
          
          // Handle string fields - trim whitespace
          if (typeof value === 'string') {
            value = value.trim();
          }
          
          mappedRecord[mappedField] = value;
        }
      });

      // Handle required fields with soft validation
      REQUIRED_FIELDS.forEach(field => {
        const value = mappedRecord[field];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          if (field === 'fullName') {
            mappedRecord.fullName = 'Unknown';
            corrections.push({
              row: index + 2,
              field: 'fullName',
              originalValue: value,
              correctedValue: 'Unknown',
              reason: 'Missing name replaced with default'
            });
          } else if (field === 'email') {
            // This is a hard error - we need an email to create the record
            errors.push({
              row: index + 2,
              field: 'email',
              value: value,
              message: 'Email is required and cannot be auto-corrected',
              severity: 'error'
            });
          }
        }
      });

      // Validate email format with correction attempt
      if (mappedRecord.email && !validateEmail(mappedRecord.email)) {
        // Try to fix common email issues
        let fixedEmail = String(mappedRecord.email).trim().toLowerCase();
        
        // Try basic fixes
        if (fixedEmail && !fixedEmail.includes('@')) {
          // No @ symbol - this is a hard error
          errors.push({
            row: index + 2,
            field: 'email',
            value: mappedRecord.email,
            message: 'Invalid email format - missing @ symbol',
            severity: 'error'
          });
        } else if (fixedEmail && !fixedEmail.includes('.')) {
          // No domain extension - warning but keep
          warnings.push({
            row: index + 2,
            field: 'email',
            value: mappedRecord.email,
            message: `Email "${mappedRecord.email}" may be missing domain extension but kept as-is`,
            severity: 'warning'
          });
        } else if (fixedEmail !== mappedRecord.email) {
          // Applied basic fixes
          mappedRecord.email = fixedEmail;
          corrections.push({
            row: index + 2,
            field: 'email',
            originalValue: mappedRecord.email,
            correctedValue: fixedEmail,
            reason: 'Email normalized (trimmed and lowercased)'
          });
        } else {
          // Keep invalid email but flag for review
          warnings.push({
            row: index + 2,
            field: 'email',
            value: mappedRecord.email,
            message: `Email format "${mappedRecord.email}" appears invalid but stored for review`,
            severity: 'warning'
          });
        }
      }

      // Only exclude records with hard errors (missing email or severely malformed email)
      const recordErrors = errors.filter(e => e.row === index + 2 && e.severity === 'error');
      if (recordErrors.length === 0) {
        processedRecords.push(mappedRecord);
      }
    });

    return { processedRecords, errors, warnings, corrections };
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
        // Split full name into first and last for database storage
        const nameParts = record.fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Normalize student type to common values - ALWAYS default to 'Other' for any unrecognized value
        let studentType = 'Other'; // Default to 'Other'
        const originalStudentType = record.classStanding;
        
        if (originalStudentType && typeof originalStudentType === 'string') {
          const normalized = String(originalStudentType).toLowerCase().trim();
          const typeMap: { [key: string]: string } = {
            'freshman': 'Freshman',
            'freshmen': 'Freshman',
            'first year': 'Freshman',
            'first-year': 'Freshman', 
            '1st year': 'Freshman',
            '1': 'Freshman',
            'sophomore': 'Sophomore',
            'second year': 'Sophomore',
            'second-year': 'Sophomore',
            '2nd year': 'Sophomore',
            '2': 'Sophomore',
            'junior': 'Junior',
            'third year': 'Junior',
            'third-year': 'Junior',
            '3rd year': 'Junior',
            '3': 'Junior',
            'senior': 'Senior',
            'fourth year': 'Senior',
            'fourth-year': 'Senior',
            '4th year': 'Senior',
            '5th year': 'Senior',
            '4': 'Senior',
            '5': 'Senior',
            'graduate': 'Graduate',
            'grad': 'Graduate',
            'graduate student': 'Graduate',
            'masters': 'Graduate',
            'master\'s': 'Graduate',
            'phd': 'Graduate',
            'doctoral': 'Graduate',
            'doctorate': 'Graduate',
            'undergrad': 'Undergraduate',
            'undergraduate': 'Undergraduate',
            'undergrad student': 'Undergraduate',
            'transfer': 'Transfer',
            'transfer student': 'Transfer',
            'continuing': 'Continuing',
            'continuing student': 'Continuing',
            'post-grad': 'Graduate',
            'postgrad': 'Graduate'
          };
          
          if (typeMap[normalized]) {
            studentType = typeMap[normalized];
          } else {
            // Any unrecognized value goes to 'Other' - never fail
            studentType = 'Other';
          }
        }
        
        
        const { error } = await supabase
          .from('applications')
          .insert({
            // Basic Info (Required)
            first_name: firstName,
            last_name: lastName,
            email: record.email.toLowerCase(),
            
            // Academic Info
            uc_campus: record.campus || null,
            gpa: record.gpa || null,
            student_type: studentType,
            major: record.fieldOfStudy || null,
            
            // Demographics
            first_generation_student: record.firstGenerationStudent || null,
            pell_grant_eligible: record.pellGrantEligible || null,
            gender_identity: record.optionalQuestion2 || null, // Maps to "I identify as?"
            racial_identity: record.optionalQuestion3 || null, // Maps to "Do you consider yourself to be:"
            sexual_orientation: record.optionalQuestion1 || null, // Maps to "Which of the following best describes you?"
            
            // Employment Status
            current_employer: record.employmentStatus || null,
            
            // Program Questions
            question_1: record.programInterest || null, // Briefly explain why interested
            question_2: record.informFutureJobs || null, // Inform UC Investments about future jobs
            question_3: record.investmentClubMember || null, // Member of investment/finance club
            question_4: record.completeAssignments || null, // Complete assigned materials
            
            // File Uploads
            transcript_file_path: record.transcriptFile || null,
            consent_form_file_path: record.consentFormFile || null,
            
            // Contact/Links
            linkedin_url: record.linkedinUrl || null,
            
            // System fields
            status: 'pending',
            created_by_admin: true,
            submitted_at: record.timestamp ? new Date(record.timestamp).toISOString() : new Date().toISOString()
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
          message: `Failed to create application: ${error.message}`,
          severity: 'error'
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
          errors: result.errors.concat(result.warnings) as any, // Include both errors and warnings
          upload_status: result.success ? 'completed' : 'completed_with_warnings',
          summary_report: {
            duplicates: result.duplicates.length,
            corrections: result.corrections.length,
            warnings: result.warnings.length,
            processing_time: Date.now()
          } as any,
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
      
      // Process and validate records (now with soft validation)
      const { processedRecords, errors, warnings, corrections } = validateRecords(rawRecords, columnMapping);
      
      setCurrentStep('Checking for duplicates...');
      setProgress(50);
      
      // Check for duplicates
      const { uniqueRecords, duplicates } = await checkForDuplicates(processedRecords);
      
      setCurrentStep('Creating applications...');
      setProgress(75);
      
      // Create applications
      const { successful, failed, errors: creationErrors } = await createApplications(uniqueRecords);
      
      const allErrors = [...errors, ...creationErrors];
      const result: UploadResult = {
        success: successful > 0, // Success if ANY records were created
        totalRecords: rawRecords.length,
        successfulRecords: successful,
        failedRecords: failed + errors.length,
        errors: allErrors.filter(e => e.severity === 'error'),
        warnings: [...warnings, ...allErrors.filter(e => e.severity === 'warning')],
        corrections,
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
          message: error.message || 'Upload failed',
          severity: 'error'
        }],
        warnings: [],
        corrections: [],
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