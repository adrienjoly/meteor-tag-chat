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

// Tag selector

Template.tagsSelector.rendered = function () {
  Meteor.typeahead.inject();
};

Template.tagsSelector.helpers({
  myTags: function() {
    return ((Meteor.user() || {}).tags || []).map(function(tag){
      return {name: tag};
    });
  },
  opened: function(){
    $("#new-tag").attr("placeholder", "");
  },
  selected: function(event){
    $(event.currentTarget).closest('form').submit();
  },
  closed: function(){
    $("#new-tag").attr("placeholder", "What are you about?");
  },
  tagsTypeAhead: function(){
    var tagsCount = {};
    Meteor.users.find().fetch().map(function(user){
      for (var i in user.tags) {
        var tagName = user.tags[i];
        if (tagName)
          tagsCount[tagName] = (tagsCount[tagName] || 0) + 1;
      }
    });
    var tagsArray = [];
    for (var name in tagsCount)
      tagsArray.push({name: name, count: tagsCount[name]});
    return tagsArray.sort(function(a, b){
      return b.count - a.count;
    });
  },
});

Template.tagsSelector.events({
  'click .my-tag-list__item': function(event){
    var tag = this.name;
    console.log("removing tag:", tag);
    Meteor.call("removeTag", tag);
    analytics.track("Set_tags");
  },
  'keyup #new-tag': function(event){
    var valid = isValidTag(event.currentTarget.value);
    $(event.currentTarget).toggleClass('invalid', !valid);
    if (valid && event.keyCode == 13) {
      $(event.currentTarget).closest('form').submit();
    }
  },
  'submit form' : function (event) {
    event.preventDefault();
    var tag = $("#new-tag").val();
    console.log("adding tag:", tag);
    Meteor.call("addTag", tag);
    $('.typeahead').typeahead('val', '');
    analytics.track("Set_tags");
    return false;
  }
});

// Home page

function chatroomsWithNotifs(withNotifs){
  return function(){
    function similarity(tags){
      return _.intersection(Meteor.user().tags, tags).length;
    }
    return Meteor.users.find({_id: {"$not": Meteor.userId()}}).fetch() // => [ {_id:"abc", name:"coucou"} ];
      .filter(function(user){
        return withNotifs === !!Notifs.find({ from: user._id, to: Meteor.userId() }).fetch().length;
      })
      .sort(function(userA, userB){
        return similarity(userB.tags) - similarity(userA.tags);
      });
  }
}

Template.home.helpers({
  selectedThread: function() {
    return Session.get('selectedThread');
  },
  activeChatrooms: chatroomsWithNotifs(true),
  otherChatrooms: chatroomsWithNotifs(false)
});

Template.home.events = {
  'click .login-link': function (event) {
    event.preventDefault();
    $('#login-sign-in-link').click();
    return false;
  },
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
