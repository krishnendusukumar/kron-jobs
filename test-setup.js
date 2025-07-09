#!/usr/bin/env node

/**
 * KronJob Setup Test Script
 * Run this to verify your setup is working correctly
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 KronJob Setup Test\n');

// Test 1: Check Node.js version
console.log('1. Checking Node.js version...');
try {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

    if (majorVersion >= 18) {
        console.log(`✅ Node.js ${nodeVersion} - OK`);
    } else {
        console.log(`❌ Node.js ${nodeVersion} - Need version 18+`);
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Could not check Node.js version');
    process.exit(1);
}

// Test 2: Check if dependencies are installed
console.log('\n2. Checking dependencies...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const requiredDeps = ['axios', 'cheerio', 'node-cron', '@supabase/supabase-js'];

    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

    if (missingDeps.length === 0) {
        console.log('✅ All required dependencies installed');
    } else {
        console.log(`❌ Missing dependencies: ${missingDeps.join(', ')}`);
        console.log('Run: npm install axios cheerio node-cron');
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Could not check dependencies');
    process.exit(1);
}

// Test 3: Check if .env.local exists
console.log('\n3. Checking environment variables...');
try {
    if (fs.existsSync('.env.local')) {
        const envContent = fs.readFileSync('.env.local', 'utf8');

        if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL') &&
            envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
            console.log('✅ Environment variables file found');
        } else {
            console.log('❌ Missing required environment variables');
            console.log('Make sure .env.local contains:');
            console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
            console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
        }
    } else {
        console.log('❌ .env.local file not found');
        console.log('Create .env.local with your Supabase credentials');
    }
} catch (error) {
    console.log('❌ Could not check environment variables');
}

// Test 4: Check if database setup file exists
console.log('\n4. Checking database setup...');
try {
    if (fs.existsSync('database-setup.sql')) {
        console.log('✅ Database setup file found');
        console.log('Run the SQL in your Supabase SQL Editor');
    } else {
        console.log('❌ database-setup.sql not found');
    }
} catch (error) {
    console.log('❌ Could not check database setup');
}

// Test 5: Check if all required files exist
console.log('\n5. Checking project files...');
const requiredFiles = [
    'src/lib/linkedin-scraper.ts',
    'src/lib/job-processor.ts',
    'src/lib/supabase.ts',
    'src/app/api/start-scraping/route.ts',
    'src/components/JobScraper/page.tsx',
    'src/components/preferences/page.tsx'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - Missing`);
        allFilesExist = false;
    }
});

if (!allFilesExist) {
    console.log('\n❌ Some required files are missing');
    process.exit(1);
}

// Test 6: Check if Next.js can build
console.log('\n6. Testing Next.js build...');
try {
    console.log('Running: npm run build');
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Next.js build successful');
} catch (error) {
    console.log('❌ Next.js build failed');
    console.log('Check for TypeScript errors or missing dependencies');
}

console.log('\n🎉 Setup test completed!');
console.log('\nNext steps:');
console.log('1. Set up your Supabase database using database-setup.sql');
console.log('2. Configure your .env.local file');
console.log('3. Run: npm run dev');
console.log('4. Open http://localhost:3000');
console.log('5. Test the job scraping functionality'); 