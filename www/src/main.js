var ANY = 'any';
var SAME = 'same';

var symbols = [ANY, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
               'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
	       '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ' ', '!', '?',
	       ',', ':', ';', '-', '.', '\\n'];

var printSymbols = symbols.slice();
printSymbols[0] = SAME;

// Forgot how to clone an array so I'll do this.
symbols.forEach(function(symbol) {
  
});

var initialState = 'init';

var tm = new TuringMachine(symbols, initialState);

function initializeTape(string) {
  tm.tape = string.split('');
  tm.tape[tm.tape.length] = undefined;
}

initializeTape('A MOST COURTXOUS XEPOSITION.');

// If you're looking at this, you might be cheating.
var GOAL = 'A MOST COURTEOUS EXPOSITION.'.slice();

renderTape();

function RuleCard() {
  var state = tm.states[0]; // init
  var nextState = tm.states[0]; // init
  var symbol = tm.symbols[0]; // A
  console.log(symbol);
  var printSymbol = SAME; // A
  var shift = 'Right';

  this.rule = new TuringMachineRule(state, symbol, nextState, printSymbol, shift);
  tm.addRule(this.rule);

  this.element = $('#rule-prototype').clone();
  this.element.attr('id', '');
  this.element.attr('style', ''); // Remove 'display: none'
  this.element.find('.rule-name').text('Rule #' + ruleIndex++);

  // TODO: add control elements.

  var stateDropdown = this.element.find('.initial-state-chooser');
  var symbolDropdown = this.element.find('.initial-symbol-chooser');
  var nextStateDropdown = this.element.find('.next-state-chooser');
  var printSymbolDropdown = this.element.find('.print-symbol-chooser');
  var shiftDropdown = this.element.find('.shift-chooser');

  setupDropdown(stateDropdown, tm.states, state);
  setupDropdown(symbolDropdown, tm.symbols, symbol);
  var nextStates = tm.states.slice();
  nextStates[1] = SAME; // TODO: this may change
  setupDropdown(nextStateDropdown, nextStates, SAME);
  setupDropdown(printSymbolDropdown, printSymbols, printSymbol);
  setupDropdown(shiftDropdown, Object.keys(tm.shifts), shift);

  this.updateModel = function() {
    // Update the model using the data in the GUI
    this.rule.state = getDropdownValue(stateDropdown);
    this.rule.symbol = getDropdownValue(symbolDropdown);
    this.rule.nextState = getDropdownValue(nextStateDropdown);
    this.rule.printSymbol = getDropdownValue(printSymbolDropdown);
    this.rule.shift = getDropdownValue(shiftDropdown);
  };
}

function renderTape() {
  // TODO: this needs to change if negative indices will be supported.

  var container = $('#turing-tape');
  container.empty();
  var cellPrototype = $('#cell-prototype');

  for (var i = 0; i < tm.tape.length; ++i) {
    var cell = cellPrototype.clone();
    cell.attr('id', '');
    cell.attr('style', ''); // Remove 'display: none'
    cell.find('.tape-cell-value').text(tm.tape[i]);
    cell.find('.tape-cell-index').text(i);
    if (i === tm.position) {
      cell.find('.tape-cell-label').text('Head');
    }

    container.append(cell);
  }
}

function renderList(listGroupElement, list) {
  listGroupElement.empty();

  list.forEach(function(item) {
    var itemElement = $('<li/>');
    itemElement.addClass('list-group-item');
    itemElement.text(item);
    listGroupElement.append(itemElement);
  });
}

function setupDropdown(dropdownElement, stringList, defaultValue) {
  var clonedPrototype = $('#dropdown-prototype').clone();
  dropdownElement.empty();
  clonedPrototype.attr('id', ''); // Remove the id of 'dropdown-prototype'
  clonedPrototype.attr('style', ''); // Remove 'display: none'
  dropdownElement.append(clonedPrototype);
  var dropdownList = clonedPrototype.find('.dropdown-menu');
  dropdownList.empty(); // Remove everything inside the dropdown.

  var dropdownLabel = clonedPrototype.find('.dropdown-label');
  dropdownLabel.text(defaultValue);

  stringList.forEach(function(string) {
    var item = $('<li/>');
    var link = $('<a href="#"/>');
    link.text(string);
    item.append(link);

    link.on('click', function() {
      dropdownLabel.text(link.text());
    });

    dropdownList.append(item);
  });
}

function getDropdownValue(dropdownElement) {
  return dropdownElement.find('.dropdown-label').text(); // Good enough
}

var ruleCards = [];
var ruleIndex = 1;

$(window).on('load', function() {
  var ruleContainer = $('#rule-container');

  var addRuleButton = $('#add-rule-button');
  var simulateStepButton = $('#simulate-step-button');
  var simulateToEndButton = $('#simulate-to-end-button');
  var resetMachineButton = $('#reset-machine-button');
  var clearRulesButton = $('#clear-rules-button');

  addRuleButton.on('click', function() {
    var ruleCard = new RuleCard();
    console.log(ruleCard);
    ruleCards.push(ruleCard);
    ruleContainer.append(ruleCard.element);

    var removeButton = ruleCard.element.find('.remove-rule-button');
    removeButton.on('click', function() {
      console.log('asdf');
      index = ruleCards.indexOf(ruleCard);
      if (index > -1) {
        ruleCards.splice(index, 1); // Remove it from the model.
      }
      ruleCard.element.remove(); // Remove it from the GUI.
    });
  });

  simulateStepButton.on('click', function() {
    // TODO: doing this every time a step happens is inefficient.
    ruleCards.forEach(function(ruleCard) {
      ruleCard.updateModel();
    });

    tm.step();
    renderTape();

    var stateLabel = $('#state-label');
    var stateText = tm.state;
    if (tm.state === undefined) {
      stateText = 'Halted';
    }
    stateLabel.text('State: ' + stateText);

    if (tm.isHalted()) {
      var success = true;
      for (var i = 0; i < GOAL.length; ++i) {
        if (tm.tape[i] !== GOAL[i]) {
	  success = false;
	  break;
	}
      }
      if (success) {
        alert('Congratulations! You broke the code!');
      }
    }
  });

  var symbolList = $('#symbol-list');
  var stateList = $('#state-list');

  renderList(symbolList, tm.symbols);
  renderList(stateList, tm.states);

  var stateInput = $('#state-input');
  var addStateButton = $('#add-state');
  addStateButton.on('click', function() {
    var state = stateInput.val();
    if (state !== '') {
      tm.addState(state);
      stateInput.val('');
      renderList(stateList, tm.states);
    }
  });
});
