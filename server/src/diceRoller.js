/**
 * Dice Rolling Utility
 * Parses and processes dice roll commands like "2d20 + 3 dh"
 */

const VALID_DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];

/**
 * Parse a dice command string
 * Format: <count>d<sides> [+|- <modifier>] [dh|dl]
 * Examples: "2d20", "3d6 + 2", "4d6 dl", "2d20 - 1 dh"
 */
function parseDiceCommand(command) {
  const trimmed = command.trim();

  // Regex pattern to match: count d sides optional(+/- modifier) optional(dh/dl)
  // Allows modifier and drop in any order
  const pattern = /^(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?\s*(dh|dl)?$|^(\d+)d(\d+)\s*(dh|dl)(?:\s*([+-])\s*(\d+))?$/i;
  const match = trimmed.match(pattern);

  if (!match) {
    return {
      isValid: false,
      error: 'Invalid dice roll format. Use: /r [count]d[sides] [+/- modifier] [dh/dl]'
    };
  }

  // Extract values from either pattern match
  const count = parseInt(match[1] || match[6]);
  const sides = parseInt(match[2] || match[7]);
  const modifierSign = match[3] || match[9];
  const modifierValue = match[4] || match[10];
  const dropModifier = (match[5] || match[8] || '').toLowerCase();

  // Validate dice sides
  if (!VALID_DICE_SIDES.includes(sides)) {
    return {
      isValid: false,
      error: 'Invalid dice type. Use d4, d6, d8, d10, d12, d20, or d100'
    };
  }

  // Validate count
  if (count < 1 || count > 100) {
    return {
      isValid: false,
      error: 'Dice count must be between 1 and 100'
    };
  }

  // Validate drop modifier
  if (dropModifier && count < 2) {
    return {
      isValid: false,
      error: 'Cannot use dh/dl with only 1 die'
    };
  }

  // Calculate modifier
  let modifier = 0;
  if (modifierSign && modifierValue) {
    modifier = parseInt(modifierValue);
    if (modifierSign === '-') {
      modifier = -modifier;
    }
  }

  return {
    isValid: true,
    count,
    sides,
    modifier,
    dropModifier: dropModifier || null
  };
}

/**
 * Roll dice and return array of results
 */
function rollDice(count, sides) {
  const rolls = [];
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  return rolls;
}

/**
 * Apply drop modifier and return index of dropped die
 * dh = drop highest (return index of max value)
 * dl = drop lowest (return index of min value)
 */
function applyDropModifier(rolls, dropModifier) {
  if (!dropModifier) {
    return null;
  }

  if (dropModifier === 'dh') {
    // Drop highest - find index of maximum value
    let maxIndex = 0;
    let maxValue = rolls[0];
    for (let i = 1; i < rolls.length; i++) {
      if (rolls[i] > maxValue) {
        maxValue = rolls[i];
        maxIndex = i;
      }
    }
    return maxIndex;
  } else if (dropModifier === 'dl') {
    // Drop lowest - find index of minimum value
    let minIndex = 0;
    let minValue = rolls[0];
    for (let i = 1; i < rolls.length; i++) {
      if (rolls[i] < minValue) {
        minValue = rolls[i];
        minIndex = i;
      }
    }
    return minIndex;
  }

  return null;
}

/**
 * Format dice roll output for display
 */
function formatDiceOutput(rolls, droppedIndex, modifier) {
  let rollsText = '';

  // Format individual rolls
  for (let i = 0; i < rolls.length; i++) {
    if (i > 0) {
      rollsText += ' + ';
    }

    if (i === droppedIndex) {
      rollsText += `[${rolls[i]}]`;
    } else {
      rollsText += rolls[i];
    }
  }

  // Add modifier to display
  if (modifier !== 0) {
    const sign = modifier > 0 ? '+' : '-';
    rollsText += ` (${sign} ${Math.abs(modifier)})`;
  }

  // Calculate sum (exclude dropped die)
  let sum = 0;
  for (let i = 0; i < rolls.length; i++) {
    if (i !== droppedIndex) {
      sum += rolls[i];
    }
  }
  sum += modifier;

  return {
    rollsText,
    sum
  };
}

/**
 * Main function to process a dice roll command
 * Returns complete roll data or error
 */
function processDiceRoll(command) {
  // Parse command
  const parsed = parseDiceCommand(command);

  if (!parsed.isValid) {
    return {
      isValid: false,
      error: parsed.error
    };
  }

  // Roll dice
  const rolls = rollDice(parsed.count, parsed.sides);

  // Apply drop modifier
  const droppedIndex = applyDropModifier(rolls, parsed.dropModifier);

  // Format output
  const { rollsText, sum } = formatDiceOutput(rolls, droppedIndex, parsed.modifier);

  // Build dice notation (e.g., "2d20 + 3 dh")
  let diceNotation = `${parsed.count}d${parsed.sides}`;
  if (parsed.modifier !== 0) {
    const sign = parsed.modifier > 0 ? '+' : '-';
    diceNotation += ` ${sign} ${Math.abs(parsed.modifier)}`;
  }
  if (parsed.dropModifier) {
    diceNotation += ` ${parsed.dropModifier}`;
  }

  const formattedOutput = `/r ${diceNotation}\nrolled: ${rollsText}\nsum = ${sum}`;

  return {
    isValid: true,
    command: command.trim(),
    count: parsed.count,
    sides: parsed.sides,
    rolls,
    droppedIndex,
    modifier: parsed.modifier,
    dropModifier: parsed.dropModifier,
    sum,
    formattedOutput
  };
}

module.exports = {
  parseDiceCommand,
  rollDice,
  applyDropModifier,
  formatDiceOutput,
  processDiceRoll
};
