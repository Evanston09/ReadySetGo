
import 'dotenv/config'

// Check if token exists
if (!process.env.AIRTABLE_TOKEN) {
    console.error('AIRTABLE_TOKEN environment variable is not set!');
    process.exit(1);
}

console.log('Token found, making request...');

const response = await fetch('https://api.airtable.com/v0/meta/bases', {
    headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`
    }
});

console.log('Response status:', response.status);

const data = await response.json();
console.log('Full response:', JSON.stringify(data, null, 2));

if (data.bases) {
    console.log('\nBases:');
    data.bases.forEach((base: any) => {
        console.log(`  - ${base.name} (${base.id})`);
    });
} else {
    console.error('No bases found or error occurred');
} 
