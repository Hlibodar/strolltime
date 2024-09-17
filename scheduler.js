const cron = require('node-cron');
const moment = require('moment-timezone');
const db = require('./db');
//const bot = require('./bot'); // Імпортуємо екземпляр бота
//console.log('Тип змінної bot:', typeof bot);
const TelegramBot = require('node-telegram-bot-api');
const token = '';
const bot = new TelegramBot(token, { polling: false });



function startScheduler() {
  cron.schedule('* * * * *', () => {
    const now = moment().utc(); // Поточний час у форматі UTC
    db.getAllReminders((reminders) => {
      console.log('Поточний час:', now.format());
      console.log('Отримані нагадування:', reminders);

      reminders.forEach(reminder => {
        const reminderTime = moment(reminder.reminder_time).tz(reminder.timezone);
        const notifyTime = moment(reminder.notify_time).tz(reminder.timezone);

        console.log('Час нагадування:', reminderTime.format());
        console.log('Час для повідомлення:', notifyTime.format());

        if (now.isSameOrAfter(notifyTime) && now.isBefore(reminderTime)) {
          console.log('Надсилаємо нагадування користувачу:', reminder.user_id);
          bot.sendMessage(reminder.user_id, 🔔 Нагадування: ${reminder.reminder_text});
        }
      });
    });
  });
}


module.exports = {
  startScheduler
};
