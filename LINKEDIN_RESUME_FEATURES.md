# LinkedIn Profile & Resume Upload Features

## Overview

This document describes the implementation of LinkedIn Profile Upload and Resume Upload features for the KronJobs platform. These features allow users to upload their LinkedIn profiles and resumes, which are then used for generating personalized cover letters and assisting with job applications.

## Features Implemented

### 1. LinkedIn Profile Upload

#### UI Components
- **LinkedIn Profile Section**: Accessible via sidebar navigation
- **Profile URL Input**: Users can enter their LinkedIn profile URL
- **Profile Data Display**: Shows parsed LinkedIn information
- **Edit/Delete Functionality**: Users can modify or remove their profile data

#### Backend Functionality
- **LinkedIn URL Validation**: Ensures valid LinkedIn profile URLs
- **Profile Data Storage**: Stores LinkedIn profile information in database
- **API Endpoints**: RESTful API for CRUD operations on LinkedIn profiles

#### Database Schema
```sql
CREATE TABLE linkedin_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    linkedin_url TEXT,
    profile_data JSONB,
    name TEXT,
    current_job_title TEXT,
    company TEXT,
    location TEXT,
    summary TEXT,
    skills TEXT[],
    experience JSONB,
    education JSONB,
    certifications JSONB,
    languages TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Resume Upload

#### UI Components
- **Resume Upload Section**: Accessible via sidebar navigation
- **Drag & Drop Interface**: Modern file upload with drag and drop support
- **File Validation**: Validates file type and size
- **Upload Progress**: Visual progress indicator during upload
- **Resume List**: Displays all uploaded resumes with parsed data
- **File Management**: View and delete uploaded resumes

#### Backend Functionality
- **File Upload**: Secure file upload to Supabase storage
- **File Validation**: Supports PDF, DOCX, DOC, and TXT files (max 10MB)
- **Resume Parsing**: Extracts key information from uploaded resumes
- **Storage Management**: Automatic cleanup of deleted files

#### Database Schema
```sql
CREATE TABLE resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    file_type TEXT,
    parsed_data JSONB,
    name TEXT,
    email TEXT,
    phone TEXT,
    skills TEXT[],
    experience JSONB,
    education JSONB,
    certifications JSONB,
    languages TEXT[],
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### LinkedIn Profile API (`/api/linkedin-profile`)

#### GET
- **Purpose**: Fetch user's LinkedIn profile
- **Parameters**: `userId` (query parameter)
- **Response**: LinkedIn profile data

#### POST
- **Purpose**: Save new LinkedIn profile
- **Body**: `{ userId, linkedinUrl, profileData }`
- **Response**: Saved profile data

#### PUT
- **Purpose**: Update existing LinkedIn profile
- **Body**: `{ userId, updates }`
- **Response**: Updated profile data

#### DELETE
- **Purpose**: Delete LinkedIn profile
- **Parameters**: `userId` (query parameter)
- **Response**: Success confirmation

### Resume API (`/api/resume`)

#### GET
- **Purpose**: Fetch user's resumes
- **Parameters**: `userId` (required), `resumeId` (optional)
- **Response**: Resume data or list of resumes

#### POST
- **Purpose**: Upload new resume
- **Body**: FormData with `userId` and `file`
- **Response**: Uploaded resume data

#### PUT
- **Purpose**: Update resume metadata
- **Body**: `{ resumeId, userId, updates }`
- **Response**: Updated resume data

#### DELETE
- **Purpose**: Delete resume
- **Parameters**: `resumeId` and `userId` (query parameters)
- **Response**: Success confirmation

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── linkedin-profile/
│   │   │   └── route.ts          # LinkedIn profile API
│   │   └── resume/
│   │       └── route.ts          # Resume upload API
│   └── dashboard/
│       └── page.tsx              # Main dashboard with new sections
├── lib/
│   ├── profile-service.ts        # LinkedIn and resume service
│   └── supabase.ts              # Database connection
└── components/
    └── shared/                   # Shared UI components
```

## Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Automatic cleanup on user deletion

### File Security
- Files stored in Supabase storage with user-specific paths
- Automatic file cleanup when resumes are deleted
- File type and size validation

### Data Validation
- LinkedIn URL format validation
- File type and size validation
- Input sanitization and validation

## Usage Instructions

### For Users

#### LinkedIn Profile Upload
1. Navigate to "LinkedIn Profile" in the sidebar
2. Enter your LinkedIn profile URL
3. Click "Save Profile"
4. View and edit your profile information
5. Use "Delete Profile" to remove your data

#### Resume Upload
1. Navigate to "Resume Upload" in the sidebar
2. Drag and drop a resume file or click "Choose File"
3. Supported formats: PDF, DOCX, DOC, TXT (max 10MB)
4. Click "Upload Resume"
5. View uploaded resumes and parsed information
6. Use "Delete" to remove resumes

### For Developers

#### Database Setup
1. Run the SQL script `add-linkedin-resume-tables.sql` in Supabase
2. Create a storage bucket named "resumes" in Supabase
3. Set up RLS policies for the storage bucket

#### Environment Variables
Ensure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Future Enhancements

### LinkedIn Integration
- **LinkedIn OAuth**: Direct LinkedIn API integration
- **Profile Sync**: Automatic profile data updates
- **Skill Extraction**: Enhanced skill parsing from LinkedIn

### Resume Parsing
- **AI-Powered Parsing**: Advanced resume parsing with AI
- **Multiple Format Support**: Support for more file formats
- **Template Matching**: Smart template detection

### Cover Letter Generation
- **AI Cover Letters**: Generate personalized cover letters
- **Template System**: Multiple cover letter templates
- **Job Matching**: Match resume skills with job requirements

## Technical Notes

### Performance Considerations
- File uploads are processed asynchronously
- Database queries are optimized with proper indexing
- Storage cleanup is handled automatically

### Error Handling
- Comprehensive error handling for all API endpoints
- User-friendly error messages
- Graceful degradation for network issues

### Testing
- API endpoints can be tested with tools like Postman
- File upload testing with various file types and sizes
- Database operations testing with sample data

## Support

For technical support or feature requests, please refer to the main project documentation or contact the development team. 