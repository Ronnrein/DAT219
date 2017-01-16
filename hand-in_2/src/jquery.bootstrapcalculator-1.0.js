
(function($) {
    $.fn.bootstrapCalculator = function() {

        var container = $(this);
        var formulaInput;
        var resultDisplay;
        var hintText;

        /**
         * The precedence of the different operators
         */
        var precedence = {
            "^": {proc: 4, assocLeft: false},
            "*": {proc: 3, assocLeft: true},
            "/": {proc: 3, assocLeft: true},
            "%": {proc: 3, assocLeft: true},
            "+": {proc: 2, assocLeft: true},
            "-": {proc: 2, assocLeft: true}
        };

        init();

        /**
         * Create all HTML elements and event bindings
         */
        function init() {

            // Create display
            formulaInput = $("<input type='text' class='form-control form-inline' placeholder='Enter formula' aria-describedby='calculator-hint'>");
            formulaInput.on("keyup change", calculate);
            hintText = $("<span id='calculator-hint' class='help-block'>&nbsp;</span>");
            var resultBox = $("<h2>");
            resultDisplay = $("<span>0</span>");
            var useResultButton = $("<a href='#' class='btn btn-default btn-xs'>&uarr;</a>").click(useResult);
            resultBox.append(resultDisplay).append("&nbsp;").append(useResultButton);
            container.append($("<div class='col-md-12'>").append(formulaInput).append(hintText).append(resultBox));

            // Create function buttons
            var row = $("<div class='btn-group btn-group-justified'>");
            row.append($("<a href='#' class='btn btn-default'>C</a>").click(reset));
            row.append($("<a href='#' class='btn btn-default'>CE</a>").click(clear));
            row.append($("<a href='#' class='btn btn-default'>&larrhk;</a>").click(undo));
            container.append(row);

            // Create all non-function buttons
            var buttons = ["(", ")", "7", "8", "9", "%", "^", "4", "5", "6", "/", "*", "1", "2", "3", "+", "-", "0", "."];
            $.each(buttons, function(i, v) {
                if((i+3) % 5 == 0) {
                    container.append(row);
                    row = $("<div class='btn-group btn-group-justified'>");
                }
                row.append($("<a href='#' class='btn btn-default'>"+v+"</a>").click(symbolClick));
            });

            // Add more function buttons
            row.append($("<a href='#' class='btn btn-default'>&plusmn;</a>").click(togglePositivity));
            row.append($("<a href='#' class='btn btn-default'>&larr;</a>").click({amount: -1}, moveCursor));
            row.append($("<a href='#' class='btn btn-default'>&rarr;</a>").click({amount: 1}, moveCursor));
            container.append(row);

            // Stop default event behaviour to prevent input losing focus
            container.on("mousedown", "a", function(e) {
                if(!formulaInput.is(":focus")) {
                    formulaInput.focus();
                }
                e.preventDefault();
            });


        }

        /**
         * Add clicked symbol to formula at cursor
         */
        function symbolClick() {
            var symbol = $(this).text();
            updateFormula(function(text) {
                return text + symbol;
            });
        }

        /**
         * Clear the formula input
         */
        function reset() {
            updateFormula(function() {
                return "";
            }, true);
        }

        /**
         * Clear input at cursor
         */
        function clear() {
            updateFormula(function(text) {
                if(!text) {
                    return;
                }
                var last = text.match(/[\d.\d|\d]+$|[^\d.\d|\d]$/gm)[0];
                text = text.slice(0, -last.length);
                return text;
            });
        }

        /**
         * Toggle if number in input at cursor is positive or negative
         */
        function togglePositivity() {
            updateFormula(function(text) {
                if(!text) {
                    return;
                }
                if(!isNaN(text.slice(-1))) {
                    var segments = text.match(/\d+\.\d+|\d+/g);
                    var segment = segments[segments.length-1];
                    text = text.slice(0, -segment.length);
                    text = text.slice(-1) === "-" ? text.slice(0, -1)+segment : text+"-"+segment;
                }
                return text;
            });
        }

        /**
         * Undo last character before cursor
         */
        function undo() {
            updateFormula(function(text) {
                return text.slice(0, -1);
            });
        }

        /**
         * Moves cursor a certain amount left or right
         * @param {(Object|number)} e Event object or integer containing the amount to move
         */
        function moveCursor(e) {
            var amount = isNaN(e) ? e.data.amount : parseInt(e);
            setInputCursorPosition(getInputCursorPosition() + amount);
        }

        /**
         * Moves result to the formula input
         */
        function useResult() {
            updateFormula(function() {
                return resultDisplay.text();
            }, true);
        }

        /**
         * Calculate the current formula
         */
        function calculate() {
            var val = formulaInput.val();
            if(val === "") {
                resultDisplay.html("0");
                return;
            }
            val = cleanUpFormula("0+"+val);
            hintText.html("&nbsp;");
            if(!val || val === "0+") {
                return;
            }
            var invalidCharacters = extractInvalidCharacters(val);
            if(invalidCharacters.length !== 0) {
                hintText.html("Invalid characters in formula ("+invalidCharacters.join(", ")+")");
                return;
            }
            var postfix = infixToPostfix(val);
            var result = calculatePostfix(postfix);
            if(result == null) {
                hintText.html("Invalid formula");
                return;
            }
            resultDisplay.html(result);
        }

        /**
         * Remove repeated operators and replace commas with dots and plus minus with minus
         * @param {string} text Raw formula
         * @returns {string} Cleaned up formula
         */
        function cleanUpFormula(text) {
            var matches = text.match(/([^0-9()])+\1/g);
            $.each(matches, function(i, match) {
                text = text.replace(match, match.charAt(0));
            });
            return text.replace(",", ".").replace(/(\+-|-\+)/g, "-");
        }

        /**
         * Returns invalid formula characters in string
         * @param {string} text Formula
         * @returns {string[]} Invalid formula characters in this string
         */
        function extractInvalidCharacters(text) {
            var matches = text.match(/([^+*()^%/\-\d.])/g);
            return matches === null ? [] : matches;
        }

        /**
         * Calculate postfix formula
         * @param {string} postfix Postfix formula
         * @returns {(number|null)} Returns number if calculation succeeded, null if failed
         */
        function calculatePostfix(postfix) {
            var stack = [];
            var chars = postfix.split(" ");
            $.each(chars, function(_, char) {
                if(!isNaN(char)) {
                    stack.push(char);
                }
                else{
                    var num1 = parseFloat(stack.pop());
                    var num2 = parseFloat(stack.pop());
                    stack.push(calculateByOperator(char, num2, num1));
                }
            });
            var result = stack.pop();
            return isNaN(result) ? null : parseFloat(result);
        }

        /**
         * Calculates two operands by operator
         * @param {string} operator Operator to calculate by
         * @param {number} operand1 First operand
         * @param {number} operand2 Second operand
         * @returns {number} Result of calculation
         */
        function calculateByOperator(operator, operand1, operand2) {
            switch(operator) {
                case "+": return operand1 + operand2;
                case "-": return operand1 - operand2;
                case "*": return operand1 * operand2;
                case "/": return operand1 / operand2;
                case "%": return operand1 % operand2;
                case "^": return Math.pow(operand1, operand2);
            }
        }

        /**
         * Converts an infix formula to a postfix formula using the Shunting-yard algorithm
         * @param {string} infix Infix formula to convert
         * @returns {string} Converted postfix formula
         */
        function infixToPostfix(infix) {
            var postfix = [];
            var stack = [];
            var segments = infix.match(/(\d+\.\d+|\d+|\D)/g);
            $.each(segments, function(_, char) {

                // If character is number, add to string
                if(!isNaN(char)) {
                    postfix.push(char);
                }

                // Deal with operator if recognized
                else if(char in precedence) {
                    var pre1 = precedence[char];
                    var pre2 = precedence[stack[stack.length-1]];
                    while(pre2 !== undefined && stack.length > 0 && (pre1.proc < pre2.proc || (pre1.proc === pre2.proc && pre1.assocLeft))) {
                        postfix.push(stack.pop());
                        pre2 = precedence[stack[stack.length-1]];
                    }
                    stack.push(char);
                }

                // If character is opening parantheses, add to stack
                else if(char === "(") {
                    stack.push(char);
                }

                // If character is closing parantheses, pop until opening parantheses is found in stack
                else if(char === ")") {
                    while(stack.length > 0 && stack[stack.length-1] !== "(") {
                        postfix.push(stack.pop());
                    }
                    stack.pop();
                }
            });

            // Add rest of stack
            while(stack.length > 0) {
                postfix.push(stack.pop());
            }

            return postfix.join(" ");
        }

        /**
         * Function to handle updating of input field, preserving cursor position
         * @param {function} func Callback function to specify text modification
         * @param {boolean} preserveCursor Whether or not to preserve cursor, default is yes
         */
        function updateFormula(func, clear) {
            clear = clear === undefined ? false : clear;
            var text = formulaInput.val();
            if(clear) {
                formulaInput.val(func(text)).change();
                return;
            }
            var cursor = getInputCursorPosition();
            var oldText = text.slice(0, cursor);
            var newText = func(oldText);
            var diff = newText.length-oldText.length;
            formulaInput.val(newText + text.slice(cursor)).change();
            setInputCursorPosition(cursor+diff);
        }

        /**
         * Get current cursor position
         * @returns {number}
         */
        function getInputCursorPosition() {
            return formulaInput[0].selectionStart;
        }

        /**
         * Set cursor position
         * @param {number} pos Position to set cursor to
         */
        function setInputCursorPosition(pos) {
            formulaInput[0].setSelectionRange(pos, pos);
        }

    }
}) (jQuery);
