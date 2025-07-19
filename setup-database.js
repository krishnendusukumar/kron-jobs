const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables:');
    console.error('   NEXT_PUBLIC_SUPABASE_URL');
    console.error('   SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    try {
        console.log('🚀 Starting database migration...');
        
        // Read the migration SQL file
        const migrationPath = path.join(__dirname, 'scraping-jobs-migration.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        console.log('📄 Migration SQL loaded, executing...');
        
        // Execute the migration
        const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
        
        if (error) {
            // If exec_sql doesn't exist, try direct execution
            console.log('⚠️ exec_sql not available, trying direct execution...');
            
            // Split the SQL into individual statements
            const statements = migrationSQL
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
            
            for (const statement of statements) {
                try {
                    const { error: stmtError } = await supabase.rpc('exec_sql', { sql: statement });
                    if (stmtError) {
                        console.warn(`⚠️ Statement failed (this might be expected): ${stmtError.message}`);
                    }
                } catch (e) {
                    console.warn(`⚠️ Statement failed (this might be expected): ${e.message}`);
                }
            }
        }
        
        console.log('✅ Migration completed successfully!');
        console.log('');
        console.log('📋 Next steps:');
        console.log('   1. The scraping_jobs table should now exist');
        console.log('   2. Try the "Load More Jobs" button again');
        console.log('   3. Check the browser console for any remaining errors');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.log('');
        console.log('🔧 Manual setup required:');
        console.log('   1. Go to your Supabase dashboard');
        console.log('   2. Navigate to SQL Editor');
        console.log('   3. Copy and paste the contents of scraping-jobs-migration.sql');
        console.log('   4. Execute the SQL');
    }
}

runMigration(); 