// Routing

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.route('/', function () {
  Session.set('selectedThread', null);
  this.render('home');
});

Router.route('/chatroom/:_id', function () {
  Session.set('selectedThread', this.params._id);
  this.render('home', {chatroomId: this.params._id});
  Meteor.call('clearNotifsFromUser', this.params._id);
  analytics.track('Open_thread');
});

Router.onAfterAction(function() {
  document.title = 'Chat - ' + (this.route.getName() || 'home');
});
