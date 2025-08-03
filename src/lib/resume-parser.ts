import { supabase } from './supabase';

export interface ParsedResume {
    // Basic Information
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    portfolio?: string;

    // Professional Summary
    summary?: string;

    // Skills & Technologies
    skills?: string[];
    technologies?: string[];
    programming_languages?: string[];
    frameworks?: string[];
    tools?: string[];

    // Experience
    experience?: WorkExperience[];

    // Education
    education?: Education[];

    // Projects
    projects?: Project[];

    // Certifications
    certifications?: Certification[];

    // Languages
    languages?: string[];

    // Additional Information
    achievements?: string[];
    interests?: string[];

    // Metadata
    parsed_at?: string;
    confidence_score?: number;
}

export interface WorkExperience {
    company: string;
    position: string;
    start_date: string;
    end_date?: string;
    current: boolean;
    location?: string;
    description: string[];
    technologies?: string[];
    achievements?: string[];
}

export interface Education {
    institution: string;
    degree: string;
    field_of_study?: string;
    start_date: string;
    end_date?: string;
    gpa?: string;
    relevant_courses?: string[];
}

export interface Project {
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    github?: string;
    highlights?: string[];
}

export interface Certification {
    name: string;
    issuer: string;
    date: string;
    url?: string;
    expiry_date?: string;
}

export class ResumeParser {
    private static readonly AI_PROMPT = `
    You are an expert resume parser. Extract all information from the resume text and return it in a structured JSON format.
    
    Please extract:
    1. Personal Information (name, email, phone, location, LinkedIn, portfolio)
    2. Professional Summary
    3. Skills (technical skills, programming languages, frameworks, tools)
    4. Work Experience (company, position, dates, description, technologies used)
    5. Education (institution, degree, field of study, dates, GPA)
    6. Projects (name, description, technologies, URLs)
    7. Certifications (name, issuer, date, expiry)
    8. Languages
    9. Achievements and interests
    
    Return the data in this exact JSON structure:
    {
        "name": "string",
        "email": "string", 
        "phone": "string",
        "location": "string",
        "linkedin": "string",
        "portfolio": "string",
        "summary": "string",
        "skills": ["string"],
        "technologies": ["string"],
        "programming_languages": ["string"],
        "frameworks": ["string"],
        "tools": ["string"],
        "experience": [
            {
                "company": "string",
                "position": "string", 
                "start_date": "YYYY-MM",
                "end_date": "YYYY-MM or null",
                "current": boolean,
                "location": "string",
                "description": ["string"],
                "technologies": ["string"],
                "achievements": ["string"]
            }
        ],
        "education": [
            {
                "institution": "string",
                "degree": "string",
                "field_of_study": "string",
                "start_date": "YYYY-MM",
                "end_date": "YYYY-MM or null",
                "gpa": "string",
                "relevant_courses": ["string"]
            }
        ],
        "projects": [
            {
                "name": "string",
                "description": "string",
                "technologies": ["string"],
                "url": "string",
                "github": "string",
                "highlights": ["string"]
            }
        ],
        "certifications": [
            {
                "name": "string",
                "issuer": "string",
                "date": "YYYY-MM",
                "url": "string",
                "expiry_date": "YYYY-MM or null"
            }
        ],
        "languages": ["string"],
        "achievements": ["string"],
        "interests": ["string"]
    }
    
    Only return valid JSON. If information is not available, use null or empty arrays.
    `;

    /**
     * Parse resume text using AI and structured parsing
     */
    static async parseResumeText(text: string): Promise<ParsedResume> {
        try {
            // First, try AI parsing
            const aiResult = await this.parseWithAI(text);
            if (aiResult && aiResult.confidence_score && aiResult.confidence_score > 0.7) {
                return aiResult;
            }

            // Fallback to structured parsing
            return this.parseWithStructuredRules(text);
        } catch (error) {
            console.error('Error parsing resume:', error);
            return this.parseWithStructuredRules(text);
        }
    }

    /**
     * Parse resume using AI (OpenAI or similar)
     */
    private static async parseWithAI(text: string): Promise<ParsedResume> {
        try {
            // For now, we'll use a mock AI response
            // In production, you would integrate with OpenAI, Anthropic, or similar
            const response = await this.callAIService(text);

            if (response && typeof response === 'object') {
                return {
                    ...response,
                    parsed_at: new Date().toISOString(),
                    confidence_score: 0.9
                };
            }

            throw new Error('Invalid AI response');
        } catch (error) {
            console.error('AI parsing failed:', error);
            throw error;
        }
    }

    /**
     * Call AI service (placeholder for OpenAI/Anthropic integration)
     */
    private static async callAIService(text: string): Promise<any> {
        // This is a placeholder for AI service integration
        // In production, you would use OpenAI, Anthropic, or similar

        // For now, we'll use a simple regex-based approach
        // You can replace this with actual AI service calls

        const prompt = this.AI_PROMPT + '\n\nResume text:\n' + text;

        // Mock AI response for demonstration
        // Replace this with actual AI service call
        return this.mockAIResponse(text);
    }

    /**
     * Mock AI response for demonstration
     */
    private static mockAIResponse(text: string): ParsedResume {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        const result: ParsedResume = {
            name: this.extractName(lines),
            email: this.extractEmail(text),
            phone: this.extractPhone(text),
            location: this.extractLocation(lines),
            summary: this.extractSummary(lines),
            skills: this.extractSkills(text),
            technologies: this.extractTechnologies(text),
            programming_languages: this.extractProgrammingLanguages(text),
            frameworks: this.extractFrameworks(text),
            tools: this.extractTools(text),
            experience: this.extractExperience(lines),
            education: this.extractEducation(lines),
            projects: this.extractProjects(lines),
            certifications: this.extractCertifications(lines),
            languages: this.extractLanguages(text),
            achievements: this.extractAchievements(lines),
            interests: this.extractInterests(lines),
            parsed_at: new Date().toISOString(),
            confidence_score: 0.8
        };

        return result;
    }

    /**
     * Parse resume using structured rules and regex
     */
    private static parseWithStructuredRules(text: string): ParsedResume {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        return {
            name: this.extractName(lines),
            email: this.extractEmail(text),
            phone: this.extractPhone(text),
            location: this.extractLocation(lines),
            summary: this.extractSummary(lines),
            skills: this.extractSkills(text),
            technologies: this.extractTechnologies(text),
            programming_languages: this.extractProgrammingLanguages(text),
            frameworks: this.extractFrameworks(text),
            tools: this.extractTools(text),
            experience: this.extractExperience(lines),
            education: this.extractEducation(lines),
            projects: this.extractProjects(lines),
            certifications: this.extractCertifications(lines),
            languages: this.extractLanguages(text),
            achievements: this.extractAchievements(lines),
            interests: this.extractInterests(lines),
            parsed_at: new Date().toISOString(),
            confidence_score: 0.6
        };
    }

    // Extraction methods
    private static extractName(lines: string[]): string | undefined {
        // Look for name in first few lines
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i];
            // Name patterns: typically 2-3 words, capitalized
            const nameMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})$/);
            if (nameMatch) {
                return nameMatch[1];
            }
        }
        return undefined;
    }

    private static extractEmail(text: string): string | undefined {
        const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
        return emailMatch ? emailMatch[0] : undefined;
    }

    private static extractPhone(text: string): string | undefined {
        const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
        return phoneMatch ? phoneMatch[0] : undefined;
    }

    private static extractLocation(lines: string[]): string | undefined {
        const locationKeywords = ['location', 'address', 'city', 'state', 'country'];
        for (const line of lines) {
            const lowerLine = line.toLowerCase();
            if (locationKeywords.some(keyword => lowerLine.includes(keyword))) {
                return line.replace(/^.*?:\s*/i, '').trim();
            }
        }
        return undefined;
    }

    private static extractSummary(lines: string[]): string | undefined {
        const summaryKeywords = ['summary', 'objective', 'profile', 'about'];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].toLowerCase();
            if (summaryKeywords.some(keyword => line.includes(keyword))) {
                // Get next few lines as summary
                let summary = '';
                for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
                    if (lines[j].length > 10) {
                        summary += lines[j] + ' ';
                    }
                }
                return summary.trim();
            }
        }
        return undefined;
    }

    private static extractSkills(text: string): string[] {
        const skills = new Set<string>();

        // Common technical skills
        const technicalSkills = [
            'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
            'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask',
            'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'AWS', 'Azure', 'GCP',
            'Docker', 'Kubernetes', 'Git', 'Jenkins', 'Jira', 'Agile', 'Scrum'
        ];

        for (const skill of technicalSkills) {
            if (text.toLowerCase().includes(skill.toLowerCase())) {
                skills.add(skill);
            }
        }

        return Array.from(skills);
    }

    private static extractTechnologies(text: string): string[] {
        return this.extractSkills(text); // For now, same as skills
    }

    private static extractProgrammingLanguages(text: string): string[] {
        const languages = ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'TypeScript'];
        return languages.filter(lang => text.toLowerCase().includes(lang.toLowerCase()));
    }

    private static extractFrameworks(text: string): string[] {
        const frameworks = ['React', 'Angular', 'Vue', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'Rails'];
        return frameworks.filter(framework => text.toLowerCase().includes(framework.toLowerCase()));
    }

    private static extractTools(text: string): string[] {
        const tools = ['Git', 'Docker', 'Jenkins', 'Jira', 'AWS', 'Azure', 'GCP', 'MongoDB', 'PostgreSQL', 'MySQL'];
        return tools.filter(tool => text.toLowerCase().includes(tool.toLowerCase()));
    }

    private static extractExperience(lines: string[]): WorkExperience[] {
        const experience: WorkExperience[] = [];
        const experienceKeywords = ['experience', 'work', 'employment', 'career'];

        let inExperienceSection = false;
        let currentExperience: Partial<WorkExperience> = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();

            // Check if we're entering experience section
            if (experienceKeywords.some(keyword => lowerLine.includes(keyword))) {
                inExperienceSection = true;
                continue;
            }

            if (inExperienceSection) {
                // Look for company/position patterns
                const companyMatch = line.match(/^([A-Z][A-Za-z\s&]+)\s*[-–]\s*(.+)$/);
                if (companyMatch) {
                    if (currentExperience.company) {
                        experience.push(currentExperience as WorkExperience);
                    }
                    currentExperience = {
                        company: companyMatch[1].trim(),
                        position: companyMatch[2].trim(),
                        description: [],
                        technologies: [],
                        achievements: []
                    };
                }

                // Look for date patterns
                const dateMatch = line.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i);
                if (dateMatch && currentExperience.company) {
                    currentExperience.start_date = dateMatch[1] + '-01';
                    if (dateMatch[2].toLowerCase() === 'present' || dateMatch[2].toLowerCase() === 'current') {
                        currentExperience.current = true;
                    } else {
                        currentExperience.end_date = dateMatch[2] + '-12';
                        currentExperience.current = false;
                    }
                }

                // Add description lines
                if (currentExperience.company && line.length > 10 && !line.match(/^\d/)) {
                    currentExperience.description?.push(line);
                }
            }
        }

        if (currentExperience.company) {
            experience.push(currentExperience as WorkExperience);
        }

        return experience;
    }

    private static extractEducation(lines: string[]): Education[] {
        const education: Education[] = [];
        const educationKeywords = ['education', 'academic', 'degree', 'university', 'college'];

        let inEducationSection = false;
        let currentEducation: Partial<Education> = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();

            if (educationKeywords.some(keyword => lowerLine.includes(keyword))) {
                inEducationSection = true;
                continue;
            }

            if (inEducationSection) {
                // Look for institution/degree patterns
                const institutionMatch = line.match(/^([A-Z][A-Za-z\s&]+)\s*[-–]\s*(.+)$/);
                if (institutionMatch) {
                    if (currentEducation.institution) {
                        education.push(currentEducation as Education);
                    }
                    currentEducation = {
                        institution: institutionMatch[1].trim(),
                        degree: institutionMatch[2].trim(),
                        relevant_courses: []
                    };
                }

                // Look for date patterns
                const dateMatch = line.match(/(\d{4})\s*[-–]\s*(\d{4}|present|current)/i);
                if (dateMatch && currentEducation.institution) {
                    currentEducation.start_date = dateMatch[1] + '-01';
                    if (dateMatch[2].toLowerCase() !== 'present' && dateMatch[2].toLowerCase() !== 'current') {
                        currentEducation.end_date = dateMatch[2] + '-12';
                    }
                }
            }
        }

        if (currentEducation.institution) {
            education.push(currentEducation as Education);
        }

        return education;
    }

    private static extractProjects(lines: string[]): Project[] {
        const projects: Project[] = [];
        const projectKeywords = ['project', 'portfolio', 'github'];

        let inProjectSection = false;
        let currentProject: Partial<Project> = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();

            if (projectKeywords.some(keyword => lowerLine.includes(keyword))) {
                inProjectSection = true;
                continue;
            }

            if (inProjectSection) {
                // Look for project name patterns
                const projectMatch = line.match(/^([A-Z][A-Za-z\s]+)\s*[-–]\s*(.+)$/);
                if (projectMatch) {
                    if (currentProject.name) {
                        projects.push(currentProject as Project);
                    }
                    currentProject = {
                        name: projectMatch[1].trim(),
                        description: projectMatch[2].trim(),
                        technologies: [],
                        highlights: []
                    };
                }

                // Add description lines
                if (currentProject.name && line.length > 10 && !line.match(/^\d/)) {
                    currentProject.description += ' ' + line;
                }
            }
        }

        if (currentProject.name) {
            projects.push(currentProject as Project);
        }

        return projects;
    }

    private static extractCertifications(lines: string[]): Certification[] {
        const certifications: Certification[] = [];
        const certKeywords = ['certification', 'certificate', 'certified'];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lowerLine = line.toLowerCase();

            if (certKeywords.some(keyword => lowerLine.includes(keyword))) {
                // Look for certification patterns
                const certMatch = line.match(/^([A-Z][A-Za-z\s]+)\s*[-–]\s*(.+)$/);
                if (certMatch) {
                    certifications.push({
                        name: certMatch[1].trim(),
                        issuer: certMatch[2].trim(),
                        date: new Date().toISOString().slice(0, 7) // Default to current date
                    });
                }
            }
        }

        return certifications;
    }

    private static extractLanguages(text: string): string[] {
        const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Arabic'];
        return languages.filter(lang => text.toLowerCase().includes(lang.toLowerCase()));
    }

    private static extractAchievements(lines: string[]): string[] {
        const achievements: string[] = [];
        const achievementKeywords = ['achievement', 'award', 'recognition', 'honor'];

        for (const line of lines) {
            const lowerLine = line.toLowerCase();
            if (achievementKeywords.some(keyword => lowerLine.includes(keyword))) {
                achievements.push(line);
            }
        }

        return achievements;
    }

    private static extractInterests(lines: string[]): string[] {
        const interests: string[] = [];
        const interestKeywords = ['interest', 'hobby', 'passion'];

        for (const line of lines) {
            const lowerLine = line.toLowerCase();
            if (interestKeywords.some(keyword => lowerLine.includes(keyword))) {
                interests.push(line);
            }
        }

        return interests;
    }

    /**
     * Parse and update resume in database
     */
    static async parseAndUpdateResume(resumeId: string): Promise<ParsedResume | null> {
        try {
            // Get resume from database
            const { data: resume, error } = await supabase
                .from('resumes')
                .select('*')
                .eq('id', resumeId)
                .single();

            if (error || !resume) {
                console.error('Error fetching resume:', error);
                return null;
            }

            // Download and read file content
            const fileContent = await this.downloadAndReadFile(resume.file_url);
            if (!fileContent) {
                console.error('Error reading file content');
                return null;
            }

            // Parse the content
            const parsedData = await this.parseResumeText(fileContent);

            // Update database with parsed data
            const { error: updateError } = await supabase
                .from('resumes')
                .update({
                    parsed_data: parsedData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', resumeId);

            if (updateError) {
                console.error('Error updating resume with parsed data:', updateError);
                return null;
            }

            return parsedData;
        } catch (error) {
            console.error('Error in parseAndUpdateResume:', error);
            return null;
        }
    }

    /**
     * Download and read file content
     */
    private static async downloadAndReadFile(fileUrl: string): Promise<string | null> {
        try {
            const response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const blob = await response.blob();
            const text = await blob.text();
            return text;
        } catch (error) {
            console.error('Error downloading file:', error);
            return null;
        }
    }

    /**
     * Generate cover letter based on parsed resume and job description
     */
    static async generateCoverLetter(
        parsedResume: ParsedResume,
        jobDescription: string,
        companyName: string
    ): Promise<string> {
        const prompt = `
        Generate a personalized cover letter based on the following information:
        
        Candidate Information:
        - Name: ${parsedResume.name || 'Candidate'}
        - Summary: ${parsedResume.summary || 'Experienced professional'}
        - Key Skills: ${parsedResume.skills?.join(', ') || 'Various technical skills'}
        - Experience: ${parsedResume.experience?.length || 0} years of experience
        - Education: ${parsedResume.education?.map(edu => `${edu.degree} from ${edu.institution}`).join(', ') || 'Relevant education'}
        
        Job Description:
        ${jobDescription}
        
        Company: ${companyName}
        
        Please create a compelling cover letter that:
        1. Addresses the hiring manager professionally
        2. Highlights relevant experience and skills
        3. Explains why the candidate is a good fit for the role
        4. Shows enthusiasm for the company and position
        5. Includes a call to action
        
        Format the letter professionally with proper paragraphs and structure.
        `;

        // For now, return a template-based cover letter
        // In production, you would use AI to generate this
        return this.generateTemplateCoverLetter(parsedResume, jobDescription, companyName);
    }

    /**
     * Generate template-based cover letter
     */
    private static generateTemplateCoverLetter(
        parsedResume: ParsedResume,
        jobDescription: string,
        companyName: string
    ): string {
        const name = parsedResume.name || 'Candidate';
        const summary = parsedResume.summary || 'experienced professional';
        const skills = parsedResume.skills?.slice(0, 5).join(', ') || 'various technical skills';
        const experience = parsedResume.experience?.length || 0;

        return `
Dear Hiring Manager,

I am writing to express my strong interest in the position at ${companyName}. With ${experience} years of experience as a ${summary}, I am excited about the opportunity to contribute to your team.

My background includes expertise in ${skills}, which I believe aligns perfectly with the requirements of this role. Throughout my career, I have demonstrated the ability to deliver high-quality results while collaborating effectively with cross-functional teams.

I am particularly drawn to ${companyName} because of its reputation for innovation and excellence. The opportunity to work on challenging projects and grow within a dynamic organization is exactly what I am looking for in my next role.

I am confident that my technical skills, problem-solving abilities, and passion for delivering exceptional results would make me a valuable addition to your team. I would welcome the opportunity to discuss how my background, skills, and enthusiasm would benefit ${companyName}.

Thank you for considering my application. I look forward to the opportunity to speak with you about this position.

Best regards,
${name}
        `.trim();
    }
} 