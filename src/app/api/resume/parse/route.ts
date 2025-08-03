import { NextRequest, NextResponse } from 'next/server';
import { ResumeParser } from '../../../../lib/resume-parser';

export async function POST(request: NextRequest) {
    try {
        const { resumeId } = await request.json();

        if (!resumeId) {
            return NextResponse.json(
                { error: 'resumeId is required' },
                { status: 400 }
            );
        }

        const parsedData = await ResumeParser.parseAndUpdateResume(resumeId);

        if (parsedData) {
            return NextResponse.json({
                success: true,
                parsedData
            });
        } else {
            return NextResponse.json(
                { error: 'Failed to parse resume' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in POST /api/resume/parse:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 