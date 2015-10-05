angular.module('ListMe', ['ionic', 'ListMe.controllers', 'ListMe.service'])


/**
 * The Projects factory handles saving and loading projects
 * from local storage, and also lets us save and load the
 * last active project index.
 */

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/projects.html",
    controller: 'TodoCtrl'
  })

  // the pet tab has its own child nav-view and history
    .state('app.active', {
      url: '/active',
      views: {
        'menuContent': {
          parent:'app',
          templateUrl: 'templates/active.html',
          // controller: 'TodoCtrl'
        }
      }
    })
    .state('app.complete', {
      url: '/complete',
      views: {
        'menuContent': {
          parent:'app',
          templateUrl: 'templates/taskcomplete.html',
          // controller: 'TodoCtrl'
        }
      }
    })

  //  .state('app.maps', {
  //    url: '/maps',
  //    views: {
  //      'menuContent': {
  //        templateUrl: 'templates/maps.html',
  //        controller: 'MapsCtrl'
  //      }
  //    }
  //  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/active');

});
