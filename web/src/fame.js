(function(angular) {
  function FameController() {
     this.p1;
     this.p2;
     this.draw;
     this.p1byone;
     this.p1bytwo;
     this.p1bytwo;
     this.p2bytwo;
     this.calculate = calculate;
  }
  
  function calculate() {
     var twod6 = [0, 0, 0.0276, 0.0556, 0.0833, 0.1111, 0.1389, 0.1667, 0.1389, 0.1111, 
                   0.0833, 0.0556, 0.0276];
      
     this.p1byone = 0;
     this.p1bytwo = 0;
     this.draw = 0;
     this.p2byone = 0;
     this.p2bytwo = 0;
     for ( i = 2; i < 13; i++) {
       var p1FamePlusRoll = parseInt(this.p1) + i;
       
       for (j = 2; j < 13; j++) {
         var p2FamePlusRoll = parseInt(this.p2) + j;
         var prob = twod6[i] * twod6[j];
         if (p2FamePlusRoll >= p1FamePlusRoll * 2) {
           this.p2bytwo += prob;
         } else if (p2FamePlusRoll > p1FamePlusRoll) {
           this.p2byone += prob;
         } else if (p2FamePlusRoll == p1FamePlusRoll) {
           this.draw += prob;
         } else if (p1FamePlusRoll >= p2FamePlusRoll * 2) {
           this.p1bytwo += prob;
         } else {
           this.p1byone += prob;
         }
       }
     }
     this.p1byone = this.p1byone.toFixed(2);
     this.p1bytwo = this.p1bytwo.toFixed(2);
     this.p2byone = this.p2byone.toFixed(2);
     this.p2bytwo = this.p2bytwo.toFixed(2);
     this.draw = this.draw.toFixed(2);
  }


  
   function mapRoute($routeProvider) {
     $routeProvider
        .when("/fame", {
          templateUrl: "web/src/fame.html",
          controller: "FameController",
          controllerAs: "fameController"
        });
  }
  

  angular.module("fame", ["ng", "ngRoute", "fouling"])
      .controller("FameController", FameController)
      .config(mapRoute);
})(angular); 