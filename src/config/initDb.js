async function initializeDatabase() {
  console.log('Using SQLite database: database.sqlite (Auto-created)');
  return Promise.resolve();
}

module.exports = initializeDatabase;
