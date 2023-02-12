(function(angular) {
  function FoulingController() {
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
      var twod6 = [0, 0, 1/36, 2/36, 3/36, 4/36, 5/36, 6/36, 5/36, 4/36, 
                   3/36, 2/36, 1/36];
      var doublesProbabilities = [0, 0, 1/36, 0, 1/36, 0, 1/36, 0, 1/36, 0, 1/36, 0, 1/36];
      var noDpArmorBreak = 0;
      var dpArmorBreak = 0;
      var avbrTarget = Math.max(parseInt(this.av) + 1 - parseInt(this.numAssists), 0);
      var noDpAvbrDoubles = 0;
      var dpAvbrDoubles = 0;

      for (i = avbrTarget; i < 13; i++) {
        noDpArmorBreak += twod6[i];
        noDpAvbrDoubles += doublesProbabilities[i];
      }
      dpArmorBreak = noDpArmorBreak + twod6[Math.max(avbrTarget - 1, 0)];
      dpAvbrDoubles = noDpAvbrDoubles + doublesProbabilities[Math.max(avbrTarget - 1, 0)]
      this.ejection = 1/6;
      
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
        this.ejection = this.ejection + ((dpArmorBreak - dpAvbrDoubles) / 6);
        this.removal = noDpArmorBreak * dpRemovalProb + twod6[Math.max(avbrTarget - 1, 0)] * noDpRemovalProb;
      } else {
        this.ejection = this.ejection + ((noDpArmorBreak - noDpAvbrDoubles) / 6);
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
        this.cas = noDpArmorBreak * dpCas + twod6[Math.max(avbrTarget - 1, 0)] * noDpCas;
      } else {
        this.cas = noDpArmorBreak * noDpCas;
      }
      for (i = 0; i < this.numBribes; i++) {
        this.ejection = this.ejection / 6;
      }
      this.ejection = this.ejection.toFixed(2)
      this.cas = this.cas.toFixed(2)
      this.removal = this.removal.toFixed(2)
    }

  
   function mapRoute($routeProvider) {
     $routeProvider
        .when("/fouls", {
          templateUrl: "web/src/fouling.html",
          controller: "FoulingController",
          controllerAs: "foulingController"
        });
  }
  

  angular.module("fouling", ["ng", "ngRoute", "fame"])
      .controller("FoulingController", FoulingController)
      .config(mapRoute);
})(angular); 