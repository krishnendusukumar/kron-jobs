import { supabase } from './supabase';

export interface LinkedInProfile {
    id?: string;
    user_id: string;
    linkedin_url?: string;
    profile_data?: any;
    name?: string;
    current_job_title?: string;
    company?: string;
    location?: string;
    summary?: string;
    skills?: string[];
    experience?: any[];
    education?: any[];
    certifications?: any[];
    languages?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface Resume {
    id?: string;
    user_id: string;
    file_name: string;
    file_url: string;
    file_size?: number;
    file_type?: string;
    parsed_data?: any;
    name?: string;
    email?: string;
    phone?: string;
    skills?: string[];
    experience?: any[];
    education?: any[];
    certifications?: any[];
    languages?: string[];
    summary?: string;
    created_at?: string;
    updated_at?: string;
}

export class ProfileService {
    /**
     * Get LinkedIn profile for a user
     */
    static async getLinkedInProfile(userId: string): Promise<LinkedInProfile | null> {
        try {
            const { data, error } = await supabase
                .from('linkedin_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) {
                console.error('Error fetching LinkedIn profile:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getLinkedInProfile:', error);
            return null;
        }
    }

    /**
     * Save or update LinkedIn profile
     */
    static async saveLinkedInProfile(profile: LinkedInProfile): Promise<LinkedInProfile | null> {
        try {
            const { data, error } = await supabase
                .from('linkedin_profiles')
                .upsert(profile, { onConflict: 'user_id' })
                .select()
                .single();

            if (error) {
                console.error('Error saving LinkedIn profile:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in saveLinkedInProfile:', error);
            return null;
        }
    }

    /**
     * Delete LinkedIn profile
     */
    static async deleteLinkedInProfile(userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('linkedin_profiles')
                .delete()
                .eq('user_id', userId);

            if (error) {
                console.error('Error deleting LinkedIn profile:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in deleteLinkedInProfile:', error);
            return false;
        }
    }

    /**
     * Get all resumes for a user
     */
    static async getResumes(userId: string): Promise<Resume[]> {
        try {
            const { data, error } = await supabase
                .from('resumes')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

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

    /**
     * Get a specific resume by ID
     */
    static async getResume(resumeId: string, userId: string): Promise<Resume | null> {
        try {
            const { data, error } = await supabase
                .from('resumes')
                .select('*')
                .eq('id', resumeId)
                .eq('user_id', userId)
                .single();

            if (error) {
                console.error('Error fetching resume:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in getResume:', error);
            return null;
        }
    }

    /**
     * Save a new resume
     */
    static async saveResume(resume: Resume): Promise<Resume | null> {
        try {
            const { data, error } = await supabase
                .from('resumes')
                .insert(resume)
                .select()
                .single();

            if (error) {
                console.error('Error saving resume:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in saveResume:', error);
            return null;
        }
    }

    /**
     * Update an existing resume
     */
    static async updateResume(resumeId: string, updates: Partial<Resume>): Promise<Resume | null> {
        try {
            const { data, error } = await supabase
                .from('resumes')
                .update(updates)
                .eq('id', resumeId)
                .select()
                .single();

            if (error) {
                console.error('Error updating resume:', error);
                return null;
            }

            return data;
        } catch (error) {
            console.error('Error in updateResume:', error);
            return null;
        }
    }

    /**
     * Delete a resume
     */
    static async deleteResume(resumeId: string, userId: string): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('resumes')
                .delete()
                .eq('id', resumeId)
                .eq('user_id', userId);

            if (error) {
                console.error('Error deleting resume:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in deleteResume:', error);
            return false;
        }
    }

    /**
     * Upload file to Supabase storage
     */
    static async uploadFile(file: File, userId: string, folder: string): Promise<string | null> {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/${folder}/${Date.now()}.${fileExt}`;

            const { data, error } = await supabase.storage
                .from('resumes')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (error) {
                console.error('Error uploading file:', error);
                return null;
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('resumes')
                .getPublicUrl(fileName);

            return urlData.publicUrl;
        } catch (error) {
            console.error('Error in uploadFile:', error);
            return null;
        }
    }

    /**
     * Delete file from Supabase storage
     */
    static async deleteFile(fileUrl: string): Promise<boolean> {
        try {
            // Extract file path from URL
            const urlParts = fileUrl.split('/');
            const filePath = urlParts.slice(-2).join('/'); // Get userId/filename

            const { error } = await supabase.storage
                .from('resumes')
                .remove([filePath]);

            if (error) {
                console.error('Error deleting file:', error);
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error in deleteFile:', error);
            return false;
        }
    }

    /**
     * Parse LinkedIn URL to extract profile ID
     */
    static parseLinkedInUrl(url: string): string | null {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname !== 'www.linkedin.com' && urlObj.hostname !== 'linkedin.com') {
                return null;
            }

            const pathParts = urlObj.pathname.split('/').filter(Boolean);
            if (pathParts.length >= 2 && pathParts[0] === 'in') {
                return pathParts[1];
            }

            return null;
        } catch (error) {
            console.error('Error parsing LinkedIn URL:', error);
            return null;
        }
    }

    /**
     * Validate LinkedIn URL format
     */
    static validateLinkedInUrl(url: string): boolean {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname === 'www.linkedin.com' || urlObj.hostname === 'linkedin.com';
        } catch (error) {
            return false;
        }
    }

    /**
     * Validate file type for resume upload
     */
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