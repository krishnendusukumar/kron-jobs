import { supabase } from './supabase';
import { ResumeParser, ParsedResume } from './resume-parser';

export interface Resume {
    id: string;
    user_id: string;
    filename: string;
    file_url: string;
    file_size: number;
    upload_date: string;
    parsed_data?: ParsedResume;
}

export class ProfileService {
    static async getResumes(userId: string): Promise<Resume[]> {
        try {
            const { data, error } = await supabase
                .from('resumes')
                .select('*')
                .eq('user_id', userId)
                .order('upload_date', { ascending: false });

            if (error) {
                console.error('Error fetching resumes:', error);
                return [];
            }

            return data || [];
        } catch (error) {
            console.error('Error in getResumes:', error);
            return [];
        }
    }

    static async uploadResume(userId: string, file: File): Promise<Resume | null> {
        try {
            // Generate unique filename
            const timestamp = Date.now();
            const fileExtension = file.name.split('.').pop();
            const filename = `resume_${userId}_${timestamp}.${fileExtension}`;

            // Upload file to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('resumes')
                .upload(filename, file);

            if (uploadError) {
                console.error('Error uploading file:', uploadError);
                return null;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('resumes')
                .getPublicUrl(filename);

            // Save resume record to database
            const { data, error } = await supabase
                .from('resumes')
                .insert({
                    user_id: userId,
                    filename: file.name,
                    file_url: urlData.publicUrl,
                    file_size: file.size,
                    upload_date: new Date().toISOString()
                })
                .select()
                .single();

            if (error) {
                console.error('Error saving resume record:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in uploadResume:', error);
            return null;
        }
    }

    static async deleteResume(resumeId: string): Promise<boolean> {
        try {
            // Get resume record first
            const { data: resume, error: fetchError } = await supabase
                .from('resumes')
                .select('*')
                .eq('id', resumeId)
                .single();

            if (fetchError || !resume) {
                console.error('Error fetching resume for deletion:', fetchError);
                return false;
            }

            // Delete from storage
            const filename = resume.file_url.split('/').pop();
            if (filename) {
                const { error: storageError } = await supabase.storage
                    .from('resumes')
                    .remove([filename]);

                if (storageError) {
                    console.error('Error deleting file from storage:', storageError);
                }
            }

            // Delete from database
            const { error } = await supabase
                .from('resumes')
                .delete()
                .eq('id', resumeId);

            if (error) {
                console.error('Error deleting resume record:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in deleteResume:', error);
            return false;
        }
    }

    static async parseResume(resumeId: string): Promise<ParsedResume | null> {
        try {
            return await ResumeParser.parseAndUpdateResume(resumeId);
        } catch (error) {
            console.error('Error in parseResume:', error);
            return null;
        }
    }

    static async getResumeWithParsedData(resumeId: string): Promise<Resume | null> {
        try {
            const { data, error } = await supabase
                .from('resumes')
                .select('*')
                .eq('id', resumeId)
                .single();

            if (error) {
                console.error('Error fetching resume:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getResumeWithParsedData:', error);
            return null;
        }
    }

    static validateResumeFile(file: File): boolean {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'text/plain'
        ];

        const maxSize = 10 * 1024 * 1024; // 10MB

        return allowedTypes.includes(file.type) && file.size <= maxSize;
    }
} 