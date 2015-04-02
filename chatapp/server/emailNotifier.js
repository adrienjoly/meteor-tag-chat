Fiber = Npm.require('fibers');

var WORKER_INTERVAL = 10 * 1000;

//var REGEXP_EMAIL = /^[^@]+@[^@\.]+\.[^@]+$/;

function sendEmail(to, subject, text){
  Email.send({
    from: process.env.MAIL_FROM,
    to: to,
    subject: subject,
    text: text
  });
}

function groupNotifsByRecipient(notifs){
  var grouped = {};
  for (var i in notifs)
    (grouped[notifs[i].to] = grouped[notifs[i].to] || []).push(notifs[i]);
  return grouped;
}

function checkNotifs(){
  Fiber(function () {
    var now = new Date().getTime();
    var twoHoursAgo = now - 2 * 60 * 60 * 1000;
    var notifs = Notifs.find({time: {$lt: twoHoursAgo}}).fetch();
    if (!notifs.length)
      return;
    //console.log(notifs.map(function(a){return now - a.time}));
    var perRecipient = groupNotifsByRecipient(notifs);
    for (var uId in perRecipient) {
      var emailAddr = Meteor.users.findOne(uId).emails[0].address;
      console.log("notifs:", perRecipient[uId], "-> sending to", emailAddr);
    }

  }).run();
}

Meteor.startup(function () {
  setInterval(checkNotifs, WORKER_INTERVAL);
});
