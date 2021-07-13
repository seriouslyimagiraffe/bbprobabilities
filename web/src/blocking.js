(function(angular) {
  function BlockController($log) {
     this.twod6 = [0, 0, 0.02778, 0.05556, 0.08333, 0.11111, 0.13889, 0.16667, 0.13889, 0.11111, 
                   0.08333, 0.05556, 0.02778];

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
     this.frenzy;
     
     this.turnover = 0;
     this.push = 0;
     this.knockdown = 0;
     this.stun = 0;
     this.removal = 0;
     this.cas = 0;
    
     this.pow = pow;
     this.$log = $log;
  }

    
    function pow() {
      var numDice = parseInt(this.numDice);
      var attackerSkills = [];
      var victimSkills = [];
      if (this.attackerBlock) {
        attackerSkills.push(BLOCK);
      }
      if (this.attackerWrestle) {
        attackerSkills.push(WRESTLE);
      }
      if (this.claw) {
        attackerSkills.push(CLAW);
      }
      if (this.mightyBlow) {
        attackerSkills.push(MB);
      }
      if (this.pilingOn) {
        attackerSkills.push(PO);
      }
      if (this.tackle) {
        attackerSkills.push(TACKLE);
      }
      if (this.frenzy) {
        attackerSkills.push(FRENZY);
      }
      if (this.victimBlock) {
        victimSkills.push(BLOCK);
      }
      if (this.victimWrestle) {
        victimSkills.push(WRESTLE);
      }
      if (this.dodge) {
        victimSkills.push(DODGE);
      }
      if (this.niggled) {
        victimSkills.push(NIGGLED);
      }
      if (this.thickSkull) {
        victimSkills.push(THICK_SKULL);
      }
      if (this.stunty) {
        victimSkills.push(STUNTY);
      }
      
      this.knockdown = probKnockdown(attackerSkills, victimSkills, numDice, false, true, this.$log);
      this.turnover = probTurnover(attackerSkills, victimSkills, numDice, this.$log);
      this.push = 1.0 - this.turnover - this.knockdown;
       
      this.removal = removalOnBlock(parseInt(this.av), numDice, attackerSkills, victimSkills,
          this.$log);
      this.stun = stunOnBlock(parseInt(this.av), numDice, attackerSkills, victimSkills,
          this.$log);
      this.cas = probCasOnBlock(parseInt(this.av), numDice, attackerSkills, victimSkills,
          this.$log);

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