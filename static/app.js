// NOTE
// do not update angular.js until https://github.com/Textalk/angular-schema-form/issues/109 is resolved

angular.module('jinja2schemaDemo', ['schemaForm', 'ui.ace', 'ui.bootstrap'])

.controller('MainCtrl', function($scope, $http, $modal) {
    // due to ng-if scope issues
    $scope.form = {instance: null};

    $scope.template = null;
    $scope.schema = null;
    $scope.error = null;
    $scope.model = {};
    $scope.example = null;

    $scope.examples = [
        'example-1',
        'example-2',
        'example-3',
        'example-4',
        'example-5',
        'example-6'
    ];
    $scope.selectExample = function(example) {
        // https://github.com/angular/angular.js/issues/1448
        var noJsonTransform = function(data) { return data; };
        $http.get('/static/examples/' + example, {transformResponse: noJsonTransform}).then(function(resp) {
            $scope.template = resp.data;
            $scope.getSchema();
        });
    };

    $scope.getSchema = function() {
        $scope.model = {};
        $http.post('/schema/', $scope.template).then(function(resp) {
            var data = resp.data;
            $scope.error = null;
            reinitForm(data.schema);
        }).catch(function(resp) {
            var data = resp.data;
            $scope.error = data.message;
            reinitForm(null)
        });
    };

    function reinitForm(schema) {
        // superhack to completely re-initialize a form rendered from schema
        $scope.schema = null;
        setTimeout(function() {
            $scope.schema = schema;
            $scope.$apply();
        }, 5);
    }

    $scope.onFormSubmit = function() {
        var form = $scope.form.instance;
        $scope.$broadcast('schemaFormValidate');
        if (form.$valid) {
            $modal.open({
                templateUrl: 'modal.html',
                controller: function($scope, model) {
                    $scope.model = model;
                },
                resolve: {
                    model: function () {
                        return angular.copy($scope.model);
                    }
                }
            });
        }
    };
});