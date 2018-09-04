  var currentBlockProperties = null;
  
  Blockly.selectedRobot = null;
  Blockly.currBlocklySubs = [];

  Blockly.Blocks['block_program'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Program");
      this.appendStatementInput("program")
          .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(210);
      this.setTooltip('Create a program');
      this.setHelpUrl('http://www.servotronix.com');
      this.blockType = "program";
    }
  };

  Blockly.Blocks['block_enable'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Enable Motion");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(120);
      this.setTooltip('Enable motion');
      this.setHelpUrl('http://www.servotronix.com');
    }
  };

  Blockly.Blocks['block_disable'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Disable Motion");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(0);
      this.setTooltip('Disable motion');
      this.setHelpUrl('http://www.servotronix.com');
    }
  };

  Blockly.Blocks['block_move'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Move to position")
          .appendField(new Blockly.FieldTextInput("0,0,0,0,0,0"), "position");
      this.appendDummyInput()
          .appendField("Cartesian")
          .appendField(new Blockly.FieldCheckbox("FALSE"), "cartesian")
          .appendField("Straight")
          .appendField(new Blockly.FieldCheckbox("FALSE"), "straight");
      this.appendDummyInput()
          .appendField("Wait for motion")
          .appendField(new Blockly.FieldCheckbox("FALSE"), "waitForMotion");
      this.appendStatementInput("Parameters")
          .setCheck("move_option")
          .appendField("Parameters");
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip('Move Motion Element');
      this.setHelpUrl('http://www.servotronix.com');
    }
  };

  Blockly.Blocks['block_move_var'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Move to")
          .appendField(new Blockly.FieldVariable("choose..."), "position");
      this.appendDummyInput()
          .appendField("Straight")
          .appendField(new Blockly.FieldCheckbox("FALSE"), "straight")
          .appendField("Wait for motion")
          .appendField(new Blockly.FieldCheckbox("TRUE"), "waitForMotion");
      this.appendStatementInput("Parameters")
          .setCheck("move_option")
          .appendField("Parameters");
      this.setInputsInline(false);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(230);
      this.setTooltip('Move Motion Element');
      this.setHelpUrl('http://www.servotronix.com');
    }
  };

  Blockly.Blocks['block_circle_around'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Circle around")
          .appendField(new Blockly.FieldTextInput("position"), "center");
      this.appendDummyInput()
          .appendField("Angle")
          .appendField(new Blockly.FieldTextInput("1"), "angle");
      this.appendDummyInput()
          .appendField("Wait for motion")
          .appendField(new Blockly.FieldCheckbox("FALSE"), "waitForMotion");
      this.appendStatementInput("params")
          .setCheck("circle_option")
          .appendField("Parameters");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(270);
      this.setTooltip('');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['block_if'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("If")
          .appendField(new Blockly.FieldTextInput("condition"), "condition");
      this.appendStatementInput("condition")
          .setCheck("String");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(90);
      this.setTooltip('If');
      this.setHelpUrl('http://www.servotronix.com');
    }
  };

  Blockly.Blocks['block_while'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("While")
          .appendField(new Blockly.FieldTextInput("condition"), "condition");
      this.appendStatementInput("condition")
          .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setInputsInline(false);
      this.setColour(180);
      this.setTooltip('While Loop');
      this.setHelpUrl('http://www.servotronix.com');
    }
  };

  Blockly.Blocks['block_for'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Do")
          .appendField(new Blockly.FieldNumber(0, 1), "times")
          .appendField("Times:");
      this.appendStatementInput("body")
          .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(180);
      this.setTooltip('');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['block_sleep'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Wait")
          .appendField(new Blockly.FieldTextInput("10"), "time")
          .appendField("Milliseconds");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(0);
      this.setTooltip('Sleep');
      this.setHelpUrl('http://www.servotronix.com');
    }
  };

  Blockly.Blocks['block_newvar'] = {
    init: function() {
      this.appendValueInput("varVal")
          .appendField("Define")
          .appendField(new Blockly.FieldVariable(null), "varName")
          .appendField("as")
          .appendField(new Blockly.FieldDropdown([["Integer","long"],["Decimal","double"],["Text","string"],["Joint","joint of xyzypr"],["Location","location of xyzypr"]]), "varType");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(270);
      this.setTooltip('New Variable');
      this.setHelpUrl('http://www.servotronix.com');
    }
  };

  Blockly.Blocks['block_var_val'] = {
    init: function() {
      this.appendValueInput("varVal")
          .setCheck(null)
          .appendField("Set")
          .appendField(new Blockly.FieldVariable(null), "varName")
          .appendField("to");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(270);
      this.setTooltip('');
      this.setHelpUrl('');
    }
  };

  Blockly.Blocks['block_sub'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Routine name:")
          .appendField(new Blockly.FieldTextInput("name"), "subName");
      this.appendStatementInput("routine")
          .setCheck(null);
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(210);
      this.setTooltip('Create a subroutine');
      this.setHelpUrl('http://www.servotronix.com');
      this.blockType = "sub";
    }
  };

  Blockly.Blocks['block_call'] = {
    init: function() {
      var subs = [];
      Blockly.currBlocklySubs.forEach(function(sub){
        subs.push([sub.name,sub.name]);
      });
      if (subs.length === 0)
          subs.push(["No Routines","undefined"]);
      this.appendDummyInput()
          .appendField("Execute routine")
          .appendField(new Blockly.FieldDropdown(subs), "subName");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(210);
      this.setTooltip('Execute a routine');
      this.setHelpUrl('http://www.servotronix.com');
    }
  };

  var move_options = ["Velocity","Acceleration","Deceleration"];
  move_options.forEach(function(option){
      Blockly.Blocks['block_move_' + option] = {
        init: function() {
          this.appendDummyInput()
              .appendField(option)
              .appendField(new Blockly.FieldTextInput("0"), "value");
          this.setPreviousStatement(true, "move_option");
          this.setNextStatement(true, "move_option");
          this.setColour(230);
          this.setTooltip(option);
          this.setHelpUrl('http://www.servotronix.com');
        }
      };
  });

  var circle_options = ["Vtran","Vrot","Atran","Dtran","Arot","Drot"];
  circle_options.forEach(function(option){
      Blockly.Blocks['block_circle_' + option] = {
        init: function() {
          this.appendDummyInput()
              .appendField(option)
              .appendField(new Blockly.FieldTextInput("0"), "value");
          this.setPreviousStatement(true, "circle_option");
          this.setNextStatement(true, "circle_option");
          this.setColour(270);
          this.setTooltip(option);
          this.setHelpUrl('http://www.servotronix.com');
        }
      };
  });

  Blockly.Blocks['block_val_joint'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Joint")
          .appendField(new Blockly.FieldTextInput("0,0,0,0,0,0"), "varVal");
      this.setOutput(true, null);
      this.setColour(270);
      this.setTooltip('');
      this.setHelpUrl('');
    }
  };

    Blockly.Blocks['block_val_location'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Location")
          .appendField(new Blockly.FieldTextInput("0,0,0,0,0,0"), "varVal");
      this.setOutput(true, null);
      this.setColour(270);
      this.setTooltip('');
      this.setHelpUrl('');
    }
  };

    Blockly.Blocks['block_val_custom'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Value")
          .appendField(new Blockly.FieldTextInput("0"), "varVal");
      this.setOutput(true, null);
      this.setColour(270);
      this.setTooltip('');
      this.setHelpUrl('');
    }
  };
  
  Blockly.Blocks['block_print'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Print")
          .appendField(new Blockly.FieldTextInput("\"Hello, World!\""), "txt");
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour(301);
      this.setTooltip('');
      this.setHelpUrl('');
    }
  };
  
  Blockly.JavaScript['block_print'] = function(block) {
    var txt = block.getFieldValue('txt');
    var block_prefix = "'#" + block.id + "\n";
    var code = block_prefix + 'print ' + txt + "\n";
    return code;
  };

  Blockly.JavaScript['block_val_joint'] = function(block) {
    var text_varval = block.getFieldValue('varVal');
    var code = '{' + text_varval + '}';
    return [code, Blockly.JavaScript.ORDER_NONE];
  };

  Blockly.JavaScript['block_val_location'] = function(block) {
    var text_varval = block.getFieldValue('varVal');
    var code = '#{' + text_varval + '}';
    return [code, Blockly.JavaScript.ORDER_NONE];
  };

  Blockly.JavaScript['block_val_custom'] = function(block) {
    var text_varval = block.getFieldValue('varVal');
    var code = text_varval;
    return [code, Blockly.JavaScript.ORDER_NONE];
  };

  Blockly.JavaScript['block_program'] = function(block) {
      var statements_program = Blockly.JavaScript.statementToCode(block, 'program');
      var forVarDeclaration = "";
      var block_prefix = "'#" + block.id + "\n";
      if (block.forVarDeclaration)
          forVarDeclaration = "Dim forVar as long\n";
      var code = block_prefix + 'program\n' + forVarDeclaration + 'Attach ' + Blockly.selectedRobot + '\n' + statements_program + "\nDetach " + Blockly.selectedRobot + "\nend program\n";
      return code;
  };

  Blockly.JavaScript['block_enable'] = function(block) {
    var block_prefix = "'#" + block.id + "\n";
    var cmd1 = Blockly.selectedRobot + '.en = 1\n';
    var code =  block_prefix + cmd1 +
                block_prefix + "Sleep 100\n" +
                block_prefix + "While NOT " + Blockly.selectedRobot + ".EN\n\t" +
                block_prefix + "\tSleep 100\nEnd While\n";
    return code;
  };

  Blockly.JavaScript['block_disable'] = function(block) {
      var cmd = Blockly.selectedRobot + '.en = 0';
      var code= "'#" + block.id + "\n" + cmd + "\n";
      return code;
  };

  Blockly.JavaScript['block_newvar'] = function(block) {
    var variable_varname = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('varName'), Blockly.Variables.NAME_TYPE);
    var dropdown_vartype = block.getFieldValue('varType');
    var varVal = Blockly.JavaScript.valueToCode(block, 'varVal', Blockly.JavaScript.ORDER_ATOMIC);
    var forVarDeclaration = "";
    var prefix = (block.getRootBlock().blockType !== undefined) ? "dim " : "dim shared ";
    var code = prefix + variable_varname + " as " + dropdown_vartype;
    if (varVal !== "")
      code += " = " + varVal;
    code += "\n";
    if (block.forVarDeclaration)
      forVarDeclaration = prefix + "forVar as long\n";
    code += forVarDeclaration;
    return code;
  };

  Blockly.JavaScript['block_var_val'] = function(block) {
    var variable_varname = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('varName'), Blockly.Variables.NAME_TYPE);
    var text_val = Blockly.JavaScript.valueToCode(block, 'varVal', Blockly.JavaScript.ORDER_ATOMIC);
    var code = "'#" + block.id + "\n" + variable_varname + ' = ' + text_val + '\n';
    return code;
  };

  Blockly.JavaScript['block_sub'] = function(block) {
    var text_name = block.getFieldValue('subName');
    var statements_routine = Blockly.JavaScript.statementToCode(block, 'routine');
    var block_prefix = "'#" + block.id + "\n";
    var forVarDeclaration = "";
    if (block.forVarDeclaration)
        forVarDeclaration = "Dim forVar as long\n";
    var code = block_prefix + 'sub ' + text_name + "\n" + forVarDeclaration + statements_routine + "\nend sub\n";
    Blockly.currBlocklySubs.push({name:text_name});
    return code;
  };

  Blockly.JavaScript['block_call'] = function(block) {
    var dropdown_name = block.getFieldValue('subName');
    var code = "'#" + block.id + "\ncall " + dropdown_name + '\n';
    return code;
  };

  Blockly.JavaScript['block_move_var'] = function(block) {
    var text_position = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('position'), Blockly.Variables.NAME_TYPE);
    var checkbox_straight = block.getFieldValue('straight') == 'TRUE';
    var checkbox_waitForMotion = block.getFieldValue('waitForMotion') == 'TRUE';
    var statements_parameters = Blockly.JavaScript.statementToCode(block, 'Parameters');
    var cmd = checkbox_straight ? "Moves" : "Move";
    cmd = cmd + ' ' + Blockly.selectedRobot + ' ' + text_position + statements_parameters;
    var code = "'#" + block.id + '\n' + cmd + '\n';
    if (checkbox_waitForMotion)
        code += "'#" + block.id + "\nWaitForMotion " + Blockly.selectedRobot + "\n";
    return code;
  };

  Blockly.JavaScript['block_move'] = function(block) {
    var text_position = block.getFieldValue('position');
    var checkbox_cartesian = block.getFieldValue('cartesian') == 'TRUE';
    var checkbox_straight = block.getFieldValue('straight') == 'TRUE';
    var checkbox_waitForMotion = block.getFieldValue('waitForMotion') == 'TRUE';
    var statements_parameters = Blockly.JavaScript.statementToCode(block, 'Parameters');
    var cmd = checkbox_straight ? "Moves" : "Move";
    var pos_prefix = checkbox_cartesian ? "#" : "";
    var position = (text_position.indexOf(",") == -1) ? text_position : pos_prefix + "{" + text_position + "}";
    var code = "'#" + block.id + "\n" + cmd + ' ' + Blockly.selectedRobot + ' ' + position + statements_parameters + '\n';
    if (checkbox_waitForMotion)
        code += "'#" + block.id + "\nWaitForMotion " + Blockly.selectedRobot + "\n";
    return code;
  };

  Blockly.JavaScript['block_circle_around'] = function(block) {
    var text_center = block.getFieldValue('center');
    var text_angle = block.getFieldValue('angle');
    var checkbox_waitForMotion = block.getFieldValue('waitForMotion') == 'TRUE';
    var statements_params = Blockly.JavaScript.statementToCode(block, 'params');
    var code = "'#" + block.id + "\nCircle " + Blockly.selectedRobot + ' Angle=' + text_angle + ' CircleCenter=' + text_center + statements_params + '\n';
    if (checkbox_waitForMotion)
        code += "'#" + block.id + "\nWaitForMotion " + Blockly.selectedRobot + "\n";
    return code;
  };

  Blockly.JavaScript['block_if'] = function(block) {
    var text_condition = block.getFieldValue('condition');
    var statements_condition = Blockly.JavaScript.statementToCode(block, 'condition');
    var code = "'#" + block.id + "\n" + 'If ' + text_condition + ' Then\n' + statements_condition + 'End If\n';
    return code;
  };

  Blockly.JavaScript['block_while'] = function(block) {
    var text_condition = block.getFieldValue('condition');
    var statements_condition = Blockly.JavaScript.statementToCode(block, 'condition');
    var code = "'#" + block.id + "\n" + 'While ' + text_condition + '\n' + statements_condition + 'End While\n';
    return code;
  };

  Blockly.JavaScript['block_for'] = function(block) {
      block.getRootBlock()["forVarDeclaration"] = true;
      var number_times = block.getFieldValue('times');
      var statements_body = Blockly.JavaScript.statementToCode(block, 'body');
      var code = "'#" + block.id + "\n" + 'For forVar = 1 to ' + number_times + '\n' + statements_body + 'Next forVar\n';
      return code;
  };

  Blockly.JavaScript['block_sleep'] = function(block) {
    var text_time = block.getFieldValue('time');
    var code = "'#" + block.id + "\n" + 'Sleep ' + text_time + '\n';
    return code;
  };

  Blockly.JavaScript['block_move_Velocity'] = function(block) {
    var number_value = block.getFieldValue('value');
    var code = 'VCruise = ' + number_value + ' ';
    return code;
  };

  Blockly.JavaScript['block_move_Acceleration'] = function(block) {
    var number_value = block.getFieldValue('value');
    var code = 'Acc = ' + number_value + ' ';
    return code;
  };

  Blockly.JavaScript['block_move_Deceleration'] = function(block) {
    var number_value = block.getFieldValue('value');
    var code = 'Dec = ' + number_value + ' ';
    return code;
  };

  circle_options.forEach(function(option){
    Blockly.JavaScript['block_circle_' + option] = function(block) {
      var number_value = block.getFieldValue('value');
      var code = option + ' = ' + number_value + ' ';
      return code;
    };
  });