---
name: airtable-js
description: Read and query records from Airtable bases using the Airtable.js library. Use when working with Airtable data, including fetching records, filtering with formulas, sorting, pagination, and accessing field values. Triggers when users need to retrieve or query Airtable data, integrate Airtable into applications, or work with Airtable's API.
---

# Airtable.js

## Overview

Work with Airtable bases to read, query, and process records using the official Airtable.js library. This skill provides patterns for common operations like filtering, sorting, pagination, and handling different field types.

## Quick Start

Basic record retrieval:

```javascript
const Airtable = require('airtable');

Airtable.configure({
    apiKey: process.env.AIRTABLE_API_KEY
});

const base = Airtable.base(process.env.AIRTABLE_BASE_ID);

// Fetch all records
const records = await base('TableName').select().all();
records.forEach(record => {
    console.log(record.id, record.fields);
});
```

## Common Operations

### Read all records from a table

```javascript
const records = await base('Projects').select().all();
```

### Filter records with formula

```javascript
const activeRecords = await base('Tasks').select({
    filterByFormula: "{Status} = 'Active'"
}).all();
```

### Sort and limit results

```javascript
const recentTasks = await base('Tasks').select({
    sort: [{field: "Created", direction: "desc"}],
    maxRecords: 10
}).all();
```

### Get specific fields only

```javascript
const records = await base('Contacts').select({
    fields: ['Name', 'Email', 'Phone']
}).all();
```

### Pagination with large datasets

```javascript
base('LargeTable').select({
    pageSize: 100
}).eachPage(
    function page(records, fetchNextPage) {
        records.forEach(record => {
            console.log(record.get('Name'));
        });
        fetchNextPage();
    },
    function done(err) {
        if (err) console.error(err);
    }
);
```

## Accessing Field Values

```javascript
const record = await base('Projects').find('recXXXXXXXXXXXXXX');

// Two ways to access fields
const name = record.get('Project Name');
const status = record.fields['Status'];

// Get record ID
const id = record.id;

// Get all fields
const allFields = record.fields;
```

## Scripts

### read_records.js

Command-line utility for reading Airtable records with filtering and sorting options.

```bash
# Basic usage
node scripts/read_records.js "TableName"

# With filters
node scripts/read_records.js "Tasks" --filter "{Status} = 'Active'"

# Sort and limit
node scripts/read_records.js "Projects" --sort "Created:desc" --max 10

# JSON output
node scripts/read_records.js "Contacts" --json

# Specific fields
node scripts/read_records.js "People" --fields "Name,Email,Phone"
```

Set environment variables `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID`, or pass via `--api-key` and `--base` options.

## References

### airtable_guide.md

Comprehensive reference covering:
- Authentication and setup
- All read operations with examples
- Filtering formulas and patterns
- Field type handling
- Error handling and rate limiting
- Working with linked records

Read this reference when implementing complex queries, working with specific field types, or troubleshooting issues.
