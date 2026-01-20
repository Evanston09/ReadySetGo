# Airtable.js Guide

## Table of Contents
- [Installation & Setup](#installation--setup)
- [Authentication](#authentication)
- [Reading Records](#reading-records)
- [Filtering & Sorting](#filtering--sorting)
- [Common Patterns](#common-patterns)
- [Error Handling](#error-handling)

## Installation & Setup

```bash
npm install airtable
```

## Authentication

Airtable requires an API key and base ID:

```javascript
const Airtable = require('airtable');

// Configure with API key
Airtable.configure({
    apiKey: 'YOUR_API_KEY'
});

const base = Airtable.base('YOUR_BASE_ID');
```

**Environment variables (recommended):**
```javascript
const Airtable = require('airtable');
Airtable.configure({
    apiKey: process.env.AIRTABLE_API_KEY
});
const base = Airtable.base(process.env.AIRTABLE_BASE_ID);
```

## Reading Records

### Basic select

```javascript
base('TableName').select({
    maxRecords: 10,
    view: "Grid view"
}).eachPage(function page(records, fetchNextPage) {
    records.forEach(function(record) {
        console.log('Retrieved', record.get('FieldName'));
    });
    fetchNextPage();
}, function done(err) {
    if (err) { console.error(err); return; }
});
```

### Get all records (Promise-based)

```javascript
base('TableName').select().all()
    .then(records => {
        records.forEach(record => {
            console.log(record.id, record.fields);
        });
    })
    .catch(err => console.error(err));
```

### Get single record by ID

```javascript
base('TableName').find('recXXXXXXXXXXXXXX')
    .then(record => {
        console.log('Retrieved', record.id);
        console.log(record.fields);
    })
    .catch(err => console.error(err));
```

## Filtering & Sorting

### Filter with formula

```javascript
base('TableName').select({
    filterByFormula: "{Status} = 'Active'",
    sort: [{field: "Name", direction: "asc"}]
}).all()
    .then(records => {
        console.log(`Found ${records.length} active records`);
    });
```

### Multiple conditions

```javascript
base('TableName').select({
    filterByFormula: "AND({Status} = 'Active', {Priority} = 'High')",
    maxRecords: 20
}).all();
```

### Common formula patterns

- **Equals:** `{FieldName} = 'Value'`
- **Contains:** `FIND('text', {FieldName})`
- **Greater than:** `{Number} > 100`
- **Date range:** `AND(IS_AFTER({Date}, '2024-01-01'), IS_BEFORE({Date}, '2024-12-31'))`
- **OR condition:** `OR({Status} = 'Active', {Status} = 'Pending')`
- **NOT condition:** `NOT({Status} = 'Archived')`

## Common Patterns

### Accessing field values

```javascript
const record = await base('TableName').find('recXXXXXXXXXXXXXX');

// Get field value
const name = record.get('Name');
const email = record.fields['Email'];

// Get record ID
const id = record.id;

// Get all fields
const allFields = record.fields;
```

### Pagination with eachPage

```javascript
base('TableName').select({
    pageSize: 100,  // Max 100 records per page
    view: "Grid view"
}).eachPage(
    function page(records, fetchNextPage) {
        // Process each page
        records.forEach(record => {
            console.log(record.get('Name'));
        });

        // Fetch next page
        fetchNextPage();
    },
    function done(err) {
        if (err) {
            console.error(err);
            return;
        }
        console.log('All records processed');
    }
);
```

### Async/await pattern

```javascript
async function fetchRecords() {
    try {
        const records = await base('TableName').select({
            filterByFormula: "{Status} = 'Active'",
            sort: [{field: "Created", direction: "desc"}]
        }).all();

        return records.map(record => ({
            id: record.id,
            name: record.get('Name'),
            status: record.get('Status')
        }));
    } catch (error) {
        console.error('Error fetching records:', error);
        throw error;
    }
}
```

### Working with linked records

```javascript
const record = await base('Projects').find('recXXXXXXXXXXXXXX');

// Linked records return as array of record IDs
const teamMemberIds = record.get('Team Members'); // ['recYYY', 'recZZZ']

// Fetch linked records
const teamMembers = await Promise.all(
    teamMemberIds.map(id => base('People').find(id))
);
```

## Error Handling

### Common errors

```javascript
try {
    const records = await base('TableName').select().all();
} catch (error) {
    if (error.statusCode === 401) {
        console.error('Authentication failed - check API key');
    } else if (error.statusCode === 404) {
        console.error('Base or table not found');
    } else if (error.statusCode === 422) {
        console.error('Invalid request - check field names/formula');
    } else {
        console.error('Airtable error:', error.message);
    }
}
```

### Rate limiting

Airtable has rate limits (5 requests per second per base). Use delays for bulk operations:

```javascript
async function fetchWithDelay(tableNames) {
    const results = [];
    for (const tableName of tableNames) {
        const records = await base(tableName).select().all();
        results.push({ table: tableName, records });
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay
    }
    return results;
}
```

## Field Types

Common field types and how to access them:

- **Single line text / Long text:** `record.get('FieldName')` → string
- **Number:** `record.get('FieldName')` → number
- **Checkbox:** `record.get('FieldName')` → boolean
- **Single select:** `record.get('FieldName')` → string
- **Multiple select:** `record.get('FieldName')` → array of strings
- **Date:** `record.get('FieldName')` → string (ISO 8601 format)
- **Attachments:** `record.get('FieldName')` → array of objects with url, filename, etc.
- **Linked records:** `record.get('FieldName')` → array of record IDs
- **Formula / Rollup:** Depends on output type
