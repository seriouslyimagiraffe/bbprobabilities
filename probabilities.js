TWO_D6 = [0, 0, 1.0/36, 2.0/36, 3.0/36, 4.0/36, 5.0/36, 6.0/36,
          5.0/36, 4.0/36, 3.0/36, 2.0/36, 1.0/36];

BLOCK = "block";
WRESTLE = "wrestle";
MB = "mb";
FRENZY = "frenzy";
CLAW = "claw";
NONE = "none";
PO = "po";
DODGE = "dodge";
TACKLE = "tackle";
NIGGLED = "niggled"
THICK_SKULL = "thick_skull"
STUNTY = "stunty"

BlockResults = function BlockResults(block_results) {
  this.turnover = block_results[0];
  this.push = block_results[1];
  this.noresult = block_results[2];
  this.wrestle = block_results[3];
  this.knockdown = block_results[4];
  this.bothdownturnover = block_results[5];
}

function oneDieBlockResults(attackerSkills, victimSkills) {
  var dodgeSaves = victimSkills.includes(DODGE) && !attackerSkills.includes(TACKLE);
  if (attackerSkills.includes(BLOCK)) {
    if (victimSkills.includes(BLOCK)) {
      if (dodgeSaves) {
        return new BlockResults([1.0/6, 3.0/6, 1.0/6, 0, 1.0/6, 0]);
      } else {
        return new BlockResults([1.0/6, 2.0/6, 1.0/6, 0, 2.0/6, 0]);
      }
    } else if (victimSkills.includes(WRESTLE))  {
      if (dodgeSaves) {
        return new BlockResults([1.0/6, 3.0/6, 0, 1.0/6, 1.0/6, 0]);
      } else {
        return new BlockResults([1.0/6, 2.0/6, 0, 1.0/6, 2.0/6, 0]);
      }
    } else {
      if (dodgeSaves) {
        return new BlockResults([1.0/6, 3.0/6, 0, 0, 2.0/6, 0]);
      } else {
        return new BlockResults([1.0/6, 2.0/6, 0, 0, 3.0/6, 0]);
      }
    }
  } else if (attackerSkills.includes(WRESTLE)) {
    if (dodgeSaves) {
      return new BlockResults([1.0/6, 3.0/6, 0, 1.0/6, 1.0/6, 0]);
    } else {
      return new BlockResults([1.0/6, 2.0/6, 0, 1.0/6, 2.0/6, 0]);
    }
  } else {
    if (victimSkills.includes(BLOCK)) {
      if (dodgeSaves) {
        return new BlockResults([2.0/6, 3.0/6, 0, 0, 1.0/6, 0]);
      } else {
        return new BlockResults([2.0/6, 2.0/6, 0, 0, 2.0/6, 0]);
      }
     // Making the assumption here that opponent will turn off wrestle causing
     // a turnover on both down.
    } else {
      if (dodgeSaves) {
        return new BlockResults([1.0/6, 3.0/6, 0, 0, 1.0/6, 1.0/6]);
      } else {
        return new BlockResults([1.0/6, 2.0/6, 0, 0, 2.0/6, 1.0/6]);
      }
    } 
  }
}

function probKnockdown(attackerSkills, victimSkills, numDice, turnoverCounts, wrestleCounts, $log) {
  var blockResults = oneDieBlockResults(attackerSkills, victimSkills);
  
  var frenzy = attackerSkills.includes(FRENZY);
  var knockDown = blockResults.knockdown;
  var safe_non_desired_result = blockResults.push + blockResults.noresult;
  var non_knockdown_frenzy_stopper = blockResults.turnover + blockResults.noresult;
  var turnover = blockResults.turnover + blockResults.bothdownturnover;
  
  if (turnoverCounts) {
    knockDown += blockResults.bothdownturnover;
  } else {
    non_knockdown_frenzy_stopper = blockResults.bothdownturnover;
  }
  if (wrestleCounts) {
    knockDown += blockResults.wrestle;
  } else {
    non_knockdown_frenzy_stopper += blockResults.wrestle;
  }
  
  if (numDice == -3) {
    if (frenzy) {
      var probForcedPush =  blockResults.push * (1 - blockResults.noresult - blockResults.turnover) * 
              (1 - blockResults.noresult - blockResults.turnover) + 
          (blockResults.knockdown + blockResults.bothdownturnover + blockResults.wrestle) * blockResults.push * 
              (1 - blockResults.noresult - blockResults.turnover) + 
          (blockResults.knockdown + blockResults.bothdownturnover + blockResults.wrestle) * 
              (blockResults.knockdown + blockResults.bothdownturnover + blockResults.wrestle) * 
              blockResults.push;
      return knockDown * knockDown * knockDown + 
          probForcedPush * knockDown * knockDown * knockDown;
    } else {
      return knockDown * knockDown * knockDown;
    }
  } else if (numDice == -2) {
    if (frenzy) {
      var probForcedPush =  blockResults.push * (1 - blockResults.noresult - blockResults.turnover) + 
          (blockResults.knockdown + blockResults.bothdownturnover + blockResults.wrestle) * blockResults.push;
      return knockDown * knockDown + probForcedPush * knockDown * knockDown;
    } else {
      return knockDown * knockDown;
    }
  } else if (numDice == 1) {
    if (frenzy) {
      return knockDown + blockResults.push * knockDown;
    } else {
      return knockDown;
    }
  } else if (numDice == 2) {
    var probKnockdownInOne = 
        blockResults.knockdown + 
          turnover * blockResults.knockdown + 
          safe_non_desired_result * blockResults.knockdown + 
          blockResults.wrestle * (wrestleCounts ? (1 - safe_non_desired_result) : blockResults.knockdown);
    if (frenzy) {
      return probKnockdownInOne + 
          (1 - probKnockdownInOne - (non_knockdown_frenzy_stopper * non_knockdown_frenzy_stopper)) * probKnockdownInOne;
    } else {
      return probKnockdownInOne;
    }
  } else {
    var probKnockdownInOne = 
        blockResults.knockdown + 
          turnover * blockResults.knockdown + 
          turnover * turnover * knockDown + 
          turnover * safe_non_desired_result * blockResults.knockdown + 
          turnover * blockResults.wrestle * (wrestleCounts ? (1 - safe_non_desired_result) : blockResults.knockdown) +
          safe_non_desired_result * blockResults.knockdown + 
          safe_non_desired_result * (1 - blockResults.knockdown) * blockResults.knockdown + 
          blockResults.wrestle * safe_non_desired_result * blockResults.knockdown + 
          blockResults.wrestle * blockResults.knockdown + 
          blockResults.wrestle * blockResults.wrestle * (wrestleCounts ? (1 - safe_non_desired_result) : blockResults.knockdown) + 
          blockResults.wrestle * turnover * (wrestleCounts ? (1 - safe_non_desired_result) : blockResults.knockdown);
    if (frenzy) {
      return probKnockdownInOne + 
          (1 - probKnockdownInOne - non_knockdown_frenzy_stopper * non_knockdown_frenzy_stopper * non_knockdown_frenzy_stopper) * probKnockdownInOne;
    } else {
      return probKnockdownInOne;
    }
  }
}


function probKnockdownNoTurnover(attackerSkills, victimSkills, numDice, $log) {
  // Array has the following probabilities for a single die:
  //   turnover, push, no result or wrestle,
  //   knockdown with armor roll, both down with armor rolls
  var blockResults;
  var dodgeSaves = victimSkills.includes(DODGE) && !attackerSkills.includes(TACKLE);
  if (attackerSkills.includes(BLOCK)) {
    if (victimSkills.includes(BLOCK) || victimSkills.includes(WRESTLE)) {
      if (dodgeSaves) {
        blockResults = [1.0/6, 3.0/6, 1.0/6, 1.0/6, 0];
      } else {
        blockResults = [1.0/6, 2.0/6, 1.0/6, 2.0/6, 0];
      }
    } else {
      if (dodgeSaves) {
        blockResults = [1.0/6, 3.0/6, 0, 2.0/6, 0];
      } else {
        blockResults = [1.0/6, 2.0/6, 0, 3.0/6, 0];
      }
    }
  } else if (attackerSkills.includes(WRESTLE)) {
    if (dodgeSaves) {
      blockResults = [1.0/6, 3.0/6, 1.0/6, 1.0/6, 0];
    } else {
      blockResults = [1.0/6, 2.0/6, 1.0/6, 2.0/6, 0];
    } 
  } else {
    if (victimSkills.includes(BLOCK)) {
      if (dodgeSaves) {
        blockResults = [2.0/6, 3.0/6, 0, 1.0/6, 0];
      } else {
        blockResults = [2.0/6, 2.0/6, 0, 2.0/6, 0];
      }
     // Making the assumption here that opponent will turn off wrestle causing
     // a turnover on both down.
     } else {
      if (dodgeSaves) {
        blockResults = [1.0/6, 3.0/6, 0, 1.0/6, 1.0/6];
      } else {
        blockResults = [1.0/6, 2.0/6, 0, 2.0/6, 1.0/6];
      }
    } 
  }
  
  var frenzy = attackerSkills.includes(FRENZY);
  var frenzy_stopper = blockResults[0] + blockResults[2];
  if (numDice == -3) {
    if (frenzy) {
      var probForcedPush =  blockResults[1] * (blockResults[1] + blockResults[3] + blockResults[4]) * 
          (blockResults[1] + blockResults[3] + blockResults[4]) + 
          (blockResults[3] + blockResults[4]) * blockResults[1] + (blockResults[1] + blockResults[3] + blockResults[4]) + 
          (blockResults[3] + blockResults[4]) * (blockResults[3] + blockResults[4]) * blockResults[1];
      return blockResults[3] * blockResults[3] * blockResults[3] + 
          probForcedPush * blockResults[3] * blockResults[3] * blockResults[3];
    } else {
      return  blockResults[3] * blockResults[3] * blockResults[3];
    }
  } else if (numDice == -2) {
    if (frenzy) {
      var probForcedPush =  blockResults[1] * (blockResults[1] + blockResults[3] + blockResults[4]) 
          (blockResults[3] + blockResults[4]) * blockResults[1];
      return  blockResults[3] * blockResults[3] + probForcedPush * blockResults[3] * blockResults[3];
    } else {
      return blockResults[3] * blockResults[3];
    }
  } else if (numDice == 1) {
    return blockResults[3];
  } else if (numDice == 2) {
    return blockResults[2] + (1 - blockResults[2]) * blockResults[2];
  } else {
    return blockResults[2] + 
           (1 - blockResults[2]) * blockResults[2] + 
           (1 - blockResults[2]) * (1 - blockResults[2]) * blockResults[2];
  }
}

function probTurnover(attackerSkills, victimSkills, numDice, $log) {
  var blockResults = oneDieBlockResults(attackerSkills, victimSkills);
  var frenzy = attackerSkills.includes(FRENZY);
 
  if (numDice == -3) {
    var firstBlockTurnover = blockResults.turnover + 
      blockResults.bothdownturnover * blockResults.turnover +
      blockResults.bothdownturnover * (blockResults.knockdown + blockResults.bothdownturnover) * (blockResults.turnover + blockResults.knockdown + blockResults.bothdownturnover) +
      blockResults.bothdownturnover * (blockResults.push + blockResults.noresult + blockResults.wrestle) * blockResults.turnover +
        (1 - blockResults.bothdownturnover - blockResults.turnover) * blockResults.turnover + 
           (1 - blockResults.bothdownturnover - blockResults.turnover) * (1 - blockResults.turnover) * blockResults.turnover;

    if (frenzy) {
      var firstBlockPush = blockResults.push * (1 - blockResults.turnover - blockResults.noresult) * (1 - blockResults.turnover - blockResults.noresult) +
          (1 - blockResults.turnover - blockResults.noresult - blockResults.push) * blockResults.push * (1 - blockResults.turnover - blockResults.noresult) +
          (1 - blockResults.turnover - blockResults.noresult -  blockResults.push) * (1 - blockResults.turnover - blockResults.noresult -  blockResults.push) * blockResults.push;
      return firstBlockTurnover + firstBlockPush * firstBlockTurnover;         
    } else {
      return firstBlockTurnover;
    }
  } else if (numDice == -2) {
    var firstBlockTurnover = blockResults.turnover + 
      blockResults.bothdownturnover * (blockResults.knockdown + blockResults.bothdownturnover) +
          (1 - blockResults.bothdownturnover - blockResults.turnover) * blockResults.turnover;
     if (frenzy) {
      var firstBlockPush = blockResults.push * (1 - blockResults.turnover - blockResults.noresult) +
          (1 - blockResults.turnover - blockResults.noresult - blockResults.push) * blockResults.push;
      return firstBlockTurnover + firstBlockPush * firstBlockTurnover;         
    } else {
      return firstBlockTurnover;
    }
  } else if (numDice == 1) {
    if (frenzy) {
      return  (blockResults.turnover + blockResults.bothdownturnover) +
          blockResults.push * (blockResults.turnover + blockResults.bothdownturnover);
    } else {
      return (blockResults.turnover + blockResults.bothdownturnover);
    }
  } else if (numDice == 2) {
    var firstBlockTurnover = (blockResults.turnover + blockResults.bothdownturnover) * (blockResults.turnover + blockResults.bothdownturnover);
    if (frenzy) {
      var firstBlockPush = blockResults.push * (1 - blockResults.knockdown) +
          (1 - blockResults.knockdown - blockResults.push) * blockResults.push;
      return firstBlockTurnover + firstBlockPush * firstBlockTurnover;
    } else {
      return firstBlockTurnover;
    }
  } else {
    var firstBlockTurnover = (blockResults.turnover + blockResults.bothdownturnover) * 
        (blockResults.turnover + blockResults.bothdownturnover) * 
        (blockResults.turnover + blockResults.bothdownturnover);
    if (frenzy) {
      var firstBlockPush = blockResults.push * (1 - blockResults.knockdown) * (1 - blockResults.knockdown) +
          (1 - blockResults.knockdown - blockResults.push) * blockResults.push * (1 - blockResults.knockdown) + 
          (1 - blockResults.knockdown - blockResults.push) * (1 - blockResults.knockdown - blockResults.push) * blockResults.push;
      return firstBlockTurnover + firstBlockPush * firstBlockTurnover;
    } else {
      return firstBlockTurnover;
    }
  }
}

function probArmorBreakOnKnockdown(av, claw) {
  var avbrTarget = av + 1;
  if (claw) {
    avbrTarget = Math.min(8, avbrTarget);
  }
  var noMbArmorBreak = 0;
  for (i = avbrTarget; i < 13; i++) {
    noMbArmorBreak += TWO_D6[i];
  }
  return noMbArmorBreak;
}

// Does not use Piling On.
function probStunOnArmorBreak(attackerSkills, victimSkills, mbAvailable, $log) {
  var koStart = 8;
  if (victimSkills.includes(STUNTY)) {
    koStart -= 1;
  }
  if (victimSkills.includes(NIGGLED)) {
    koStart -= 1;
  }
  if (victimSkills.includes(THICK_SKULL)) {
    koStart += 1;
  }
  if (attackerSkills.includes(MB) && mbAvailable) {
    koStart -= 1;
  }
  var stunProb = 0.0;
  for (i = 2; i < koStart; i++) {
    stunProb += TWO_D6[i];
  } 
  return stunProb;
}

// Does not use Piling On.
function probKOOnArmorBreak(attackerSkills, victimSkills, mbAvailable, $log) {
  var koStart = 8;
  if (victimSkills.includes(STUNTY)) {
    koStart -= 1;
  }
  if (victimSkills.includes(NIGGLED)) {
    koStart -= 1;
  }
  if (attackerSkills.includes(MB) && mbAvailable) {
    koStart -= 1;
  }
  if (victimSkills.includes(THICK_SKULL)) {
    return TWO_D6[koStart + 1]
  }
  return TWO_D6[koStart] + TWO_D6[koStart + 1];
}

// Does not use Piling On.
function probCasOnArmorBreak(attackerSkills, victimSkills, mbAvailable, $log) {
  var koStart = 8;
  if (victimSkills.includes(STUNTY)) {
    koStart -= 1;
  }
  if (victimSkills.includes(NIGGLED)) {
    koStart -= 1;
  }
  if (attackerSkills.includes(MB) && mbAvailable) {
    koStart -= 1;
  }
  var casProb = 0.0;
  for (i = koStart + 2; i < 13; i++) {
    casProb += TWO_D6[i];
  } 
  return casProb;
}

function probCasOnBlock(av, numDice, attackerSkills, victimSkills, $log) {
  var knockdownWithArmorRoll = probKnockdown(attackerSkills, victimSkills, numDice, true, false, $log);
  var noMbArmorBreak = probArmorBreakOnKnockdown(av, attackerSkills.includes(CLAW)); 
  var noMbRemovalProb = probKOOnArmorBreak(attackerSkills, victimSkills, false, $log) + 
      probCasOnArmorBreak(attackerSkills, victimSkills, false, $log);
  var mbRemovalProb = probKOOnArmorBreak(attackerSkills, victimSkills, true, $log) + 
      probCasOnArmorBreak(attackerSkills, victimSkills, true, $log);
  var noMbCas = probCasOnArmorBreak(attackerSkills, victimSkills, false, $log);
  var mbCas = probCasOnArmorBreak(attackerSkills, victimSkills, true, $log);
      
  var avbrTarget = av + 1;
  if (attackerSkills.includes(CLAW)) {
    avbrTarget = Math.min(8, avbrTarget);
  }  
 
  var casAfterArmorRoll = 0.0;
  if (attackerSkills.includes(MB)) {
    casAfterArmorRoll = (noMbArmorBreak * mbCas + TWO_D6[Math.max(avbrTarget - 1, 0)] * noMbCas);
    if (attackerSkills.includes(PO)) {
      var noArmorBreakProb = (1 - noMbArmorBreak - TWO_D6[Math.max(avbrTarget - 1, 0)]);
      casAfterArmorRoll = casAfterArmorRoll + noArmorBreakProb * casAfterArmorRoll + 
          noMbArmorBreak * (1 - mbRemovalProb) * mbCas + 
          TWO_D6[Math.max(avbrTarget - 1, 0)] * (1 - noMbRemovalProb) * noMbCas;
    }
  } else {
    casAfterArmorRoll = noMbArmorBreak * noMbCas;
    if (attackerSkills.includes(PO)) {
      casAfterArmorRoll = casAfterArmorRoll + (1 - noMbArmorBreak) * casAfterArmorRoll + 
          noMbArmorBreak * (1- noMbRemovalProb) * noMbCas;
    }
  }    
  return knockdownWithArmorRoll * casAfterArmorRoll;
} 

function removalOnBlock(av, numDice, attackerSkills, victimSkills, $log) {
  var knockdownWithArmorRoll = probKnockdown(attackerSkills, victimSkills, numDice, true, false, $log);
  var noMbArmorBreak = probArmorBreakOnKnockdown(av, attackerSkills.includes(CLAW)); 
  var noMbRemovalProb = probKOOnArmorBreak(attackerSkills, victimSkills, false, $log) + 
      probCasOnArmorBreak(attackerSkills, victimSkills, false, $log);
  var mbRemovalProb = probKOOnArmorBreak(attackerSkills, victimSkills, true, $log) + 
      probCasOnArmorBreak(attackerSkills, victimSkills, true, $log);
      
  var avbrTarget = av + 1;
  if (attackerSkills.includes(CLAW)) {
    avbrTarget = Math.min(8, avbrTarget);
  } 
  
  var removalAfterArmorRoll = 0.0;
  if (attackerSkills.includes(MB)) {
    removalAfterArmorRoll = noMbArmorBreak * mbRemovalProb + 
        TWO_D6[Math.max(avbrTarget - 1, 0)] * noMbRemovalProb;
    
    if (attackerSkills.includes(PO)) {
      var noArmorBreakProb = (1 - noMbArmorBreak - TWO_D6[Math.max(avbrTarget - 1, 0)]);
      removalAfterArmorRoll = removalAfterArmorRoll + 
          noArmorBreakProb * removalAfterArmorRoll + 
          noMbArmorBreak * (1 - mbRemovalProb) * mbRemovalProb + 
          TWO_D6[Math.max(avbrTarget - 1, 0)] * (1 - noMbRemovalProb) * noMbRemovalProb;
    }
  } else {
    removalAfterArmorRoll = noMbArmorBreak * noMbRemovalProb;
    
    if (attackerSkills.includes(PO)) {
      removalAfterArmorRoll = noMbArmorBreak * noMbRemovalProb +
          (1 - noMbArmorBreak) * noMbArmorBreak * noMbRemovalProb +
          noMbArmorBreak * (1 - noMbRemovalProb) * noMbRemovalProb;
    }
  }
  return knockdownWithArmorRoll * removalAfterArmorRoll;
}

function stunOnBlock(av, numDice, attackerSkills, victimSkills, $log) {
  var knockdownWithArmorRoll = probKnockdown(attackerSkills, victimSkills, numDice, true, false, $log);
  var noMbArmorBreak = probArmorBreakOnKnockdown(av, attackerSkills.includes(CLAW)); 
  var noMbRemovalProb = probKOOnArmorBreak(attackerSkills, victimSkills, false, $log) + 
      probCasOnArmorBreak(attackerSkills, victimSkills, false, $log);
  var mbRemovalProb = probKOOnArmorBreak(attackerSkills, victimSkills, true, $log) + 
      probCasOnArmorBreak(attackerSkills, victimSkills, true, $log);
      
  var avbrTarget = av + 1;
  if (attackerSkills.includes(CLAW)) {
    avbrTarget = Math.min(8, avbrTarget);
  } 
  var stunAfterArmorRoll = 0.0;
  if (attackerSkills.includes(MB)) {
    stunAfterArmorRoll = noMbArmorBreak * (1 - mbRemovalProb) + 
        TWO_D6[Math.max(avbrTarget - 1, 0)] * (1 - noMbRemovalProb);
    
    if (attackerSkills.includes(PO)) {
      var noArmorBreakProb = (1 - noMbArmorBreak - TWO_D6[Math.max(avbrTarget - 1, 0)]);   
      stunAfterArmorRoll = noArmorBreakProb * stunAfterArmorRoll + 
          noMbArmorBreak * (1 - mbRemovalProb) * (1 - mbRemovalProb) + 
          TWO_D6[Math.max(avbrTarget - 1, 0)] * (1 - noMbRemovalProb) * (1 - noMbRemovalProb);
    }
  } else {
    stunAfterArmorRoll = noMbArmorBreak * (1 - noMbRemovalProb);
    
    if (attackerSkills.includes(PO)) {
      stunAfterArmorRoll = (1 - noMbArmorBreak) * noMbArmorBreak * (1 - noMbRemovalProb) + 
          noMbArmorBreak * (1 - noMbRemovalProb) * (1 - noMbRemovalProb);
    }
  }
  return knockdownWithArmorRoll * stunAfterArmorRoll;
}