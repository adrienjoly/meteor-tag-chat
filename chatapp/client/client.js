// Models

Meteor.subscribe("myMessages");
Meteor.subscribe("myNotifs");
Meteor.subscribe("userData");

// Common functions

function drawDiscushapes(){
  var tags = this.data.tags;
  var $discushape = $(this.firstNode); //$(discushape);
  //$(".discushape.new").each(function(i, discushape){
  if ($discushape.hasClass("new")) {
    if (window.drawTagsInCanvas)
      drawTagsInCanvas(tags, $('<canvas>').prependTo($discushape)[0]);
    else
      $discushape.text(tags);
    $discushape.removeClass("new");
  }
  //});
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

//Template.discushape.rendered = drawDiscushapes;
Template.disculink.rendered = drawDiscushapes;

function initTagInput(){
  // cf http://stackoverflow.com/questions/21082628/using-bootstrap-tagsinput-plugin-in-meteor
  var $tags = $('#mytags').removeData('tagsinput');
  $(".bootstrap-tagsinput").remove();
  $tags.tagsinput();
}

Template.home.rendered = function () {
  $('#mytags')
    .on('itemAdded', function(event) {
      console.log('added tag:', event.item);
      $('#mytagsForm').submit();
    })
    .on('itemRemoved', function(event) {
      console.log('removed tag:', event.item);
      $('#mytagsForm').submit();
    });
}

// Home page

Template.home.helpers({
  selectedThread: function() {
    return Session.get('selectedThread');
  },
  mytagsStr: function() {
    setTimeout(initTagInput);
    return ((Meteor.user() || {}).tags || []).join(", ");
  },
  chatrooms: function() {
    return Meteor.users.find({_id: {"$not": Meteor.userId()}}); //[ {_id:"abc", name:"coucou"} ];
  }
});

Template.home.events = {
  'submit #mytagsForm' : function (event) {
    event.preventDefault();
    var tags = document.getElementById("mytags").value.trim().toLowerCase().split(/[ ,]+/);
    console.log("updating tags:", tags)
    Meteor.call("setTags", tags);
    analytics.track("Set_tags");
    return false;
  }
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
      { uId: Meteor.userId(), to: otherUserId },
      { uId: otherUserId, to: Meteor.userId() }
    ]}, {sort: {time: -1}});
  }
});

Template.chatroom.events = {
  'keydown input#message' : function (event) {
    if (event.which == 13) { // 13 is the enter key event
      var uId = Meteor.userId();
      var message = document.getElementById('message');
      if (uId && message.value != '') {
        Meteor.call("message", {
          uId: uId,
          to: Session.get("selectedThread"), //Router.current().params._id,
          message: message.value,
        });
        message.value = '';
        analytics.track("Send_message");
      }
    }
  }
};
