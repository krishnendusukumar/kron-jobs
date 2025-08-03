import { supabase } from './supabase';

export interface ParsedResume {
    name: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
    skills: string[];
    experience: ResumeExperience[];
    education: ResumeEducation[];
    certifications: ResumeCertification[];
    languages: string[];
    projects: ResumeProject[];
}

export interface ResumeExperience {
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string[];
}

export interface ResumeEducation {
    degree: string;
    institution: string;
    location?: string;
    startDate: string;
    endDate?: string;
    gpa?: string;
    relevant_courses?: string[];
}

export interface ResumeCertification {
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
    credentialId?: string;
}

export interface ResumeProject {
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
}

export class ResumeParser {
    /**
     * Parse resume text and extract structured information
     */
    static async parseResumeText(text: string): Promise<ParsedResume> {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        const parsed: ParsedResume = {
            name: '',
            email: '',
            phone: '',
            location: '',
            summary: '',
            skills: [],
            experience: [],
            education: [],
            certifications: [],
            languages: [],
            projects: []
        };

        // Extract basic information
        parsed.name = this.extractName(lines);
        parsed.email = this.extractEmail(text);
        parsed.phone = this.extractPhone(text);
        parsed.location = this.extractLocation(lines);
        parsed.summary = this.extractSummary(lines);
        parsed.skills = this.extractSkills(lines);
        parsed.experience = this.extractExperience(lines);
        parsed.education = this.extractEducation(lines);
        parsed.certifications = this.extractCertifications(lines);
        parsed.languages = this.extractLanguages(lines);
        parsed.projects = this.extractProjects(lines);

        return parsed;
    }

    /**
     * Extract name from resume
     */
    private static extractName(lines: string[]): string {
        // Usually the first line or a prominent line with title case
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i];
            if (line && line.length > 2 && line.length < 50) {
                // Check if it looks like a name (title case, no special characters)
                if (/^[A-Z][a-z]+ [A-Z][a-z]+/.test(line)) {
                    return line;
                }
            }
        }
        return '';
    }

    /**
     * Extract email from text
     */
    private static extractEmail(text: string): string {
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const matches = text.match(emailRegex);
        return matches ? matches[0] : '';
    }

    /**
     * Extract phone number from text
     */
    private static extractPhone(text: string): string {
        const phoneRegex = /(\+?1[-.]?)?\(?([0-9]{3})\)?[-.]?([0-9]{3})[-.]?([0-9]{4})/g;
        const matches = text.match(phoneRegex);
        return matches ? matches[0] : '';
    }

    /**
     * Extract location from resume
     */
    private static extractLocation(lines: string[]): string {
        const locationKeywords = ['city', 'state', 'country', 'location', 'address'];

        for (const line of lines) {
            const lowerLine = line.toLowerCase();
            if (locationKeywords.some(keyword => lowerLine.includes(keyword))) {
                return line;
            }
        }
        return '';
    }

    /**
     * Extract summary/objective from resume
     */
    private static extractSummary(lines: string[]): string {
        const summaryKeywords = ['summary', 'objective', 'profile', 'about'];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            if (summaryKeywords.some(keyword => line.includes(keyword))) {
                // Get next few lines as summary
                let summary = '';
                for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                    if (lines[j] && lines[j].length > 10) {
                        summary += lines[j] + ' ';
                    }
                }
                return summary.trim();
            }
        }
        return '';
    }

    /**
     * Extract skills from resume
     */
    private static extractSkills(lines: string[]): string[] {
        const skills: string[] = [];
        const skillKeywords = ['skills', 'technologies', 'tools', 'languages', 'frameworks'];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            if (skillKeywords.some(keyword => line.includes(keyword))) {
                // Extract skills from next few lines
                for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
                    const skillLine = lines[j];
                    if (skillLine && skillLine.length > 0) {
                        // Split by common separators
                        const skillList = skillLine.split(/[,•·|]/).map(s => s.trim()).filter(s => s.length > 0);
                        skills.push(...skillList);
                    }
                }
                break;
            }
        }

        return [...new Set(skills)]; // Remove duplicates
    }

    /**
     * Extract work experience from resume
     */
    private static extractExperience(lines: string[]): ResumeExperience[] {
        const experience: ResumeExperience[] = [];
        const experienceKeywords = ['experience', 'work history', 'employment'];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            if (experienceKeywords.some(keyword => line.includes(keyword))) {
                // Parse experience entries
                let currentExperience: Partial<ResumeExperience> = {};
                let inExperience = false;

                for (let j = i + 1; j < lines.length; j++) {
                    const expLine = lines[j];
                    if (!expLine) continue;

                    // Check if we've moved to a new section
                    if (this.isNewSection(expLine)) break;

                    // Try to parse job title and company
                    const titleMatch = expLine.match(/^([^•]+) at ([^•]+)/i);
                    if (titleMatch) {
                        if (currentExperience.title) {
                            // Save previous experience
                            if (this.isValidExperience(currentExperience)) {
                                experience.push(currentExperience as ResumeExperience);
                            }
                        }
                        currentExperience = {
                            title: titleMatch[1].trim(),
                            company: titleMatch[2].trim(),
                            description: []
                        };
                        inExperience = true;
                    } else if (inExperience && expLine.length > 10) {
                        // Add to description
                        if (currentExperience.description) {
                            currentExperience.description.push(expLine);
                        }
                    }
                }

                // Add last experience
                if (this.isValidExperience(currentExperience)) {
                    experience.push(currentExperience as ResumeExperience);
                }
                break;
            }
        }

        return experience;
    }

    /**
     * Extract education from resume
     */
    private static extractEducation(lines: string[]): ResumeEducation[] {
        const education: ResumeEducation[] = [];
        const educationKeywords = ['education', 'academic', 'degree'];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            if (educationKeywords.some(keyword => line.includes(keyword))) {
                // Parse education entries
                for (let j = i + 1; j < lines.length; j++) {
                    const eduLine = lines[j];
                    if (!eduLine) continue;

                    if (this.isNewSection(eduLine)) break;

                    // Try to parse degree and institution
                    const degreeMatch = eduLine.match(/^([^•]+) from ([^•]+)/i);
                    if (degreeMatch) {
                        education.push({
                            degree: degreeMatch[1].trim(),
                            institution: degreeMatch[2].trim(),
                            startDate: '',
                            endDate: ''
                        });
                    }
                }
                break;
            }
        }

        return education;
    }

    /**
     * Extract certifications from resume
     */
    private static extractCertifications(lines: string[]): ResumeCertification[] {
        const certifications: ResumeCertification[] = [];
        const certKeywords = ['certification', 'certificate', 'certified'];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            if (certKeywords.some(keyword => line.includes(keyword))) {
                // Parse certification entries
                for (let j = i + 1; j < lines.length; j++) {
                    const certLine = lines[j];
                    if (!certLine) continue;

                    if (this.isNewSection(certLine)) break;

                    // Try to parse certification name and issuer
                    const certMatch = certLine.match(/^([^•]+) from ([^•]+)/i);
                    if (certMatch) {
                        certifications.push({
                            name: certMatch[1].trim(),
                            issuer: certMatch[2].trim(),
                            date: ''
                        });
                    }
                }
                break;
            }
        }

        return certifications;
    }

    /**
     * Extract languages from resume
     */
    private static extractLanguages(lines: string[]): string[] {
        const languages: string[] = [];
        const languageKeywords = ['languages', 'language'];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            if (languageKeywords.some(keyword => line.includes(keyword))) {
                // Extract languages from next few lines
                for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                    const langLine = lines[j];
                    if (langLine && langLine.length > 0) {
                        const langList = langLine.split(/[,•·|]/).map(l => l.trim()).filter(l => l.length > 0);
                        languages.push(...langList);
                    }
                }
                break;
            }
        }

        return [...new Set(languages)]; // Remove duplicates
    }

    /**
     * Extract projects from resume
     */
    private static extractProjects(lines: string[]): ResumeProject[] {
        const projects: ResumeProject[] = [];
        const projectKeywords = ['projects', 'project', 'portfolio'];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            if (projectKeywords.some(keyword => line.includes(keyword))) {
                // Parse project entries
                let currentProject: Partial<ResumeProject> = {};
                let inProject = false;

                for (let j = i + 1; j < lines.length; j++) {
                    const projLine = lines[j];
                    if (!projLine) continue;

                    if (this.isNewSection(projLine)) break;

                    // Try to parse project name
                    if (projLine.length > 5 && projLine.length < 100 && !projLine.includes('•')) {
                        if (currentProject.name) {
                            // Save previous project
                            if (this.isValidProject(currentProject)) {
                                projects.push(currentProject as ResumeProject);
                            }
                        }
                        currentProject = {
                            name: projLine,
                            description: '',
                            technologies: []
                        };
                        inProject = true;
                    } else if (inProject && projLine.length > 10) {
                        // Add to description
                        if (currentProject.description) {
                            currentProject.description += ' ' + projLine;
                        }
                    }
                }

                // Add last project
                if (this.isValidProject(currentProject)) {
                    projects.push(currentProject as ResumeProject);
                }
                break;
            }
        }

        return projects;
    }

    /**
     * Check if a line indicates a new section
     */
    private static isNewSection(line: string): boolean {
        const sectionKeywords = ['education', 'experience', 'skills', 'projects', 'certifications', 'languages'];
        const lowerLine = line.toLowerCase();
        return sectionKeywords.some(keyword => lowerLine.includes(keyword));
    }

    /**
     * Validate if experience object is complete
     */
    private static isValidExperience(exp: Partial<ResumeExperience>): boolean {
        return !!(exp.title && exp.company);
    }

    /**
     * Validate if project object is complete
     */
    private static isValidProject(proj: Partial<ResumeProject>): boolean {
        return !!(proj.name && proj.description);
    }

    /**
     * Parse resume file and update database
     */
    static async parseAndUpdateResume(resumeId: string): Promise<ParsedResume | null> {
        try {
            // Get resume record
            const { data: resume, error: fetchError } = await supabase
                .from('resumes')
                .select('*')
                .eq('id', resumeId)
                .single();

            if (fetchError || !resume) {
                console.error('Error fetching resume for parsing:', fetchError);
                return null;
            }

            // Download file content
            const { data: fileData, error: downloadError } = await supabase.storage
                .from('resumes')
                .download(resume.filename);

            if (downloadError) {
                console.error('Error downloading file for parsing:', downloadError);
                return null;
            }

            // Convert to text
            const text = await fileData.text();

            // Parse the resume
            const parsedData = await this.parseResumeText(text);

            // Update resume with parsed data
            const { error: updateError } = await supabase
                .from('resumes')
                .update({
                    parsed_data: parsedData
                })
                .eq('id', resumeId);

            if (updateError) {
                console.error('Error updating resume with parsed data:', updateError);
            }

            return parsedData;
        } catch (error) {
            console.error('Error in parseAndUpdateResume:', error);
            return null;
        }
    }
} 