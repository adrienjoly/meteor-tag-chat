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
  chatrooms: function() {
    return Meteor.users.find({}); //[ {_id:"abc", name:"coucou"} ];
  }
});

// Chat room page

Template.chatroom.params = function(){
    return Router.current().params;
};

Template.chatroom.helpers({
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
