Messages = new Meteor.Collection('messages');
Notifs = new Meteor.Collection('notifs');

Messages.helpers({
  name: function(){
    return this.uId == Meteor.user()._id ? "me" : "him";
  }
});
