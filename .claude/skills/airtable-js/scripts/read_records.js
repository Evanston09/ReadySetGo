#!/usr/bin/env node

/**
 * Read records from an Airtable base
 *
 * Usage:
 *   node read_records.js <tableName> [options]
 *
 * Options:
 *   --base <baseId>          Base ID (or use AIRTABLE_BASE_ID env var)
 *   --api-key <key>          API key (or use AIRTABLE_API_KEY env var)
 *   --filter <formula>       Filter formula (e.g., "{Status} = 'Active'")
 *   --max <number>           Maximum records to fetch
 *   --view <viewName>        View name to use
 *   --fields <field1,field2> Specific fields to retrieve (comma-separated)
 *   --sort <field:direction> Sort field and direction (e.g., "Name:asc")
 *   --json                   Output as JSON
 */

const Airtable = require('airtable');

// Parse command line arguments
const args = process.argv.slice(2);
const tableName = args[0];

if (!tableName) {
    console.error('Error: Table name is required');
    console.error('Usage: node read_records.js <tableName> [options]');
    process.exit(1);
}

// Parse options
const options = {};
for (let i = 1; i < args.length; i++) {
    switch (args[i]) {
        case '--base':
            options.baseId = args[++i];
            break;
        case '--api-key':
            options.apiKey = args[++i];
            break;
        case '--filter':
            options.filterByFormula = args[++i];
            break;
        case '--max':
            options.maxRecords = parseInt(args[++i]);
            break;
        case '--view':
            options.view = args[++i];
            break;
        case '--fields':
            options.fields = args[++i].split(',');
            break;
        case '--sort':
            const [field, direction] = args[++i].split(':');
            options.sort = [{ field, direction: direction || 'asc' }];
            break;
        case '--json':
            options.outputJson = true;
            break;
    }
}

// Configure Airtable
const apiKey = options.apiKey || process.env.AIRTABLE_API_KEY;
const baseId = options.baseId || process.env.AIRTABLE_BASE_ID;

if (!apiKey) {
    console.error('Error: API key is required (use --api-key or set AIRTABLE_API_KEY)');
    process.exit(1);
}

if (!baseId) {
    console.error('Error: Base ID is required (use --base or set AIRTABLE_BASE_ID)');
    process.exit(1);
}

Airtable.configure({ apiKey });
const base = Airtable.base(baseId);

// Build select options
const selectOptions = {};
if (options.filterByFormula) selectOptions.filterByFormula = options.filterByFormula;
if (options.maxRecords) selectOptions.maxRecords = options.maxRecords;
if (options.view) selectOptions.view = options.view;
if (options.fields) selectOptions.fields = options.fields;
if (options.sort) selectOptions.sort = options.sort;

// Fetch records
async function fetchRecords() {
    try {
        const records = await base(tableName).select(selectOptions).all();

        if (options.outputJson) {
            const output = records.map(record => ({
                id: record.id,
                fields: record.fields
            }));
            console.log(JSON.stringify(output, null, 2));
        } else {
            console.log(`Found ${records.length} records in '${tableName}':\n`);
            records.forEach((record, index) => {
                console.log(`Record ${index + 1} (ID: ${record.id}):`);
                Object.entries(record.fields).forEach(([key, value]) => {
                    console.log(`  ${key}: ${JSON.stringify(value)}`);
                });
                console.log('');
            });
        }
    } catch (error) {
        console.error('Error fetching records:', error.message);
        if (error.statusCode) {
            console.error(`Status code: ${error.statusCode}`);
        }
        process.exit(1);
    }
}

fetchRecords();
