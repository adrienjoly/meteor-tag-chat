Fiber = Npm.require('fibers');

var WORKER_INTERVAL = 10 * 1000;

var PENDING_NOTIF_DELAY = 2 * 60 * 60 * 1000; // wait 2 hours before sending an email

var NOTIF_MSG = "Open http://discuthing.meteor.com to check them out and keep the conversation going!";

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
    var twoHoursAgo = new Date().getTime() - PENDING_NOTIF_DELAY;
    var notifs = Notifs.find({sent: {$exists: false}, time: {$lt: twoHoursAgo}}).fetch();
    if (!notifs.length)
      return;
    console.log("[emailNotifier] pending notifications:", notifs.length);
    var perRecipient = groupNotifsByRecipient(notifs);
    for (var uId in perRecipient) {
      var emailAddr = Meteor.users.findOne(uId).emails[0].address;
      console.log("[emailNotifier]", perRecipient[uId], "-> sending to", emailAddr);
      sendEmail(emailAddr, "You received new chat replies", NOTIF_MSG);
      Notifs.update({to: uId, time: {$lt: twoHoursAgo}}, {$set: {sent: true}}, {multi: true});
    }
  }).run();
}

Meteor.startup(function () {
  setInterval(checkNotifs, WORKER_INTERVAL);
});
