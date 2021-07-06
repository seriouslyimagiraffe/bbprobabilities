(function(angular) {
  function BuildOptController($log) {
     this.twod6 = [0, 0, 0.02778, 0.05556, 0.08333, 0.11111, 0.13889, 0.16667, 0.13889, 0.11111, 
                   0.08333, 0.05556, 0.02778];

     this.playerAv;
     this.$log = $log;

     this.startingBlock;
     this.startingWrestle;
     this.startingFrenzy;
     this.startingClaw;
     this.startingMb;
     
     this.evaluate = evaluate;
     this.evaluateBuild = evaluateBuild;
     this.probTurnover = probTurnover;
     this.probCauseInjuryOnKnockdown = probCauseInjuryOnKnockdown;
     this.probKnockdown = probKnockdown;
     this.prodDeadGivenTurnover = prodDeadGivenTurnover;
     this.selectBuild = selectBuild;
     
     this.buildOn = [false, false, false];
     
     this.skills = [[null, null, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null]];
     this.expectedBlocksToSkill = [[0, 0, 0, 0, 0, 0],
                                   [0, 0, 0, 0, 0, 0],
                                   [0, 0, 0, 0, 0, 0]];
     this.minBlocks = [-1, -1, -1, -1, -1, -1];
  }
  
  var BLOCK = "block";
  var WRESTLE = "wrestle";
  var MB = "mb";
  var FRENZY = "frenzy";
  var CLAW = "claw";
  var NONE = "none";
  
  function selectBuild(index) {
    this.buildOn[index] = !this.buildOn[index]
  }
  
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
  
  function evaluateBuild(index) {
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
    previous_expectation = 0
    for (i = 2; i < 177; i+=2) {
      var probCauseInjuryOnKnockdown = this.probCauseInjuryOnKnockdown(skillsList);
      var probTurnover = this.probTurnover(skillsList);
      var probKnockdown = this.probKnockdown(skillsList);
      var probDead = prodDeadGivenTurnover * probTurnover;
      var probSpp =  probCauseInjuryOnKnockdown * probKnockdown;
      
      previous_expectation = 
          (1 + probDead / probSpp) * previous_expectation + 1 / probSpp;
    
      if (i == 6) {
        this.expectedBlocksToSkill[index][0] = Math.round(previous_expectation);
        skillsList.push(this.skills[index][0]);
      }
      if (i == 16) {
        this.expectedBlocksToSkill[index][1] = Math.round(previous_expectation);
        skillsList.push(this.skills[index][1]);
      }
      if (i == 32) {
        this.expectedBlocksToSkill[index][2] = Math.round(previous_expectation);
        skillsList.push(this.skills[index][2]);
      }
      if (i == 52) {
        this.expectedBlocksToSkill[index][3] = Math.round(previous_expectation);
        skillsList.push(this.skills[index][3]);
      }
      if (i == 76) {
        this.expectedBlocksToSkill[index][4] = Math.round(previous_expectation);
        skillsList.push(this.skills[index][4]);
      }
      if (i == 176) {
        this.expectedBlocksToSkill[index][5] = Math.round(previous_expectation);
      }
    }
  }
    
  function evaluate() {
    for (j = 0; j < 3; j++) {
      this.evaluateBuild(j);
    }
    for (i = 0; i < 6; i++) {
      min_blocks = 10000000000;
      for (j = 0; j < 3; j++) {
        if (this.expectedBlocksToSkill[j][i] != 0 && 
            this.expectedBlocksToSkill[j][i] < min_blocks) {
          this.minBlocks[i] = this.expectedBlocksToSkill[j][i];
          min_blocks = this.expectedBlocksToSkill[j][i];
        }
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
  

  angular.module("buildoptimizer", ["ng", "ngRoute", "md.data.table"])
      .controller("BuildOptController", BuildOptController)
      .config(mapRoute);
})(angular); 