// Run this script to apply database migrations
// Usage: node scripts/migrate.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function runMigration() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase environment variables');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Running database migration...');

    try {
        // Add new columns to users table
        const { error } = await supabase.rpc('run_sql', {
            query: `
        ALTER TABLE public.users 
        ADD COLUMN IF NOT EXISTS domain TEXT,
        ADD COLUMN IF NOT EXISTS location TEXT,
        ADD COLUMN IF NOT EXISTS profile_photo TEXT;
      `
        });

        if (error) {
            console.error('Migration failed:', error);
            process.exit(1);
        }

        console.log('✅ Migration completed successfully!');
        console.log('Added columns: domain, location, profile_photo to users table');

    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
}

runMigration();