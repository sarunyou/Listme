angular.module('todo', ['ionic'])

.config(function($stateProvider, $urlRouterProvider) {})
/**
 * The Projects factory handles saving and loading projects
 * from local storage, and also lets us save and load the
 * last active project index.
 */
.factory('Projects', function() {
  return {
    all: function() {
      var projectString = window.localStorage['projects'];
      if(projectString) {
        return angular.fromJson(projectString);
      }
      return [];
    },
    save: function(projects) {
      window.localStorage['projects'] = angular.toJson(projects);
    },
    newProject: function(projectTitle) {
      // Add a new project
      return {
        title: projectTitle,
        tasks: []
      };
    },
    getLastActiveIndex: function() {
      return parseInt(window.localStorage['lastActiveProject']) || 0;
    },
    setLastActiveIndex: function(index) {
      window.localStorage['lastActiveProject'] = index;
    }
  }
})

.controller('TodoCtrl', function($scope, $timeout, $ionicModal, Projects, $ionicSideMenuDelegate, $ionicPopup) {

  // A utility function for creating a new project
  // with the given projectTitle
  var createProject = function(projectTitle) {
    var newProject = Projects.newProject(projectTitle);
    $scope.projects.push(newProject);
    Projects.save($scope.projects);
    $scope.selectProject(newProject, $scope.projects.length-1);
  }
  $scope.removeProject = function(id) {
    if($scope.projects.length != 2){
      $scope.projects.splice(id,1);
      Projects.save($scope.projects);
      $scope.activeProject = $scope.projects[0];
      Projects.setLastActiveIndex($scope.projects.length-1);
    }

  };
  // Load or initialize projects
  $scope.projects = Projects.all();
  // Grab the last active, or the first project
  $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];
  $scope.activeProject.active =  true;
  $scope.showComplete = function () {
    $scope.activeProject.active =  false;
  }
  $scope.showActive = function () {
    $scope.activeProject.active =  true;
  }
  // Called to create a new project
  $scope.newProject = function() {
    var projectTitle = prompt('Project name');
    if(projectTitle) {
      createProject(projectTitle);
    }
  };


  // Called to select the given project
  $scope.selectProject = function(project, index) {
    $scope.activeProject = project;
    Projects.setLastActiveIndex(index);
    $ionicSideMenuDelegate.toggleLeft(false);
  };

  // Create our modal
  $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
    $scope.taskModal = modal;
  }, {
    scope: $scope
  });
  $scope.removeTask = function (id) {
    $scope.activeProject.tasks.splice(id,1);
    Projects.save($scope.projects);

  }
  $scope.createTask = function(task) {
    if(!$scope.activeProject || !task) {
      return;
    }
    $scope.activeProject.tasks.push({
      title: task.title,
      done: false
    });
    $scope.taskModal.hide();

    // Inefficient, but save all the projects
    Projects.save($scope.projects);
    $scope.activeProject.active = true;
    task.title = "";
  };

  $scope.newTask = function() {
    $scope.taskModal.show();
  };

  $scope.closeNewTask = function() {
    $scope.taskModal.hide();
  }
  $scope.clearTaskComplete = function() {
    // for (var i = 0; i < $scope.activeProject.tasks.length; i++) {
    //   if ( $scope.activeProject.tasks[i].done==true) {
    //     $scope.activeProject.tasks.splice(i,1);
    //     console.log(i);
    //   }
    // }
    $scope.activeProject.tasks = $scope.activeProject.tasks.filter(function (item) {
      return item.done == false;
    })
    Projects.save($scope.projects);

  }

  $scope.toggleProjects = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
  $scope.lengthActive = function(){
    var count = 0;
    for (var i = 0; i < $scope.activeProject.tasks.length; i++) {
      if ( $scope.activeProject.tasks[i].done==false) {
        count+=1;
      }
    }
    return count;
  };
  $scope.checkboxToggle = function (id) {
    if ($scope.activeProject.tasks[id].done == false){
      $scope.activeProject.tasks[id].done = true;
    }else{
      $scope.activeProject.tasks[id].done = false;
    }
    Projects.save($scope.projects);
  }
  // A confirm dialog
 $scope.showConfirm = function(id) {
   var confirmPopup = $ionicPopup.confirm({
     title: 'Cancel Task',
     template: 'Are you sure you want to cancel this task?'
   });
   confirmPopup.then(function(res,id) {
     if(res) {
       $scope.activeProject.tasks.splice(id,1);
       Projects.save($scope.projects);
       console.log('You are sure');
     } else {
       console.log('You are not sure');
     }
   });
 };
 $scope.showConfirmDeleteProject = function(id) {
   var confirmPopupDel = $ionicPopup.confirm({
     title: 'Delete Project',
     template: 'Are you sure you want to delete this project?'
   });
   confirmPopupDel.then(function(res,id) {
     if(res) {
       if($scope.projects.length != 2){
         $scope.projects.splice(id,1);
         Projects.save($scope.projects);
         $scope.activeProject = $scope.projects[0];
         Projects.setLastActiveIndex($scope.projects.length-1);
       }
       console.log('You are sure');
     } else {
       console.log('You are not sure');
     }
   });
 };
  // Try to create the first project, make sure to defer
  // this by using $timeout so everything is initialized
  // properly
  $timeout(function() {
    if($scope.projects.length == 0) {
      while(true) {
        var projectTitle = prompt('Your first project title:');
        if(projectTitle) {
          createProject(projectTitle);
          break;
        }
      }
    }
  });

});
