Router.configure({ layoutTemplate: 'layout', loadingTemplate: 'loading' });

Router.map(function () {
  this.route('welcome', { path: '/' });
  this.route('chatroom', { path: '/chatroom/:_id' });
});

// Templates

Template.welcome.helpers({
  chatrooms: function() {
    return [
      {_id:"abc", name:"coucou"}
    ];//Messages.find({}, { sort: { time: -1}});
  }
});

Template.chatroom.params = function(){
    return Router.current().params;
};

Template.messages.helpers({
  messages: function() {
    return Messages.find({}, { sort: { time: -1}});
  }
});

Template.input.events = {
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
