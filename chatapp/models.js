Messages = new Meteor.Collection('messages');

Messages.helpers({
  name: function(){
    return this.uId == Meteor.user()._id ? "me" : "him";
  }
});

Meteor.users.helpers({
  tagsOrId: function() {
    return (this.tags || []).join(", ") || "(" + this._id + ")";  ;
  }
});
