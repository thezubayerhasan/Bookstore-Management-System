import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');
  
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'boi_bookstore',
    port: process.env.DB_PORT || 3306,
  };

  console.log('📋 Database Configuration:');
  console.log(`   Host: ${config.host}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   Port: ${config.port}\n`);

  try {
    // Create connection
    const connection = await mysql.createConnection(config);
    console.log('✅ Database connection established successfully!\n');

    // Test query to verify connection
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('✅ Test query executed successfully');
    console.log(`   Result: ${rows[0].result}\n`);

    // Check database existence
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => Object.values(db)[0] === config.database);
    
    if (dbExists) {
      console.log(`✅ Database '${config.database}' exists\n`);
      
      // Get table list
      const [tables] = await connection.execute('SHOW TABLES');
      if (tables.length > 0) {
        console.log('📊 Tables in database:');
        tables.forEach(table => {
          console.log(`   - ${Object.values(table)[0]}`);
        });
      } else {
        console.log('⚠️  No tables found in database');
      }
    } else {
      console.log(`❌ Database '${config.database}' does not exist`);
    }

    // Close connection
    await connection.end();
    console.log('\n✅ Connection closed gracefully');
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed!\n');
    console.error('Error details:');
    console.error(`   Code: ${error.code}`);
    console.error(`   Message: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Possible solutions:');
      console.error('   - Check if MySQL server is running');
      console.error('   - Verify the port number is correct');
      console.error('   - Check firewall settings');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Possible solutions:');
      console.error('   - Check username and password in .env file');
      console.error('   - Verify user has proper permissions');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Possible solutions:');
      console.error('   - Create the database first');
      console.error(`   - Run: CREATE DATABASE ${config.database};`);
    }
    
    return false;
  }
}

testDatabaseConnection();
