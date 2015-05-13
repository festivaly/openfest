(function() {
  var app = angular.module('app');

  app.controller('EventDetailController', ['$scope', 'Event', 'Ticket', '$state', '$translate', '$q', function($scope,
    Event, Ticket, $state, $translate, $q) {

    $scope.iamOwner = false;
    $scope.myTicket = null;
    $scope.isFull = false;

    var currentUser = $scope.currentUser;
    var recordId = $state.params.id;
    $scope.record = Event.findById({
      id: recordId,
      filter: {
        include: [
          { tickets: 'purchaser' },
          'owner'
        ]
      }
    });

    $scope.record
      .$promise
      .then(function(event) {
        $scope.iamOwner = (event.owner.id == currentUser.id);
        $scope.myTicket = (function() {
          var tickets = event.tickets;
          for (var i = 0, n = tickets.length; i < n; i++) {
            var ticket = tickets[i];
            if (ticket.purchaser.id === currentUser.id) {
              return ticket;
            }
            return null;
          }
        })();
        $scope.isFull = (event.tickets.length >= event.amountOfTickets);
      });

    $scope.remove = function() {
      $translate('page.Event.delete.confirm').then(function(msg) {
        ons.notification.confirm({
          message: msg,
          title: 'Alert',
          buttonLabels: ['Yes', 'No'],
          primaryButtonIndex: 1,
          cancelable: true,
          callback: function(index) {
            if (index !== 0) {
              return;
            }
            Event.removeById({
                id: recordId
              })
              .$promise
              .then(function() {
                $state.go('Event.list');
              });
          }
        });
      });
    };

    $scope.entry = function() {
      var params = {};
      params.ticketNo = Math.floor(Math.random() * 100000);
      params.purchaserId = currentUser.id;
      params.eventId = recordId;
      params.issuedAt = new Date();
      Ticket
        .create(params)
        .$promise
        .then(function() {
          $state.reload();
        });
    };

    $scope.cancelEntry = function() {
      Ticket
        .destroyById({id: $scope.myTicket.id})
        .$promise
        .then(function() {
          $state.reload();
        });
    };

    $scope.waitForCancel = function() {

    };
  }]);
})();
