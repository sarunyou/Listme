angular.module('ListMe.controllers', ['ui.bootstrap.datetimepicker'])


/**
 * The Projects factory handles saving and loading projects
 * from local storage, and also lets us save and load the
 * last active project index.
 */


.controller('TodoCtrl', function($scope, $timeout, $ionicModal, Projects,
  $ionicSideMenuDelegate, $ionicPopup,$filter) {

  //map

  // A utility function for creating a new project
  // with the given projectTitle
  var createProject = function(projectTitle) {
    var newProject = Projects.newProject(projectTitle);
    $scope.projects.push(newProject);
    Projects.save($scope.projects);
    $scope.selectProject(newProject, $scope.projects.length - 1);
  }
  $scope.removeProject = function(id) {
    if ($scope.projects.length != 2) {
      $scope.projects.splice(id, 1);
      Projects.save($scope.projects);
      $scope.activeProject = $scope.projects[0];
      Projects.setLastActiveIndex($scope.projects.length - 1);
    }

  };
  // Load or initialize projects
  $scope.projects = Projects.all();
  $scope.editing = false;
  // Grab the last active, or the first project
  $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

  // edit text
    $scope.editItem = function () {
        $scope.editing = true;
    }

    $scope.doneEditing = function () {
        $scope.editing = false;
        //dong some background ajax calling for persistence...
    };
  // $scope.activeProject.active =  true;
  $scope.showComplete = function() {
    $scope.activeProject.active = false;
  }
  $scope.showActive = function() {
      $scope.activeProject.active = true;
    }
    // Called to create a new project
  $scope.newProject = function() {
    var projectTitle = prompt('Group name');
    if (projectTitle) {
      createProject(projectTitle);
    }
  };


  // Called to select the given project
  $scope.selectProject = function(project, index) {
    $scope.activeProject = project;
    Projects.setLastActiveIndex(index);
    $ionicSideMenuDelegate.toggleLeft(false);
  };
  if ($scope.projects.length == 0) {
    createProject("#Example");
  }


  // Create our modal

  $ionicModal.fromTemplateUrl('new-task.html', function(modal) {
    $scope.taskModal = modal;
  }, {
    scope: $scope
  });
  $scope.removeTask = function(id) {
    $scope.activeProject.tasks.splice(id, 1);
    Projects.save($scope.projects);

  }
  $scope.createTask = function(task) {
    var useTo = false;
    var arrDay = [];
    var Dateformat = $filter('date')(task.date,'shortTime'); //string type
    // var Dateformat = $filter('date')(task.date,'fullDate'); //string type
    // console.log(Dateformat);
    // console.log(task.date);
    // arrDay.push(task.date);
    // console.log(typeof(arrDay[0])); // type object
    var valDay = $filter('date')(task.date,'mediumDate');
    // console.log(valDay)
    if (!$scope.activeProject || !task) {
      return;
    };

    for (var i = 0; i < $scope.activeProject.tasks.length; i++) {

      var StrTask = JSON.stringify($scope.activeProject.tasks[i].date);
      // var ObjTask = JSON.parse(StrTask);
      console.log(StrTask);
      console.log(valDay);
      // console.log('task.date = ' +valDay);
      // console.log(arrDay[0]);
      // console.log('ObjTask : '+ObjTask.date);
      if (JSON.stringify(valDay) == StrTask) {
        console.log('hit same day');
        $scope.activeProject.tasks[i].title.push({
          name: task.title,
          done: false,
          time:Dateformat,
          timeSort:task.date
        });
        useTo = true;
      }
    }

    if (!useTo) {
      $scope.activeProject.tasks.push({
        title: [{
          name: task.title,
          done: false,
          time:Dateformat,
          timeSort:task.date
        }],
        done: 0,
        date: valDay,
        dateSort:task.date
      });
    }
    $scope.taskModal.hide();

    // Inefficient, but save all the projects
    Projects.save($scope.projects);
    $scope.activeProject.active = true;
    task.title = "";
    // location.reload();
  };

  $scope.newTask = function() {
    $scope.taskModal.show();
  };

  $scope.closeNewTask = function() {
    $scope.taskModal.hide();
  }
  $scope.clearTaskComplete = function() {
    for (var i = 0; i < $scope.activeProject.tasks.length; i++) {
      for (var j = 0; j < $scope.activeProject.tasks[i].title.length; j++) {
            if($scope.activeProject.tasks[i].title[j].done == true){
              $scope.activeProject.tasks[i].done-=1;
            }
      }
      $scope.activeProject.tasks[i].title = $scope.activeProject.tasks[i].title.filter(function(item){
        return item.done == false;
      })
    }
    $scope.activeProject.tasks = $scope.activeProject.tasks.filter(function(task){
      return task.title.length != 0;
    })
    Projects.save($scope.projects);
    // location.reload();


  }

  $scope.toggleProjects = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
  $scope.lengthActive = function() {
    var count = 0;
    for (var i = 0; i < $scope.activeProject.tasks.length; i++) {
      if ($scope.activeProject.tasks[i].done == false) {
        count += 1;
      }
    }
    return count;
  };
  $scope.checkboxToggle = function(idTasks, idTask) {
      console.log($scope.activeProject.tasks[idTasks].title[idTask].name);
      if ($scope.activeProject.tasks[idTasks].title[idTask].done == false) {
        $scope.activeProject.tasks[idTasks].title[idTask].done = true;
        $scope.activeProject.tasks[idTasks].done += 1;
      } else {
        $scope.activeProject.tasks[idTasks].title[idTask].done = false;
        $scope.activeProject.tasks[idTasks].done -= 1;

      }
      Projects.save($scope.projects);
    }
    // A confirm dialog
  $scope.showConfirm = function(idTasks,idTask) {
    var confirmPopup = $ionicPopup.confirm({
      title: 'Cancel Task',
      template: 'Are you sure you want to cancel this task?'
    });
    confirmPopup.then(function(res, id) {
      if (res) {
        $scope.activeProject.tasks[idTasks].title.splice(idTask, 1);
        Projects.save($scope.projects);
        console.log('You are sure');
      } else {
        console.log('You are not sure');
      }
    });
  };
  $scope.showConfirmDeleteProject = function(id) {
    var confirmPopupDel = $ionicPopup.confirm({
      title: 'Delete Group',
      template: 'Are you sure you want to delete ' + $scope.projects[id].title + ' group?'
    });
    confirmPopupDel.then(function(res) {
      if (res) {
        if ($scope.projects.length != 1) {
          $scope.projects.splice(id, 1);
          Projects.save($scope.projects);
          $scope.activeProject = $scope.projects[0];
          Projects.setLastActiveIndex($scope.projects.length - 1);
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
    if ($scope.projects.length == 0) {
      while (true) {
        var projectTitle = prompt('Your first project title:');
        if (projectTitle) {
          createProject(projectTitle);
          break;
        }
      }
    }
  });
});
