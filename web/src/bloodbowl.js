(function(angular) {
  function AppController() {
    /**
     * The current header (displayed in the toolbar and page title), or null to hide header text.
     *
     * @export
     * @type {?string}
     */
    this.header = "Blood Bowl Probabilities";
  }
  
  /**
   * Sets up the default routing to the first page visible.
   *
   * @param {!$routeProvider} $routeProvider
   * @ngInject
   */
  function setDefaultRoute($routeProvider) {
    $routeProvider.otherwise("/block");
  }
   
   /**
   * Sets up the Angular Material theme.
   *
   * @param {!$mdThemingProvider} $mdThemingProvider
   * @ngInject
   */
  function configureTheme($mdThemingProvider){
    $mdThemingProvider.theme('default')
        .primaryPalette('red')
        .accentPalette('blue');
  }

  angular.module("bloodbowl", ["ng",
          "md.data.table",
          "ngMaterial",
          "ngRoute",
          "fouling",
          "blocking",
          "buildoptimizer",
          "fame"])
      .controller("AppController", AppController)
      .config(configureTheme)
      .config(setDefaultRoute);
})(angular); 