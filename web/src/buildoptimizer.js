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
     this.startingPo;
     this.startingTackle;
     
     this.evaluate = evaluate;
     this.evaluateBuild = evaluateBuild;
     this.avgProbTurnover = avgProbTurnover;
     this.probCauseInjuryOnKnockdown = probCauseInjuryOnKnockdown;
     this.probKnockdown = probKnockdown;
     this.prodDeadGivenTurnover = prodDeadGivenTurnover;
     this.selectBuild = selectBuild;
     this.clearResults = clearResults;
     
     this.buildOn = [false, false, false];
     
     this.skills = [[null, null, null, null, null],
                    [null, null, null, null, null],
                    [null, null, null, null, null]];
     this.expectedBlocksToSkill = [[0, 0, 0, 0, 0, 0],
                                   [0, 0, 0, 0, 0, 0],
                                   [0, 0, 0, 0, 0, 0]];
     this.minBlocks = [-1, -1, -1, -1, -1, -1];
  }
   
  function clearResults() {
    this.expectedBlocksToSkill = [[0, 0, 0, 0, 0, 0],
                                  [0, 0, 0, 0, 0, 0],
                                  [0, 0, 0, 0, 0, 0]];
    this.minBlocks = [-1, -1, -1, -1, -1, -1];
  }
  
  function selectBuild(index) {
    this.buildOn[index] = !this.buildOn[index]
  }
  
  function avgProbTurnover(skillsList) {
    return 0.25 * probTurnover(skillsList, [], 2, this.$log) + 
        0.25 * probTurnover(skillsList, [BLOCK], 2, this.$log) +
        0.25 * probTurnover(skillsList, [DODGE], 2, this.$log) + 
        0.25 * probTurnover(skillsList, [BLOCK, DODGE], 2, this.$log);
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
    return 0.25 * probCasOnBlock(8, 2, skillsList, [BLOCK], this.$log) + 
        0.25 * probCasOnBlock(8, 2, skillsList, [DODGE], this.$log) + 
        0.25 * probCasOnBlock(8, 2, skillsList, [BLOCK, DODGE], this.$log) + 
        0.25 * probCasOnBlock(8, 2, skillsList, [], this.$log);
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
    if (this.startingPo) {
      skillsList.push(PO)
    } 
    if (this.startingTackle) {
      skillsList.push(TACKLE);
    }
        
    var prodDeadGivenTurnover = this.prodDeadGivenTurnover(parseInt(this.playerAv));
    previous_expectation = 0
    for (var spp = 2; spp < 177; spp+=2) {
      var probCauseInjuryOnKnockdown = this.probCauseInjuryOnKnockdown(skillsList);
      var turnoverProb = this.avgProbTurnover(skillsList);
      var probDead = prodDeadGivenTurnover * turnoverProb;
      var probSpp =  probCauseInjuryOnKnockdown;
      
      previous_expectation = 
          (1 + probDead / probSpp) * previous_expectation + 1 / probSpp;
    
      if (spp == 6) {
        this.expectedBlocksToSkill[index][0] = Math.round(previous_expectation);
        skillsList.push(this.skills[index][0]);
      }
      if (spp == 16) {
        this.expectedBlocksToSkill[index][1] = Math.round(previous_expectation);
        skillsList.push(this.skills[index][1]);
      }
      if (spp == 32) {
        this.expectedBlocksToSkill[index][2] = Math.round(previous_expectation);
        skillsList.push(this.skills[index][2]);
      }
      if (spp == 52) {
        this.expectedBlocksToSkill[index][3] = Math.round(previous_expectation);
        skillsList.push(this.skills[index][3]);
      }
      if (spp == 76) {
        this.expectedBlocksToSkill[index][4] = Math.round(previous_expectation);
        skillsList.push(this.skills[index][4]);
      }
      if (spp == 176) {
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