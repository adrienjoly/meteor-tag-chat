// Routing

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

// Common functions

function drawDiscushapes(){
  $(".discushape.new").each(function(i, discushape){
    var $discushape = $(discushape);
    var tags = $discushape.attr("data-tags");
    if (window.drawTagsInCanvas)
      drawTagsInCanvas($discushape.attr("data-tags").split(" "), $('<canvas>').appendTo($discushape)[0]);
    else
      $(discushape).text(tags);
    $discushape.removeClass("new");
  });
}

Template.discushape.rendered = drawDiscushapes;
Template.disculink.rendered = drawDiscushapes;

// Home page

Template.home.helpers({
  mytagsStr: function() {
    return (Meteor.user().tags || []).join(", ");
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
  otherUser: function(){
    return Meteor.users.findOne(Router.current().params._id);
  },
  messages: function() {
    var otherUserId = Router.current().params._id;
    return Messages.find({$or: [
      { uId: Meteor.user()._id, to: otherUserId },
      { uId: otherUserId, to: Meteor.user()._id }
    ]}, {sort: {time: -1}});
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
          to: Router.current().params._id,
          message: message.value,
          time: Date.now(),
        });
        message.value = '';
      }
    }
  }
};
