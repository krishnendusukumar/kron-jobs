#!/bin/bash

# PingJobs Quick Start Script
echo "🚀 PingJobs Quick Start"
echo "========================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) - OK"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install scraping dependencies
echo "📦 Installing scraping dependencies..."
npm install axios cheerio node-cron

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found"
    echo "Please create .env.local with your Supabase credentials:"
    echo ""
    echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here"
    echo ""
    echo "You can get these from your Supabase project settings."
else
    echo "✅ .env.local file found"
fi

# Check if database setup file exists
if [ -f "database-setup.sql" ]; then
    echo "✅ Database setup file found"
    echo "📋 Remember to run the SQL in your Supabase SQL Editor"
else
    echo "❌ database-setup.sql not found"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set up your Supabase database using database-setup.sql"
echo "2. Configure your .env.local file with Supabase credentials"
echo "3. Run: npm run dev"
echo "4. Open http://localhost:3000"
echo "5. Test the job scraping functionality"
echo ""
echo "For detailed instructions, see SETUP_GUIDE.md" 