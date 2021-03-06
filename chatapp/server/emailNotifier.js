Fiber = Npm.require('fibers');

var TESTING = false;

var WORKER_INTERVAL = 10 * 1000;

var PENDING_NOTIF_DELAY = TESTING ? 1000 : 2 * 60 * 60 * 1000; // wait 2 hours before sending an email

var URL = "http://discuthing.meteor.com";

//var REGEXP_EMAIL = /^[^@]+@[^@\.]+\.[^@]+$/;

function sendEmail(to, subject, text){
  Email.send({
    from: process.env.MAIL_FROM,
    to: to,
    subject: subject,
    text: text
  });
}

function renderChatroomLink(notif){
  return " - " + URL + "/chatroom/" + notif.from;
}

function renderEmail(grouped){
  return [ "Hi! You have new replies there:" ]
    .concat(grouped.map(renderChatroomLink))
    .concat("Check them out and keep the conversation going!")
    .join('\n');
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
      if (!TESTING)
        sendEmail(emailAddr, "You received new chat replies", renderEmail(perRecipient[uId]));
      else
        console.log("rendered:", renderEmail(perRecipient[uId]));
      Notifs.update({to: uId, time: {$lt: twoHoursAgo}}, {$set: {sent: true}}, {multi: true});
    }
  }).run();
}

Meteor.startup(function () {
  setInterval(checkNotifs, WORKER_INTERVAL);
});
