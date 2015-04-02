// Routing

Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading'
});

Router.map(function () {
  this.route('home', { path: '/' });
//this.route('chatroom', { path: '/chatroom/:_id' });
});

Router.onAfterAction(function() {
  document.title = 'Chat - ' + this.route.getName();
});
