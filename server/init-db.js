require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function createAndInit() {
  const rootPool = new Pool({
    connectionString: 'postgresql://postgres:root@localhost:5432/postgres',
  });
  
  try {
    console.log('Creating database scanvista...');
    await rootPool.query('CREATE DATABASE scanvista;');
    console.log('Database created.');
  } catch (error) {
    if (error.code === '42P04') {
      console.log('Database scanvista already exists.');
    } else {
      console.error('Error creating database:', error);
    }
  } finally {
    await rootPool.end();
  }

  const appPool = new Pool({
    connectionString: 'postgresql://postgres:root@localhost:5432/scanvista',
  });
  
  try {
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing schema...');
    await appPool.query(schema);
    console.log('Schema applied successfully!');
  } catch (error) {
    console.error('Failed to apply schema:', error);
  } finally {
    await appPool.end();
  }
}

createAndInit();
