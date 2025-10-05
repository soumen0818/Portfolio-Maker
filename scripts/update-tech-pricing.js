require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function updateTechPricing() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase environment variables');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        console.log('Updating .tech domain pricing to ₹1...');

        // Update .tech domain pricing to ₹1
        const { data, error } = await supabase
            .from('domains')
            .update({
                price_usd: 1,
                renewal_price_usd: 1
            })
            .eq('tld', '.tech');

        if (error) {
            console.error('Error updating .tech domain pricing:', error);
            return;
        }

        console.log('✅ Successfully updated .tech domain pricing to ₹1');

        // Verify the update
        const { data: verifyData, error: verifyError } = await supabase
            .from('domains')
            .select('tld, price_usd, renewal_price_usd')
            .order('tld');

        if (verifyError) {
            console.error('Error verifying update:', verifyError);
            return;
        }

        console.log('\n📋 Current domain pricing:');
        verifyData.forEach(domain => {
            const symbol = domain.tld === '.tech' ? '🔥' : '💰';
            console.log(`${symbol} ${domain.tld}: ₹${domain.price_usd} (renewal: ₹${domain.renewal_price_usd})`);
        });

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

updateTechPricing();