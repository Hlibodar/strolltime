const TelegramBot = require('node-telegram-bot-api');
const moment = require('moment-timezone');
const db = require('./db');


const token = '';
const bot = new TelegramBot(token, { polling: true });
const { validateTime } = require('./utils');
const { startScheduler } = require('./scheduler');
let usersData = {};

// Запитуємо текст нагадування
bot.onText(/\/remind/, (msg) => {
  const chatId = msg.chat.id;
  console.log('Методи бота:', Object.keys(bot));

  bot.sendMessage(chatId, 'Введіть текст нагадування:');
  usersData[chatId] = { stage: 'text' };
});

// Обробляємо текст нагадування
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  if (usersData[chatId] && usersData[chatId].stage === 'text') {
    usersData[chatId].reminderText = msg.text;
    console.log('Методи бота:', Object.keys(bot));

    bot.sendMessage(chatId, 'Введіть час нагадування (формат HH:mm):');
    usersData[chatId].stage = 'time';
  } else if (usersData[chatId] && usersData[chatId].stage === 'time') {
    if (validateTime(msg.text)) {
      usersData[chatId].reminderTime = msg.text;
      console.log('Методи бота:', Object.keys(bot));

      bot.sendMessage(chatId, 'Введіть ваш часовий пояс (наприклад, Europe/Kiev):');
      usersData[chatId].stage = 'timezone';
    } else {
      console.log('Методи бота:', Object.keys(bot));

      bot.sendMessage(chatId, 'Неправильний формат часу! Спробуйте ще раз.');
    }
  } else if (usersData[chatId] && usersData[chatId].stage === 'timezone') {
    const timezone = msg.text;
    if (moment.tz.zone(timezone)) {
      usersData[chatId].timezone = timezone;
      console.log('Методи бота:', Object.keys(bot));

      bot.sendMessage(chatId, 'Введіть час для повідомлення перед нагадуванням (формат HH:mm):');
      usersData[chatId].stage = 'notify';
    } else {
      console.log('Методи бота:', Object.keys(bot));

      bot.sendMessage(chatId, 'Неправильний часовий пояс! Спробуйте ще раз.');
    }
  } else if (usersData[chatId] && usersData[chatId].stage === 'notify') {
    if (validateTime(msg.text)) {
      const { reminderText, reminderTime, timezone } = usersData[chatId];
      const currentDate = moment().format('YYYY-MM-DD');
      const fullReminderTime = ${currentDate} ${reminderTime};
      const reminderTimeWithZone = moment.tz(fullReminderTime, timezone).format();
      const notifyTimeWithZone = moment.tz(${currentDate} ${msg.text}, timezone).format();

      db.addReminder(chatId, reminderText, reminderTimeWithZone, timezone, notifyTimeWithZone);
      console.log('Методи бота:', Object.keys(bot));

      bot.sendMessage(chatId, Нагадування створено!);
      usersData[chatId] = null;

      startScheduler();
    } else {
      bot.sendMessage(chatId, 'Неправильний формат часу для нагадування! Спробуйте ще раз.');
    }
  }
});
// Простий тест у bot.js
bot.onText(/\/test/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Бот працює!');
});
module.exports = bot; // Експортуємо екземпляр бота
