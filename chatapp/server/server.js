// client-side data access security

function warnAndDeny(col, op){
  return function (userId) {
    console.log("warning: user", userId, "requests", col, op, "operation:", arguments);
    return true;
  }
}

function allOps(col){
  return {
    remove: warnAndDeny(col, "remove"),
    insert: warnAndDeny(col, "insert"),
    update: warnAndDeny(col, "update"),
  };
}

Meteor.users.deny(allOps("Users"));
Messages.deny(allOps("Messages"));
Notifs.deny(allOps("Notifs"));

// collections published for clients

Meteor.publish("myMessages", function() {
  return Messages.find({$or: [{to: this.userId}, {uId: this.userId}]});
});

Meteor.publish("myNotifs", function() {
  return Notifs.find({to: this.userId}, { fields: { to:1, from: 1 }});
});

Meteor.publish("userData", function() {
  return Meteor.users.find({}, { fields: { tags: 1 }});
});

// API

Meteor.methods({
  message: function(msg){
    if (this.userId && msg.uId === this.userId && msg.to && msg.message) {
      msg.time = Date.now();
      Notifs.insert({ to: msg.to, from: msg.uId, time: msg.time });
      return Messages.insert(msg);
    }
    else
      return false;
  },
  addTag: function(tag){
    console.log("adding user tag", this.userId, tag)
    return this.userId && Meteor.users.update({_id: this.userId}, {$addToSet: {tags: tag}});
  },
  removeTag: function(tag){
    console.log("removing user tag", this.userId, tag)
    return this.userId && Meteor.users.update({_id: this.userId}, {$pull: {tags: tag}});
  },
  setTags: function(tags){
    console.log("setting user tags", this.userId, tags)
    return this.userId && Meteor.users.update({_id: this.userId}, {$set:{tags: tags}});
  },
  clearNotifsFromUser: function(uId) {
    return this.userId && uId && Notifs.remove({to: this.userId, from: uId});
  }
});
