Router.configure({ layoutTemplate: 'layout', loadingTemplate: 'loading' });

Router.map(function () {
  this.route('home', { path: '/' });
  this.route('chatroom', { path: '/chatroom/:_id' });
});

Router.onAfterAction(function() {
  document.title = 'Chat - ' + this.route.getName();
});

// Models

Meteor.subscribe("myMessages");

Meteor.subscribe("userData");

// Home page

Template.home.helpers({
  mytagsStr: function() {
    var user = Meteor.user();
    return (user.tags || []).join(", ") || "(" + user._id + ")";
  },
  chatrooms: function() {
    return Meteor.users.find({}); //[ {_id:"abc", name:"coucou"} ];
  }
});

Template.home.events = {
  'submit #mytagsForm' : function (event) {
    event.preventDefault();
    Meteor.users.update(Meteor.userId(), { $set: {
      tags: document.getElementById("mytags").value.trim().toLowerCase().split(/[ ,]+/)
    }});
    // Prevent default form submit
    return false;
  }
};

// Chat room page

Template.chatroom.helpers({
  params: function(){
    return Router.current().params;
  },
  messages: function() {
    return Messages.find({}, { sort: { time: -1}});
  }
});

Template.chatroom.events = {
  'keydown input#message' : function (event) {
    if (event.which == 13) { // 13 is the enter key event
      var uId = (Meteor.user() || {})._id;
      var message = document.getElementById('message');
      if (uId && message.value != '') {
        Messages.insert({
          uId: uId,
          message: message.value,
          time: Date.now(),
        });
        message.value = '';
      }
    }
  }
};
