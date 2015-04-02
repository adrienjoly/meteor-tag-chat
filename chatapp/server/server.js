Meteor.publish("myMessages", function() {
  return Messages.find({$or: [{to: this.userId}, {uId: this.userId}]});
});

Meteor.publish("myNotifs", function() {
  return Notifs.find({to: this.userId}, { fields: { to:1, from: 1 }});
});

Meteor.publish("userData", function() {
  return Meteor.users.find({}, { fields: { tags: 1 }});
});

Meteor.users.allow({
  update: function (userId, user, fields, modifier) {
    // can only change your own documents
    if(user._id === userId)
    {
      Meteor.users.update({_id: userId}, modifier);
      return true;
    }
    else return false;
  }
});

Messages.allow({
  insert: function (userId, msg) {
    console.log("stroring message:", msg);
    if(msg.uId === userId) {
      var result = Messages.insert(msg);
      Notifs.insert({ to: msg.to, from: msg.uId });
      console.log("notifs: ", Notifs.find().fetch());
      return result;
    }
    else
      return false;
  }
});

Meteor.methods({
  clearNotifsFromUser: function(uId) {
    return Notifs.remove({to: this.userId, from: uId});
  }
});
