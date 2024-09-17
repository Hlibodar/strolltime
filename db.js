const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:'); // Можна змінити на файл бази

// Створюємо таблицю нагадувань
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      reminder_text TEXT,
      reminder_time TEXT,
      timezone TEXT,
      notify_time TEXT
    )
  `);
});

// Функція для додавання нагадування
function addReminder(userId, reminderText, reminderTime, timezone, notifyTime) {
  const stmt = db.prepare(`
    INSERT INTO reminders (user_id, reminder_text, reminder_time, timezone, notify_time)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(userId, reminderText, reminderTime, timezone, notifyTime);
  stmt.finalize();
}

// Функція для отримання всіх нагадувань
function getAllReminders(callback) {
  db.all(`SELECT * FROM reminders`, (err, rows) => {
    if (err) throw err;
    callback(rows);
  });
}

module.exports = {
  addReminder,
  getAllReminders
};
