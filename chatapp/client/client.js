Router.map(function () {
  this.route('home', {
    path: '/' // match the root path
  });
});

// Templates

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
