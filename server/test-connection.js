import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('🔍 Testing MySQL connection to PopSQL database...\n');
  
  const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT),
  };

  console.log('Configuration:');
  console.log(JSON.stringify(config, null, 2));
  console.log('\n');

  try {
    console.log('Attempting to connect...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Connected successfully!\n');
    
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('✅ Test query successful:', rows[0]);
    
    await connection.end();
    console.log('✅ Connection closed\n');
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('\nFull error:', error);
  }
}

testConnection();
