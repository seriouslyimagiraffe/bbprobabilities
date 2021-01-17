(function(angular) {
  function BlockController() {
     this.twod6 = [0, 0, 0.0276, 0.0556, 0.0833, 0.1111, 0.1389, 0.1667, 0.1389, 0.1111, 
                   0.0833, 0.0556, 0.0276];

     this.av;
     this.numDice = 2;
     
     this.victimBlock;
     this.victimWrstle;
     this.dodge;
     this.niggled;
     this.thickSkull;
     this.stunty;
     
     this.attackerBlock;
     this.attackerWrestle;
     this.mightyBlow;
     this.pilingOn;
     this.claw;
     this.tackle;
     
     this.turnover = 0;
     this.push = 0;
     this.knockdown = 0;
     this.stun = 0;
     this.removal = 0;
     this.cas = 0;
    
     this.pow = pow;

  }

    
    function pow() {
      // TODO: Fix Block/Wrestle combo.
      // Array has the following probabilities for a single die:
      //   turnover, no result, push, knockdown (armor roll), knockdown (no armor roll)
      var blockResults = [0, 0, 0, 0, 0];
if (this.attackerBlock) {
        if (this.victimBlock) {
          if (this.dodge && !this.tackle) {
            blockResults = [1.0/6.0, 1.0/6.0, 1.0/2.0, 1.0/6.0, 0.0];
          } else {
            blockResults = [1.0/6.0, 1.0/6.0, 1.0/3.0, 1.0/3.0, 0.0];
          }
        } else if (this.victimWrestle) {
          if (this.dodge && !this.tackle) {
            blockResults = [1.0/6.0, 0, 1.0/2.0, 1.0/6.0, 1.0/6.0];
          } else {
            blockResults = [1.0/6.0, 0, 1.0/3.0, 1.0/3.0, 1.0/6.0];
          }
        } else {
          if (this.dodge && !this.tackle) {
            blockResults = [1.0/6.0, 0, 1.0/2.0, 1.0/3.0, 0.0];
          } else {
            blockResults = [1.0/6.0, 0, 1.0/3.0, 1.0/2.0, 0.0];
          }
        }
      } else if (this.attackerWrestle) {
        if (this.victimBlock || this.victimWrestle) {
          if (this.dodge && !this.tackle) {
            blockResults = [1.0/6.0, 0.0, 1.0/2.0, 1.0/6.0, 1.0/6.0];
          } else {
            blockResults = [1.0/6.0, 0.0, 1.0/3.0, 1.0/3.0, 1.0/6.0];
          }
        } else {
          if (this.dodge && !this.tackle) {
            blockResults = [1.0/6.0, 0.0, 1.0/2.0, 1.0/6.0, 1.0/6.0];
          } else {
            blockResults = [1.0/6.0, 0, 1.0/3.0, 1.0/3.0, 1.0/6.0];
          }
        }
      } else {
        if (this.victimBlock) {
          if (this.dodge && !this.tackle) {
            blockResults = [1.0/3.0, 0, 1.0/2.0, 1.0/6.0, 0.0];
          } else {
            blockResults = [1.0/3.0, 0, 1.0/3.0, 1.0/3.0, 0.0];
          }
        } else if (this.victimWrestle) {
          if (this.dodge && !this.tackle) {
            blockResults = [1.0/6.0, 0, 1.0/2.0, 1.0/6.0, 1.0/6.0];
          } else {
            blockResults = [1.0/6.0, 0, 1.0/3.0, 1.0/3.0, 1.0/6.0];
          }
        } else {
          if (this.dodge && !this.tackle) {
            blockResults = [1.0/3.0, 0, 1.0/2.0, 1.0/6.0, 0.0];
          } else {
            blockResults = [1.0/3.0, 0, 1.0/3.0, 1.0/3.0, 0.0];
          }
        }
      }
      
      var numDice = parseInt(this.numDice);
      var knockdownWithArmorRoll = 0.0;
      var knockownWithoutArmorRoll = 0.0;
      
      if (numDice == -3) {
        this.turnover = blockResults[0] + 
                       (1 - blockResults[0]) * (blockResults[0] + 
                                                (1 - blockResults[0]) * blockResults[0]);
        this.knockdown = (blockResults[3] + blockResults[4]) * (blockResults[3] + blockResults[4]) * (blockResults[3] + blockResults[4]);
        knockdownWithArmorRoll = blockResults[3] * blockResults[3] * blockResults[3];
      } else if (numDice == -2) {
        this.turnover = blockResults[0] + (1 - blockResults[0]) * blockResults[0];
        this.knockdown = (blockResults[3] + blockResults[4]) * (blockResults[3] + blockResults[4]);
        knockdownWithArmorRoll = blockResults[3] * blockResults[3];
      } else if (numDice == 1) {
        this.turnover = blockResults[0];
        this.knockdown = blockResults[3] + blockResults[4];
        knockdownWithArmorRoll = blockResults[3];
      } else if (numDice == 2) {
        this.turnover = blockResults[0] * blockResults[0];
        this.knockdown = (blockResults[3] + blockResults[4]) + (1 - blockResults[3] - blockResults[4]) * (blockResults[3] + blockResults[4])
        knockdownWithArmorRoll = blockResults[3] + (1 - blockResults[3]) * blockResults[3];
      } else {
        this.turnover = blockResults[0] * blockResults[0] * blockResults[0];
        this.knockdown = (blockResults[3] + blockResults[4]) +
                         (1 - blockResults[3] - blockResults[4]) * ((blockResults[3] + blockResults[4]) + 
                                                                    (1 - blockResults[3] - blockResults[4]) * (blockResults[3] + blockResults[4]));
        knockdownWithArmorRoll = blockResults[3] + (1 - blockResults[3]) * (blockResults[3] + (1 - blockResults[3]) * blockResults[3]);
      }
      knockdownWithoutArmorRoll = this.knockdown - knockdownWithArmorRoll;
      this.push = 1.0 - this.turnover - this.knockdown;
        
        
      // Armor rolls
      var avbrTarget = parseInt(this.av) + 1;
      if (this.claw) {
        avbrTarget = Math.min(8, avbrTarget);
      }
      var noMbArmorBreak = 0;
      var mbArmorBreak = 0;
      for (i = avbrTarget; i < 13; i++) {
        noMbArmorBreak += this.twod6[i];
      }
      mbArmorBreak = noMbArmorBreak + this.twod6[Math.max(avbrTarget - 1, 0)];
      
      // Injury rolls
      var noMbRemovalProb = 0;
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
        noMbRemovalProb += this.twod6[i];
      }
      var mbRemovalProb = noMbRemovalProb + this.twod6[koStart - 1];
      
      var removalAfterArmorRoll = 0.0;
      var noArmorBreakProb = 0.0;
      var stunAfterArmorRoll = 0.0;
      
      if (this.mightyBlow) {
        removalAfterArmorRoll = noMbArmorBreak * mbRemovalProb + this.twod6[Math.max(avbrTarget - 1, 0)] * noMbRemovalProb;
        stunAfterArmorRoll =  noMbArmorBreak * (1 - mbRemovalProb) + this.twod6[Math.max(avbrTarget - 1, 0)] * (1 - noMbRemovalProb);
        if (this.pilingOn) {
          var noArmorBreakProb = (1 - noMbArmorBreak - this.twod6[Math.max(avbrTarget - 1, 0)]);
          removalAfterArmorRoll = removalAfterArmorRoll + 
                                  noArmorBreakProb * removalAfterArmorRoll + 
                                  noMbArmorBreak * (1 - mbRemovalProb) * mbRemovalProb + 
                                  this.twod6[Math.max(avbrTarget - 1, 0)] * (1 - noMbRemovalProb) * noMbRemovalProb;
          stunAfterArmorRoll = noMbArmorBreak * (1 - mbRemovalProb) * (1 - mbRemovalProb) + 
                               this.twod6[Math.max(avbrTarget - 1, 0)] * (1 - noMbRemovalProb) * (1 - noMbRemovalProb) + 
                               (1 - noMbArmorBreak - this.twod6[Math.max(avbrTarget - 1, 0)]) * stunAfterArmorRoll;
        }
      } else {
        removalAfterArmorRoll = noMbArmorBreak * noMbRemovalProb;
        stunAfterArmorRoll = noMbArmorBreak * (1 - noMbRemovalProb);
        if (this.pilingOn) {
          removalAfterArmorRoll = noMbArmorBreak * noMbRemovalProb +
                                  (1 - noMbArmorBreak) * noMbArmorBreak * (1 - noMbRemovalProb) +
                                  noMbArmorBreak * (1 - noMbRemovalProb) * noMbRemovalProb;
          stunAfterArmorRoll = noMbArmorBreak * (1 - noMbRemovalProb) * (1 - noMbRemovalProb) + 
                               (1 - noMbArmorBreak) * noMbArmorBreak * (1 - noMbRemovalProb);
        }
      }
      
      this.removal = knockdownWithArmorRoll * removalAfterArmorRoll;  
      this.stun = knockdownWithArmorRoll * stunAfterArmorRoll;
      
      var noMbCas = 0;
      var casStart = 10;
      if (this.stunty) {
        casStart -= 1;
      }
      if (this.niggled) {
        casStart -= 1;
      }
      for (i = casStart; i < 13; i++) {
        noMbCas += this.twod6[i];
      }
      var mbCas = noMbCas + this.twod6[casStart - 1];
      
      var casAfterArmorRoll = 0.0;
      if (this.mightyBlow) {
        casAfterArmorRoll = (noMbArmorBreak * mbCas + this.twod6[Math.max(avbrTarget - 1, 0)] * noMbCas);
        if (this.pilingOn) {
          casAfterArmorRoll = casAfterArmorRoll + noArmorBreakProb * casAfterArmorRoll + 
              noMbArmorBreak * (1 - mbCas) * mbCas + 
              this.twod6[Math.max(avbrTarget - 1, 0)] * (1 - noMbCas) * noMbCas;
        }
      } else {
        casAfterArmorRoll = noMbArmorBreak * noMbCas;
        if (this.pilingOn) {
          casAfterArmorRoll = casAfterArmorRoll + noArmorBreakProb * casAfterArmorRoll + 
              noMbArmorBreak * (1- noMbCas) * noMbCas;
        }
      }
      this.cas = knockdownWithArmorRoll * casAfterArmorRoll;

      this.turnover = this.turnover.toFixed(2);
      this.push = this.push.toFixed(2);
      this.knockdown = this.knockdown.toFixed(2);
      this.stun = this.stun.toFixed(2);
      this.cas = this.cas.toFixed(2);
      this.removal = this.removal.toFixed(2);
    }

  
   function mapRoute($routeProvider) {
     $routeProvider
        .when("/block", {
          templateUrl: "web/src/blocking.html",
          controller: "BlockController",
          controllerAs: "blockController"
        });
  }
  

  angular.module("blocking", ["ng", "ngRoute"])
      .controller("BlockController", BlockController)
      .config(mapRoute);
})(angular); 