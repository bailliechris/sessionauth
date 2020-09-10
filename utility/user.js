//Create User JSON object
const username = process.env.APP_USERNAME;
const password = process.env.APP_PASSWORD;
const username2 = process.env.APP_USERNAME2;
const password2 = process.env.APP_PASSWORD2;
const users = {};
users[username] = password;
users[username2] = password2;

module.exports = users;