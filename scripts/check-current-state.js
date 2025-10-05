require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkCurrentDatabaseState() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔍 Checking current database state...');

    try {
        // Check domains table structure and data
        const { data: domains, error } = await supabase
            .from('domains')
            .select('*');

        if (error) {
            console.error('❌ Error fetching domains:', error);
            return;
        }

        console.log('\n📊 Current domains table data:');
        console.table(domains);

        console.log('\n🏗️  Table structure analysis:');
        if (domains && domains.length > 0) {
            console.log('Available columns:', Object.keys(domains[0]));

            // Check if we have USD or INR columns
            const hasUSD = domains[0].hasOwnProperty('price_usd');
            const hasINR = domains[0].hasOwnProperty('price_inr');

            console.log('Has USD columns:', hasUSD);
            console.log('Has INR columns:', hasINR);
        }

        // Check current pricing
        console.log('\n💰 Current pricing summary:');
        if (domains) {
            domains.forEach(domain => {
                const priceCol = domain.price_usd || domain.price_inr || domain.price;
                console.log(`${domain.tld}: ${priceCol} (${domain.price_usd ? 'USD' : domain.price_inr ? 'INR' : 'Unknown currency'})`);
            });
        }

    } catch (error) {
        console.error('❌ Database check error:', error);
    }
}

checkCurrentDatabaseState();