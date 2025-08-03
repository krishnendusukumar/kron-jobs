import { NextRequest, NextResponse } from 'next/server';
import { ResumeParser } from '../../../lib/resume-parser';
import { ProfileService } from '../../../lib/profile-service';

export async function POST(request: NextRequest) {
    try {
        const { resumeId, jobDescription, companyName, jobTitle } = await request.json();

        if (!resumeId || !jobDescription || !companyName) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: resumeId, jobDescription, companyName' },
                { status: 400 }
            );
        }

        // Get resume with parsed data
        const resume = await ProfileService.getResumeWithParsedData(resumeId);
        if (!resume) {
            return NextResponse.json(
                { success: false, error: 'Resume not found' },
                { status: 404 }
            );
        }

        // If resume doesn't have parsed data, parse it first
        let parsedData = resume.parsed_data;
        if (!parsedData) {
            parsedData = await ResumeParser.parseAndUpdateResume(resumeId);
            if (!parsedData) {
                return NextResponse.json(
                    { success: false, error: 'Failed to parse resume' },
                    { status: 500 }
                );
            }
        }

        // Generate cover letter
        const coverLetter = await ResumeParser.generateCoverLetter(
            parsedData,
            jobDescription,
            companyName
        );

        return NextResponse.json({
            success: true,
            coverLetter,
            parsedData
        });

    } catch (error) {
        console.error('Error generating cover letter:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate cover letter' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const resumeId = searchParams.get('resumeId');
        const jobDescription = searchParams.get('jobDescription');
        const companyName = searchParams.get('companyName');
        const jobTitle = searchParams.get('jobTitle');

        if (!resumeId || !jobDescription || !companyName) {
            return NextResponse.json(
                { success: false, error: 'Missing required parameters: resumeId, jobDescription, companyName' },
                { status: 400 }
            );
        }

        // Get resume with parsed data
        const resume = await ProfileService.getResumeWithParsedData(resumeId);
        if (!resume) {
            return NextResponse.json(
                { success: false, error: 'Resume not found' },
                { status: 404 }
            );
        }

        // If resume doesn't have parsed data, parse it first
        let parsedData = resume.parsed_data;
        if (!parsedData) {
            parsedData = await ResumeParser.parseAndUpdateResume(resumeId);
            if (!parsedData) {
                return NextResponse.json(
                    { success: false, error: 'Failed to parse resume' },
                    { status: 500 }
                );
            }
        }

        // Generate cover letter
        const coverLetter = await ResumeParser.generateCoverLetter(
            parsedData,
            jobDescription,
            companyName
        );

        return NextResponse.json({
            success: true,
            coverLetter,
            parsedData
        });

    } catch (error) {
        console.error('Error generating cover letter:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate cover letter' },
            { status: 500 }
        );
    }
} 