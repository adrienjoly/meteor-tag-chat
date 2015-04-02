// Models

Meteor.subscribe("myMessages");
Meteor.subscribe("myNotifs");
Meteor.subscribe("userData");

// Common functions

function drawDiscushapes(){
  $(".discushape.new").each(function(i, discushape){
    var $discushape = $(discushape);
    var tags = $discushape.attr("data-tags");
    if (window.drawTagsInCanvas)
      drawTagsInCanvas($discushape.attr("data-tags").split(" "), $('<canvas>').prependTo($discushape)[0]);
    else
      $(discushape).text(tags);
    $discushape.removeClass("new");
  });
}

Template.disculink.helpers({
  cleanTags: function(){
    return (this.tags || []).join(", ");
  },
  threadNotifs: function(){
    return Notifs.find({ from: this._id, to: Meteor.userId() });
  },
  isSelected: function(){
    return this._id === Session.get('selectedThread');
  }
});

function openChatRoom(id){
  $("body").addClass("chatting");
  Session.set("selectedThread", id);
  Meteor.call('clearNotifsFromUser', id);
}

//Template.discushape.rendered = drawDiscushapes;
Template.disculink.rendered = drawDiscushapes;

// Home page

Template.home.helpers({
  selectedThread: function() {
    return Session.get('selectedThread');
  },
  mytagsStr: function() {
    return ((Meteor.user() || {}).tags || []).join(", ");
  },
  chatrooms: function() {
    return Meteor.users.find({_id: {"$not": Meteor.userId()}}); //[ {_id:"abc", name:"coucou"} ];
  }
});

Template.home.events = {
  'click .discushape': function(event){
    event.preventDefault();
    openChatRoom($(event.currentTarget).attr("data-uid"));
  },
  'submit #mytagsForm' : function (event) {
    event.preventDefault();
    Meteor.users.update(Meteor.userId(), { $set: {
      tags: document.getElementById("mytags").value.trim().toLowerCase().split(/[ ,]+/)
    }});
    // Prevent default form submit
    return false;
  }
};

Template.home.rendered = function(){
  if (!/localhost\:/.test(window.location.href))
    GAnalytics.pageview();
  else
    console.log("not using google analytics in dev mode");
};

// Chat room page

Template.chatroom.helpers({
  /*
  params: function(){
    return Router.current().params;
  },
  */
  otherUser: function(){
    return Meteor.users.findOne(/*Router.current().params._id*/ Session.get("selectedThread"));
  },
  messages: function() {
    var otherUserId = Session.get("selectedThread"); //Router.current().params._id;
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
          to: Session.get("selectedThread"), //Router.current().params._id,
          message: message.value,
          time: Date.now(),
        });
        message.value = '';
      }
    }
  }
};
