(function(angular) {
  function BuildOptController($log) {
     this.twod6 = [0, 0, 0.02778, 0.05556, 0.08333, 0.11111, 0.13889, 0.16667, 0.13889, 0.11111, 
                   0.08333, 0.05556, 0.02778];

     this.playerAv;
     this.$log = $log;
     this.$log.log("HI");

     this.startingBlock;
     this.startingWrestle;
     this.startingFrenzy;
     this.startingClaw;
     this.startingMb;
     
     this.skill1;
     this.skill2;
     this.skill3;
     this.skill4;
     this.skill5;
     
     
     this.expectedFirstSkill;
     this.expectedSecondSkill;
     this.expectedThirdSkill;
     this.expectedFourthSkill;
     this.expectedFifthSkill;
     this.expectedSixthSkill;
     this.evaluate = evaluate;
     this.probTurnover = probTurnover;
     this.probCauseInjuryOnKnockdown = probCauseInjuryOnKnockdown;
     this.probKnockdown = probKnockdown;
     this.prodDeadGivenTurnover = prodDeadGivenTurnover;
  }
  
  var BLOCK = "block";
  var WRESTLE = "wrestle";
  var MB = "mb";
  var FRENZY = "frenzy";
  var CLAW = "claw";
  var NONE = "none";
  
  function probTurnover(skillsList) {
    if (skillsList.includes(FRENZY)) {
      if (skillsList.includes(BLOCK)) {
        return 1.0/36 + 1.0/9 * 1.0/36;
      }
      if (skillsList.includes(WRESTLE)) {
        return 1.0/36 + 2.0/9 * 1.0/36; 
      }
      return 1.0/9 + 1.0/81;
    }
    if (skillsList.includes(BLOCK) || skillsList.includes(WRESTLE)) {
      return 1.0/36
    }
    return 1.0/9
  }
  
  function prodDeadGivenTurnover(av) {
    armorBreak = 0;
    for (i = av + 1; i < 13; i++) {
      armorBreak += this.twod6[i];
    }   
    injuryGivenAb = 0
    for (i = 10; i < 13; i++) {
      injuryGivenAb += this.twod6[i];
    }
        
    total_prob = armorBreak * injuryGivenAb / 3.0;
    return total_prob
  }
  
  function probCauseInjuryOnKnockdown(skillsList) {
    if (skillsList.includes(CLAW)) {
      if (skillsList.includes(MB)) {
        return 0.1435214815
      } else {
        return 0.0694463889
      }
    } else {
      if (skillsList.includes(MB)) {
        return 0.10031052470000001;
      } else {
        return 0.04629759260000001
      }
    }
  }
  
    
  
  
  function probKnockdown(skillsList) {
    if (skillsList.includes(FRENZY)) {
      if (skillsList.includes(BLOCK)) {
        return 0.5 * (5.0 / 9.0 + 4.0 / 9.0 * 5.0 / 9.0) + 
               0.5 * (0.75 + 4.0 / 9.0 * 0.75);
      }
      return (5.0 / 9.0 + 4.0 / 9.0 * 5.0 / 9.0);
    }
    if (skillsList.includes(BLOCK)) {
      return  0.75 * 0.5 + 0.5 * 5.0 / 9.0;
    } else {
      return 5.0 / 9.0;
    }
  }
    
  function evaluate() {
      skillsList = []
      if (this.startingBlock) {
        skillsList.push(BLOCK)
      }
      if (this.startingWrestle) {
        skillsList.push(WRESTLE)
      }
      if (this.startingMb) {
        skillsList.push(MB)
      }
      if (this.startingClaw) {
        skillsList.push(CLAW)
      }
      if (this.startingFrenzy) {
        skillsList.push(FRENZY)
      }
      
      
      var prodDeadGivenTurnover = this.prodDeadGivenTurnover(parseInt(this.playerAv));
      this.$log.log(prodDeadGivenTurnover);
      previous_expectation = 0
      for (i = 2; i < 177; i+=2) {
        this.$log.log(i);
        var probCauseInjuryOnKnockdown = this.probCauseInjuryOnKnockdown(skillsList);
        var probTurnover = this.probTurnover(skillsList);
        var probKnockdown = this.probKnockdown(skillsList);
        var probDead = prodDeadGivenTurnover * probTurnover;
        var probSpp =  probCauseInjuryOnKnockdown * probKnockdown;
        this.$log.log(probDead);
        this.$log.log(probSpp);
      
        previous_expectation = 
            (1 + probDead / probSpp) * previous_expectation + 1 / probSpp;
        this.$log.log("expectation");
        this.$log.log(previous_expectation);
        if (i == 6) {
          this.expectedFirstSkill = previous_expectation.toFixed(0);
          if (this.skill1 != NONE) {
            skillsList.push(this.skill1);
          }
        }
        if (i == 16) {
          this.expectedSecondSkill = previous_expectation.toFixed(0);
          if (this.skill2 != NONE) {
            skillsList.push(this.skill2);
          }
        }
        if (i == 32) {
          this.expectedThirdSkill = previous_expectation.toFixed(0);
          if (this.skill3 != NONE) {
            skillsList.push(this.skill3);
          }
        }
        if (i == 52) {
          this.expectedFourthSkill = previous_expectation.toFixed(0);
          if (this.skill4 != NONE) {
            skillsList.push(this.skill4);
          }
        }
        if (i == 76) {
          this.expectedFifthSkill = previous_expectation.toFixed(0);
          if (this.skill5 != NONE) {
            skillsList.push(this.skill4);
          }
        }
        if (i == 176) {
          this.expectedSixthSkill = previous_expectation.toFixed(0);
        }
      }
    }
    

  
   function mapRoute($routeProvider) {
     $routeProvider
        .when("/buildoptimizer", {
          templateUrl: "web/src/buildoptimizer.html",
          controller: "BuildOptController",
          controllerAs: "buildOptController"
        });
  }
  

  angular.module("buildoptimizer", ["ng", "ngRoute"])
      .controller("BuildOptController", BuildOptController)
      .config(mapRoute);
})(angular); 