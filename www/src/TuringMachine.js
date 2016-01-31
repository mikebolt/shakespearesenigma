var TuringMachineRule = function(state, symbol, nextState, printSymbol, shift) {
  this.state = state;
  this.symbol = symbol;
  this.nextState = nextState;
  this.printSymbol = printSymbol;
  this.shift = shift;
}

var TuringMachine = function(symbols, initialState) {
  // The blank symbol is 'undefined'.
  this.blank = undefined;
  // The tape is just an 'array'.
  // Don't forget that arrays can have negative indices, sort of.
  this.tape = [];
  this.position = 0; // The position of the head, as an index on the tape
  this.symbols = symbols; // The set of valid symbols
  this.states = [initialState, 'any']; // The set of internal states. These are strings.
  this.state = initialState;
  // Basic Turing machines can only move left or right at the end of
  // a processing step, but other systems are conceivable, so this is
  // abstracted using this here 'shifts' map.
  this.shifts = {
    'Left': -1,
    'Right': 1
  };
  this.rules = []; // The set of rules the Turing machine follows.

  // And now begin the functions:

  this.addState = function(state) {
    this.states.push(state);
  };

  this.addRule = function(rule) {
    if (!(rule instanceof TuringMachineRule)) {
      throw 'The rule passed to addRule must be an instance of TuringMachineRule.';
    }

    // Check if the rule's start and end states are in the state set.
    // If not, that's a problem.
    if (!this.states.includes(rule.state)) {
      console.log(rule.state);
      throw 'The start state of the new rule is not in the state set.';
    }
    if (!this.states.includes(rule.nextState) && rule.nextState !== 'same') {
      console.log(rule.nextState);
      throw 'The next state of the new rule is not in the state set.';
    }

    // Similarly, check if the rule's start symbol and symbol to print are
    // in the symbol set. If not, that's also a problem.
    if (!this.symbols.includes(rule.symbol)) {
      console.log(rule.symbol);
      throw 'The start symbol of the new rule is not in the symbol set.';
    }
    if (!this.symbols.includes(rule.printSymbol) && rule.printSymbol !== 'same') {
      console.log(rule.printSymbol);
      throw 'The symbol that the new rule prints is not in the symbol set.';
    }

    // Last, make sure the shift is valid.
    if (this.shifts[rule.shift] === undefined) {
      console.log(rule.shift);
      throw 'The new rule\'s shift type is invalid.';
    }

    // Now just add the rule to the rule set.
    this.rules.push(rule);
  };

  // Note that this doesn't reset the tape to its original state, if there
  // was some input on the tape to start. In that case some other
  // function should add the input back on the tape.
  this.resetMachine = function() {
    this.position = 0;
    this.state = initialState;
  };

  this.step = function() {
    if (this.isHalted()) {
      console.warn('Cannot step a halted machine.');
      return;
    }

    var currentSymbol = this.tape[this.position];
    
    // Check for an appropriate rule
    // TODO: this needs to be changed to support wildcards
    var appropriateRule;

    var machine = this;

    this.rules.forEach(function(rule) {
      var stateMatch = rule.state === 'any' || rule.state === machine.state;
      var symbolMatch = (rule.symbol === 'any' && currentSymbol !== undefined)
                        || rule.symbol === currentSymbol;

      // Pick the first rule that matches.
      if (stateMatch && symbolMatch && appropriateRule === undefined) {
        appropriateRule = rule;
      }
    });

    if (appropriateRule !== undefined) {
      console.log('Rule found');

      // 'Print' the symbol as specified by the rule.
      if (appropriateRule.printSymbol !== 'same') {
        this.tape[this.position] = appropriateRule.printSymbol;
      }	
 
      // Switch to the next state specified by the rule.
      if (appropriateRule.nextState !== 'same') {
        this.state = appropriateRule.nextState;
      }

      // Move the head in the specified direction.
      this.position += this.shifts[appropriateRule.shift];
    }
    else {
      console.log('No rule found');
      // If no rule could be found, halt the machine.
      this.state = undefined;
    }
  }

  this.isHalted = function() {
    return !this.states.includes(this.state); // Invalid state reached -> halted
  }
}

// This is being used in a browser, so I'm just going to expose the classes
// on the global object.
this.TuringMachineRule = TuringMachineRule;
this.TuringMacine = TuringMachine;

/*module.exports = {
  'TuringMachineRule': TuringMachineRule,
  'TuringMachine': TuringMachine
};*/
