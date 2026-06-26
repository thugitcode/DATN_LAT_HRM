require('dotenv').config();
const db = require('./config/db');
async function check() {
  const [tables] = await db.query(`SHOW TABLES`);
  const key = Object.keys(tables[0])[0];
  const allTables = tables.map(t => t[key]);
  console.log(`Tổng: ${allTables.length} bảng\n`);
  allTables.forEach(t => console.log(t));
  process.exit(0);
}
check().catch(e => { console.error(e.message); process.exit(1); });