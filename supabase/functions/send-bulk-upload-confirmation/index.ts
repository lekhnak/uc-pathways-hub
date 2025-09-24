import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { Resend } from "https://esm.sh/resend@2.0.0"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BulkUploadRequest {
  adminEmail: string
  adminName: string
  fileName: string
  uploadResult: {
    success: boolean
    totalRecords: number
    successfulRecords: number
    failedRecords: number
    errors: Array<{
      row: number
      field: string
      value: any
      message: string
    }>
    duplicates: Array<{
      firstName: string
      lastName: string
      email: string
      campus?: string
    }>
    uploadId?: string
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { adminEmail, adminName, fileName, uploadResult }: BulkUploadRequest = await req.json()

    console.log('Sending bulk upload confirmation to:', adminEmail)

    const formatErrorsTable = (errors: BulkUploadRequest['uploadResult']['errors']) => {
      if (!errors.length) return '<p>No errors occurred during the upload.</p>'
      
      return `
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left;">Row</th>
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left;">Field</th>
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left;">Value</th>
              <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left;">Error</th>
            </tr>
          </thead>
          <tbody>
            ${errors.slice(0, 10).map(error => `
              <tr>
                <td style="border: 1px solid #dee2e6; padding: 8px;">${error.row}</td>
                <td style="border: 1px solid #dee2e6; padding: 8px;">${error.field}</td>
                <td style="border: 1px solid #dee2e6; padding: 8px;">${error.value || 'N/A'}</td>
                <td style="border: 1px solid #dee2e6; padding: 8px;">${error.message}</td>
              </tr>
            `).join('')}
            ${errors.length > 10 ? `
              <tr>
                <td colspan="4" style="border: 1px solid #dee2e6; padding: 8px; text-align: center; font-style: italic;">
                  ... and ${errors.length - 10} more errors
                </td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      `
    }

    const formatDuplicatesTable = (duplicates: BulkUploadRequest['uploadResult']['duplicates']) => {
      if (!duplicates.length) return '<p>No duplicate emails were found.</p>'
      
      return `
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background-color: #fff3cd;">
              <th style="border: 1px solid #ffeaa7; padding: 8px; text-align: left;">First Name</th>
              <th style="border: 1px solid #ffeaa7; padding: 8px; text-align: left;">Last Name</th>
              <th style="border: 1px solid #ffeaa7; padding: 8px; text-align: left;">Email</th>
              <th style="border: 1px solid #ffeaa7; padding: 8px; text-align: left;">Campus</th>
            </tr>
          </thead>
          <tbody>
            ${duplicates.slice(0, 10).map(duplicate => `
              <tr>
                <td style="border: 1px solid #ffeaa7; padding: 8px;">${duplicate.firstName}</td>
                <td style="border: 1px solid #ffeaa7; padding: 8px;">${duplicate.lastName}</td>
                <td style="border: 1px solid #ffeaa7; padding: 8px;">${duplicate.email}</td>
                <td style="border: 1px solid #ffeaa7; padding: 8px;">${duplicate.campus || 'N/A'}</td>
              </tr>
            `).join('')}
            ${duplicates.length > 10 ? `
              <tr>
                <td colspan="4" style="border: 1px solid #ffeaa7; padding: 8px; text-align: center; font-style: italic;">
                  ... and ${duplicates.length - 10} more duplicates
                </td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      `
    }

    const statusColor = uploadResult.success ? '#28a745' : '#ffc107'
    const statusIcon = uploadResult.success ? '✅' : '⚠️'
    const statusText = uploadResult.success ? 'Completed Successfully' : 'Completed with Issues'

    const emailResponse = await resend.emails.send({
      from: "UC Investments Academy <noreply@resend.dev>",
      to: [adminEmail],
      subject: `Bulk Upload Summary - ${fileName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bulk Upload Summary</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">UC Investments Academy</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Bulk Upload Summary Report</p>
          </div>

          <div style="background: #f8f9fa; border-left: 4px solid ${statusColor}; padding: 20px; margin-bottom: 30px; border-radius: 0 8px 8px 0;">
            <h2 style="margin: 0 0 10px 0; color: ${statusColor};">${statusIcon} Upload ${statusText}</h2>
            <p style="margin: 0; color: #666;">
              <strong>File:</strong> ${fileName}<br>
              <strong>Processed by:</strong> ${adminName}<br>
              <strong>Date:</strong> ${new Date().toLocaleString()}<br>
              ${uploadResult.uploadId ? `<strong>Upload ID:</strong> ${uploadResult.uploadId}` : ''}
            </p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px; margin-bottom: 30px;">
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #1976d2; margin-bottom: 5px;">${uploadResult.totalRecords}</div>
              <div style="color: #666; font-size: 14px;">Total Records</div>
            </div>
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #388e3c; margin-bottom: 5px;">${uploadResult.successfulRecords}</div>
              <div style="color: #666; font-size: 14px;">Successfully Created</div>
            </div>
            <div style="background: #ffebee; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #d32f2f; margin-bottom: 5px;">${uploadResult.failedRecords}</div>
              <div style="color: #666; font-size: 14px;">Failed</div>
            </div>
            <div style="background: #fff3e0; padding: 20px; border-radius: 8px; text-align: center;">
              <div style="font-size: 32px; font-weight: bold; color: #f57c00; margin-bottom: 5px;">${uploadResult.duplicates.length}</div>
              <div style="color: #666; font-size: 14px;">Duplicates Skipped</div>
            </div>
          </div>

          ${uploadResult.errors.length > 0 ? `
            <div style="margin-bottom: 30px;">
              <h3 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">❌ Errors Found (${uploadResult.errors.length})</h3>
              ${formatErrorsTable(uploadResult.errors)}
            </div>
          ` : ''}

          ${uploadResult.duplicates.length > 0 ? `
            <div style="margin-bottom: 30px;">
              <h3 style="color: #f57c00; border-bottom: 2px solid #f57c00; padding-bottom: 10px;">⚠️ Duplicate Emails Skipped (${uploadResult.duplicates.length})</h3>
              <p style="color: #666; margin-bottom: 16px;">The following records were skipped because applications with these email addresses already exist:</p>
              ${formatDuplicatesTable(uploadResult.duplicates)}
            </div>
          ` : ''}

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 15px 0; color: #333;">📋 Next Steps</h3>
            <ul style="color: #666; margin: 0; padding-left: 20px;">
              <li>Review the newly created applications in the admin portal</li>
              <li>Process applications for approval as needed</li>
              ${uploadResult.errors.length > 0 ? '<li>Fix any data errors and re-upload the corrected records if needed</li>' : ''}
              <li>All created applications are in "pending" status and ready for review</li>
            </ul>
          </div>

          <div style="text-align: center; padding: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
            <p style="margin: 0;">
              This is an automated message from the UC Investments Academy Admin Portal.<br>
              If you have any questions, please contact your system administrator.
            </p>
          </div>
        </body>
        </html>
      `,
    })

    console.log('Email sent successfully:', emailResponse)

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    })
  } catch (error: any) {
    console.error('Error in send-bulk-upload-confirmation function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to send bulk upload confirmation email'
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    )
  }
}

serve(handler)