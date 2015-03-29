Meteor.publish("myMessages", function() {
  return Messages.find({$or: [{to: this.userId}, {uId: this.userId}]});
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
