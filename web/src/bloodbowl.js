(function(angular) {
  function AppController() {
     this.isDisabled = false;
     this.selectedTarget = null;
     this.players = loadAll();
     this.selectedItemChange = selectedItemChange;
     this.searchText = "";
     this.querySearch = querySearch;
     this.ejection = 0;
     this.removal = 0;
     this.cas = 0;
     this.stomp = stomp;
     this.av;
     this.numAssists = 0;
     this.numBribes = 0;
     this.niggled;
     this.dirtyPlayer;
     this.thisSkull;
     this.stunty;
     this.av;
   
    /**
     * The current header (displayed in the toolbar and page title), or null to hide header text.
     *
     * @export
     * @type {?string}
     */
    this.header = "Blood Bowl Probabilities";

    /**
     * The path the back button should go to, or null to hide the back button.
     *
     * @export
     * @type {?string}
     */
    this.backPath = "/home";

    /**
     * Whether the toolbar should be displayed.
     *
     * @export
     * @type {boolean}
     */
    this.showHeader = true;

    /**
     * The function which causes the current page to refresh.
     *
     * @export
     * @type {?function():angular.$q.Promise}
     */
    this.refresher = null;

    /**
     * Whether the most recent refresh succeeded, or null to indicate that a refresh is in progress.
     *
     * @export
     * @type {?boolean}
     */
    this.refreshStatus = true;

    /**
     * The current page title. Appended to the header and displayed as the <title>.
     *
     * @export
     * @type {string}
     */
    this.title = "Tichu Tournament";
    
    /**
     * Whether to show a hamburger menu in the header. To minimize congestion
     * try to avoid having showMenu - true and backPath != null.
     *
     * @export
     * @type {?boolean}
     */
    this.showMenu = false;

    /**
     * Function to be called when the menu button is clicked.
     *
     * @export
     * @type {?function()}
     */
    this.openMenu = null;
  }
  
  function selectedItemChange(item) {}
  
   /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = query.toLowerCase();

      return function filterFn(player) {
        return (player.value.indexOf(lowercaseQuery) === 0);
      };
    }
    
    function querySearch (query) {
      var results = query ? this.players.filter(createFilterFor(query)) : this.players;
        return results;
      
    }
    
  function loadAll() {
      var allPlayers = 'Kroxigor, Skink';
     
      return allPlayers.split(/, +/g).map(function (player) {
        return {
          value: player.toLowerCase(),
          display: player
        };
      });
    }
    
    function stomp() {
      var twod6 = [0, 0, 0.0276, 0.0556, 0.0833, 0.1111, 0.1389, 0.1667, 0.1389, 0.1111, 
                   0.0833, 0.0556, 0.0276];
      var doubles = [0, 0, 1.0, 0, 0.3333, 0, 0.2, 0, 0.2, 0, 0.3333, 0, 1.0];
      var noDpArmorBreak = 0;
      var dpArmorBreak = 0;
      var avbrTarget = parseInt(this.av) + 1 - parseInt(this.numAssists);
      console.log("HII");
      console.log(avbrTarget);
      for (i = avbrTarget; i < 13; i++) {
        noDpArmorBreak += twod6[i];
      }
      dpArmorBreak = noDpArmorBreak + twod6[avbrTarget - 1];
      this.ejection = 0.1667;
      
      var noDpRemovalProb = 0;
      var koStart = 8;
      if (this.stunty) {
        koStart -= 1;
      }
      if (this.niggled) {
        koStart -= 1;
      }
      if (this.thickSkull) {
        koStart += 1;
      }
      for (i = koStart; i < 13; i++) {
        noDpRemovalProb += twod6[i];
      }
      var dpRemovalProb = noDpRemovalProb + twod6[koStart - 1];
      
      if (this.dirtyPlayer) {
        this.ejection = this.ejection + dpArmorBreak / 6;
        this.removal = noDpArmorBreak * dpRemovalProb + twod6[avbrTarget - 1] * noDpRemovalProb;
      } else {
        this.ejection = this.ejection + noDpArmorBreak * 0.1667;
        this.removal = noDpArmorBreak * noDpRemovalProb;
      }
      
      var noDpCas = 0;
      var casStart = 10;
      if (this.stunty) {
        casStart -= 1;
      }
      if (this.niggled) {
        casStart -= 1;
      }
      for (i = casStart; i < 13; i++) {
        noDpCas += twod6[i];
      }
      var dpCas = noDpCas + twod6[casStart - 1];
      
      if (this.dirtyPlayer) {
        this.cas = noDpArmorBreak * dpCas + twod6[avbrTarget - 1] * noDpCas;
      } else {
        this.cas = noDpArmorBreak * noDpCas;
      }
      for (i = 0; i < this.numBribes; i++) {
        this.ejection = this.ejection / 6;
      }
    }


  
  /**
   * Runs the refresh, toggling the status of the refresh variable appropriately.
   */
  AppController.prototype.refresh = function refresh() {
    if (!this.refresher) {
      return;
    }
    this.refreshStatus = null;
    var self = this;
    this.refresher.call(null).then(function() {
      self.refreshStatus = true;
    }).catch(function() {
      self.refreshStatus = false;
    });
  };
  
  
   
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
          "ngMaterial"])
      .controller("AppController", AppController)
      .config(configureTheme);
})(angular); 