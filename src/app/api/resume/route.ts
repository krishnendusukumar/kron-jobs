import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '../../../lib/profile-service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const resumeId = searchParams.get('resumeId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        if (resumeId) {
            // Get specific resume
            const resume = await ProfileService.getResume(resumeId, userId);
            
            if (!resume) {
                return NextResponse.json(
                    { error: 'Resume not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                resume
            });
        } else {
            // Get all resumes for user
            const resumes = await ProfileService.getResumes(userId);
            
            return NextResponse.json({
                success: true,
                resumes
            });
        }
    } catch (error) {
        console.error('Error in GET /api/resume:', error);
        return NextResponse.json(
            { error: 'Failed to fetch resumes' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const userId = formData.get('userId') as string;
        const file = formData.get('file') as File;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        if (!file) {
            return NextResponse.json(
                { error: 'File is required' },
                { status: 400 }
            );
        }

        // Validate file
        if (!ProfileService.validateResumeFile(file)) {
            return NextResponse.json(
                { error: 'Invalid file type or size. Please upload a PDF, DOCX, DOC, or TXT file under 10MB.' },
                { status: 400 }
            );
        }

        // Upload file to Supabase storage
        const fileUrl = await ProfileService.uploadFile(file, userId, 'resumes');
        
        if (!fileUrl) {
            return NextResponse.json(
                { error: 'Failed to upload file' },
                { status: 500 }
            );
        }

        // Create resume record
        const resume = {
            user_id: userId,
            file_name: file.name,
            file_url: fileUrl,
            file_size: file.size,
            file_type: file.type,
            parsed_data: {}, // Will be populated by resume parsing service
            name: '',
            email: '',
            phone: '',
            skills: [],
            experience: [],
            education: [],
            certifications: [],
            languages: [],
            summary: ''
        };

        const savedResume = await ProfileService.saveResume(resume);

        if (!savedResume) {
            return NextResponse.json(
                { error: 'Failed to save resume' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Resume uploaded successfully',
            resume: savedResume
        });
    } catch (error) {
        console.error('Error in POST /api/resume:', error);
        return NextResponse.json(
            { error: 'Failed to upload resume' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { resumeId, userId, updates } = body;

        if (!resumeId || !userId) {
            return NextResponse.json(
                { error: 'Resume ID and User ID are required' },
                { status: 400 }
            );
        }

        const updatedResume = await ProfileService.updateResume(resumeId, updates);

        if (!updatedResume) {
            return NextResponse.json(
                { error: 'Failed to update resume' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Resume updated successfully',
            resume: updatedResume
        });
    } catch (error) {
        console.error('Error in PUT /api/resume:', error);
        return NextResponse.json(
            { error: 'Failed to update resume' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const resumeId = searchParams.get('resumeId');
        const userId = searchParams.get('userId');

        if (!resumeId || !userId) {
            return NextResponse.json(
                { error: 'Resume ID and User ID are required' },
                { status: 400 }
            );
        }

        // Get resume to get file URL for deletion
        const resume = await ProfileService.getResume(resumeId, userId);
        if (!resume) {
            return NextResponse.json(
                { error: 'Resume not found' },
                { status: 404 }
            );
        }

        // Delete file from storage
        if (resume.file_url) {
            await ProfileService.deleteFile(resume.file_url);
        }

        // Delete resume record
        const success = await ProfileService.deleteResume(resumeId, userId);

        if (!success) {
            return NextResponse.json(
                { error: 'Failed to delete resume' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Resume deleted successfully'
        });
    } catch (error) {
        console.error('Error in DELETE /api/resume:', error);
        return NextResponse.json(
            { error: 'Failed to delete resume' },
            { status: 500 }
        );
    }
} 