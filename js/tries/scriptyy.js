process.env.DEBUG = 'nightmare:log*'

var Nightmare = require('nightmare');
var nightmare = Nightmare({ show: true,
  electronPath : require('electron')});


nightmare
  .goto('https://www.santanderbank.com/us/personal/banking/digital-banking/online-banking-enrollment')
  .wait(5000)
  .evaluate(function () {
    return document.querySelector('title').innerText;
  })
  .end()
  .then(function (result) {
    console.log(result);
  })
  .catch(function (error) {
    console.error('Error:', error);
  });