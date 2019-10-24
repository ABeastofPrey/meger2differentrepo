Blockly.selectedRobot = null;
Blockly.currBlocklySubs = [];
Blockly.helperVariables = [];
Blockly.grippers = [];

/* ROBOT BLOCKS */

  /* -------  ROBOT MOTION BLOCKS  ------ */
    Blockly.Blocks['block_enable'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage(
                "assets/pics/blockly/baseline_power_settings_new_white_18dp.png",
                18, 18, "stop"))
            .appendField("Power ON");
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#1B5E20');
        this.setTooltip('Enable motion');
        this.setHelpUrl('http://www.servotronix.com');
      }
    };
    Blockly.JavaScript['block_enable'] = function(block) {
      var block_prefix = "'#" + block.id + "\n";
      var code =  block_prefix + 'En = 1\n' +
                  block_prefix + "Sleep 100\n" +
                  block_prefix + 'While NOT En\n\t' +
                  block_prefix + "\tSleep 100\nEnd While\n";
      return code;
    };
    Blockly.Blocks['block_disable'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage(
                "assets/pics/blockly/baseline_power_settings_new_white_18dp.png",
                18, 18, "stop"))
            .appendField("Power OFF");
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#B71C1C');
        this.setTooltip('Disable motion');
        this.setHelpUrl('http://www.servotronix.com');
      }
    };
    Blockly.JavaScript['block_disable'] = function(block) {
      return "'#" + block.id + "\nEn = 0\n";
    };
    Blockly.Blocks['block_stop'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage(
                "assets/pics/blockly/baseline_stop_white_18dp.png",
                18, 18, "stop"))
            .appendField("STOP");
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#B71C1C');
     this.setTooltip("");
     this.setHelpUrl("");
      }
    };
    Blockly.JavaScript['block_stop'] = function(block) {
      return "'#" + block.id + "\nStop\n";
    };
    Blockly.Blocks['block_delay'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("assets/pics/blockly/baseline_timer_white_18dp.png", 16, 16, ""))
            .appendField("Dwell")
            .appendField(new Blockly.FieldNumber(0, 1), "time")
            .appendField("[ms]");
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#BF360C');
     this.setTooltip("");
     this.setHelpUrl("");
      }
    };
    Blockly.JavaScript['block_delay'] = function(block) {
      var time = block.getFieldValue('time');
      return "'#" + block.id + '\nDelay ' + time + '\n';
    };
    Blockly.Blocks['block_wait_for_motion'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("assets/pics/blockly/baseline_timelapse_white_18dp.png", 16, 16, ""))
            .appendField("Wait for motion to end");
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#BF360C');
     this.setTooltip("");
     this.setHelpUrl("");
      }
    };
    Blockly.JavaScript['block_wait_for_motion'] = function(block) {
      return "'#" + block.id + '\nWaitForMotion\n';
    };
  /* ----- END OF ROBOT MOTION BLOCKS ----- */
  /* ----- INTERPOLATION BLOCKS ----- */
    Blockly.Blocks['block_move'] = {
      init: function() {
        this.appendValueInput("target")
            .setCheck(null)
            .appendField(new Blockly.FieldImage("assets/pics/blockly/move.png", 24, 24, ""))
            .appendField("Move To");
        this.appendStatementInput("params")
            .setCheck(['move_param'])
            .appendField("Parameters");
        this.setInputsInline(true);
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#4A148C');
        this.setTooltip("");
        this.setHelpUrl("");
      }
    };
    Blockly.JavaScript['block_move'] = function(block) {
      var block_prefix = "'#" + block.id + "\n";
      var pos = Blockly.JavaScript.valueToCode(
                  block,'target',Blockly.JavaScript.ORDER_ATOMIC);
      var params = Blockly.JavaScript.statementToCode(block,'params');
      var code = block_prefix + 'Move ' + pos;
      if (params && params.length > 0)
         code += params;
      code += '\n';
      return code;
    };
    Blockly.Blocks['block_moves'] = {
      init: function() {
        this.appendValueInput("target")
            .setCheck(null)
            .appendField(new Blockly.FieldImage("assets/pics/blockly/moves.png", 24, 24, ""))
            .appendField("Move Straight To");
        this.appendStatementInput("params")
            .setCheck(['move_param'])
            .appendField("Parameters");
        this.setInputsInline(true);
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#4A148C');
     this.setTooltip("");
     this.setHelpUrl("");
      }
    };
    Blockly.JavaScript['block_moves'] = function(block) {
      var block_prefix = "'#" + block.id + "\n";
      var pos = Blockly.JavaScript.valueToCode(
                  block,'target',Blockly.JavaScript.ORDER_ATOMIC);
      var params = Blockly.JavaScript.statementToCode(block,'params');
      var code = block_prefix + 'Moves ' + pos;
      if (params && params.length > 0)
        code += params;
      code += '\n';
      return code;
    };
    Blockly.Blocks['block_circle'] = {
      init: function() {
        this.appendValueInput("target")
            .setCheck(null)
            .appendField(new Blockly.FieldImage("assets/pics/blockly/circle.png", 24, 24, ""))
            .appendField("Circle          Center");
        this.appendDummyInput()
            .appendField("Angle")
            .appendField(new Blockly.FieldAngle(90), "angle")
            .appendField("Plane")
            .appendField(new Blockly.FieldDropdown([["XY","0"], ["XZ","1"], ["YZ","2"]]), "plane");
        this.appendStatementInput("params")
            .setCheck(['move_param'])
            .appendField("Parameters");
        this.setInputsInline(false);
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#4A148C');
     this.setTooltip("");
     this.setHelpUrl("");
      }
    };
    Blockly.JavaScript['block_circle'] = function(block) {
      var block_prefix = "'#" + block.id + "\n";
      var angle = block.getFieldValue('angle');
      var plane = block.getFieldValue('plane');
      var center = Blockly.JavaScript.valueToCode(
                  block,'target',Blockly.JavaScript.ORDER_ATOMIC);
      var params = Blockly.JavaScript.statementToCode(block,'params');
      var code = block_prefix + 'Circle angle=' + angle + ' CircleCenter=' + center + ' Plane=' + plane;
      if (params && params.length > 0)
         code += params;
      code += '\n';
      return code;
    };
    Blockly.Blocks['block_arc'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("assets/pics/blockly/circle.png", 24, 24, ""))
            .appendField("Arc     ");
        this.appendValueInput("target")
            .setCheck(null)
            .appendField("Circle Target");
        this.appendValueInput("point")
            .setCheck(null)
            .appendField("Circle Point");
        this.appendStatementInput("params")
            .setCheck(['move_param'])
            .appendField("Parameters");
        this.setInputsInline(true);
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#4A148C');
     this.setTooltip("");
     this.setHelpUrl("");
      }
    };
    Blockly.JavaScript['block_arc'] = function(block) {
      var block_prefix = "'#" + block.id + "\n";
      var point = Blockly.JavaScript.valueToCode(
                  block,'point',Blockly.JavaScript.ORDER_ATOMIC);
      var target = Blockly.JavaScript.valueToCode(
                  block,'target',Blockly.JavaScript.ORDER_ATOMIC);
      var params = Blockly.JavaScript.statementToCode(block,'params');
      var code = block_prefix + 'Circle CirclePoint=' + point + ' CircleTarget=' + target;
      if (params && params.length > 0)
        code += params;
      code += '\n';
      return code;
    };
  /* ----- END OF INTERPOLATION BLOCKS ----- */
  /* ----- INTERPOLATION PARAMETERS BLOCKS ----- */
    Blockly.Blocks['block_vtran'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("Velocity:")
            .appendField(new Blockly.FieldNumber(0, 0), "val")
            .appendField("%");
        this.setPreviousStatement(true, 'move_param');
        this.setNextStatement(true, 'move_param');
        this.setColour('#6A1B9A');
        this.setTooltip("");
        this.setHelpUrl("");
      }
    };
    Blockly.JavaScript['block_vtran'] = function(block) {
      var val = block.getFieldValue('val');
      var parent = block.getParent();
      if (parent === null)
        return '';
      if (parent.type === 'block_moves' || parent.type === 'block_circle' || parent.type === 'block_arc') {
        return 'VTran=' + val + '*Vmtran/100';
      } else if (parent.type === 'block_move') {
        return 'VCruise=' + val + '*Vmax/100';
      }
      return '';
    };
    Blockly.Blocks['block_blending'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("Blending Percentage:")
            .appendField(new Blockly.FieldNumber(0, 0), "val")
            .appendField("%");
        this.setPreviousStatement(true, 'move_param');
        this.setNextStatement(true, 'move_param');
        this.setColour('#6A1B9A');
        this.setTooltip("");
        this.setHelpUrl("");
      }
    };
    Blockly.JavaScript['block_blending'] = function(block) {
      var val = block.getFieldValue('val');
      return 'BlendingPercentage=' + val;
    };
  /* ----- END OF INTERPOLATION PARAMETERS BLOCKS ----- */
  /* ----- OPERATION BLOCKS ----- */
    Blockly.Blocks['block_approach'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("assets/pics/blockly/baseline_arrow_forward_white_18dp.png", 16, 16, ""))
            .appendField("Approach")
            .appendField(new Blockly.FieldNumber(0, 1), "distance")
            .appendField("[mm]");
        this.appendStatementInput("params")
            .setCheck(['move_param'])
            .appendField("Parameters");
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#880E4F');
     this.setTooltip("");
     this.setHelpUrl("");
      }
    };
    Blockly.JavaScript['block_approach'] = function(block) {
      var block_prefix = "'#" + block.id + "\n";
      var distance = block.getFieldValue('distance');
      var params = Blockly.JavaScript.statementToCode(block,'params');
      var code = block_prefix + 'Moves dest:#{0,0,' + distance + ',0,0,0}';
      return code + params + '\n';
    };
    Blockly.Blocks['block_depart'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("assets/pics/blockly/baseline_arrow_back_white_18dp.png", 16, 16, ""))
            .appendField("Depart")
            .appendField(new Blockly.FieldNumber(0, 1), "distance")
            .appendField("[mm]");
        this.appendStatementInput("params")
            .setCheck(['move_param'])
            .appendField("Parameters");
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#880E4F');
     this.setTooltip("");
     this.setHelpUrl("");
      }
    };
    Blockly.JavaScript['block_depart'] = function(block) {
      var block_prefix = "'#" + block.id + "\n";
      var distance = block.getFieldValue('distance');
      var params = Blockly.JavaScript.statementToCode(block,'params');
      var code = block_prefix + 'Moves dest:#{0,0,-' + distance + ',0,0,0}';
      return code + params + '\n';
    };
    Blockly.Blocks['block_up'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("assets/pics/blockly/baseline_arrow_upward_white_18dp.png", 16, 16, ""))
            .appendField("Up")
            .appendField(new Blockly.FieldNumber(0, 1), "distance")
            .appendField("[mm]");
        this.appendStatementInput("params")
            .setCheck(['move_param'])
            .appendField("Parameters");
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#880E4F');
     this.setTooltip("");
     this.setHelpUrl("");
      }
    };
    Blockly.JavaScript['block_up'] = function(block) {
      var block_prefix = "'#" + block.id + "\n";
      var distance = block.getFieldValue('distance');
      var params = Blockly.JavaScript.statementToCode(block,'params');
      var code = block_prefix + 'Moves #{0,0,' + distance + ',0,0,0} abs=0';
      return code + params + '\n';
    };
    Blockly.Blocks['block_down'] = {
      init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("assets/pics/blockly/baseline_arrow_downward_white_18dp.png", 16, 16, ""))
            .appendField("Down")
            .appendField(new Blockly.FieldNumber(0, 1), "distance")
            .appendField("[mm]");
        this.appendStatementInput("params")
            .setCheck(['move_param'])
            .appendField("Parameters");
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#880E4F');
     this.setTooltip("");
     this.setHelpUrl("");
      }
    };
    Blockly.JavaScript['block_down'] = function(block) {
      var block_prefix = "'#" + block.id + "\n";
      var distance = block.getFieldValue('distance');
      var params = Blockly.JavaScript.statementToCode(block,'params');
      var code = block_prefix + 'Moves #{0,0,-' + distance + ',0,0,0} abs=0';
      return code + params + '\n';
    };
    Blockly.Blocks['block_move_over'] = {
      init: function() {
        this.appendValueInput("p1")
            .setCheck(null)
            .appendField(new Blockly.FieldImage("assets/pics/blockly/pnp.png", 24, 24, ""))
            .appendField("Move Over from");
        this.appendValueInput("p2")
            .setCheck(null)
            .appendField("To");
        this.appendStatementInput("params")
            .setCheck(['move_param'])
            .appendField("Height: ")
            .appendField(new Blockly.FieldNumber(0, 1), "height")
            .appendField("[mm]     ")
            .appendField("Parameters");
        this.setInputsInline(true);
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#880E4F');
     this.setTooltip("");
     this.setHelpUrl("");
      }
    };
    Blockly.JavaScript['block_move_over'] = function(block) {
      var block_prefix = "'#" + block.id + "\n";
      var height = block.getFieldValue('height');
      var p1 = Blockly.JavaScript.valueToCode(
                  block,'p1',Blockly.JavaScript.ORDER_ATOMIC);
      var p2 = Blockly.JavaScript.valueToCode(
                  block,'p2',Blockly.JavaScript.ORDER_ATOMIC);
      var params = Blockly.JavaScript.statementToCode(block,'params');
      var code = block_prefix + 'Move ' + p1 + params + '\n';
      code += block_prefix + 'Moves ' + p1 + '+#{0,0,' + height + ',0,0,0}' + params + '\n';
      code += block_prefix + 'Moves ' + p2 + '+#{0,0,' + height + ',0,0,0}' + params + '\n';
      code += block_prefix + 'Moves ' + p2 + params + '\n';
      if (params && params.length > 0)
        code += params;
      code += '\n';
      return code;
    };
  /* ----- END OF OPERATION BLOCKS ----- */
/* ----- END OF ROBOT BLOCKS ----- */
/* ----- FLOW BLOCKS ----- */
  /* ----- PROGRAM BLOCKS ----- */
    Blockly.Blocks['block_program'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("Program");
        this.appendStatementInput("program")
            .setCheck('MCBasicCode');
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#0D47A1');
        this.setTooltip('Create a program');
        this.setHelpUrl('http://www.servotronix.com');
        this.blockType = "program";
      }
    };
    Blockly.Blocks['block_sub'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("Routine name:")
            .appendField(new Blockly.FieldTextInput("name"), "subName");
        this.appendStatementInput("routine")
            .setCheck(null);
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#1565C0');
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
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#1565C0');
        this.setTooltip('Execute a routine');
        this.setHelpUrl('http://www.servotronix.com');
      }
    };
    Blockly.Blocks['block_sleep'] = {
      init: function() {
        this.appendDummyInput()
            .appendField("Wait")
            .appendField(new Blockly.FieldTextInput("10"), "time")
            .appendField("[ms]");
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#BF360C');
        this.setTooltip('Sleep');
        this.setHelpUrl('http://www.servotronix.com');
      }
    };
    Blockly.Blocks['block_print'] = {
      init: function() {
        this.appendValueInput("text")
            .setCheck(null)
            .appendField("Print");
        this.setInputsInline(true);
        this.setPreviousStatement(true, 'MCBasicCode');
        this.setNextStatement(true, 'MCBasicCode');
        this.setColour('#1E88E5');
     this.setTooltip("");
     this.setHelpUrl("");
      }
    };
    Blockly.JavaScript['block_print'] = function(block) {
      var txt = Blockly.JavaScript.valueToCode(
                  block,'text',Blockly.JavaScript.ORDER_ATOMIC);
      var block_prefix = "'#" + block.id + "\n";
      var code = block_prefix + 'print ' + txt + "\n";
      return code;
    };
  /* ----- END OF PROGRAM BLOCKS ----- */
  /* ----- CONDITIONS BLOCKS ----- */
  Blockly.Blocks['block_if'] = {
    init: function() {
      this.appendValueInput("condition")
          .setCheck(null)
          .appendField("If");
      this.appendStatementInput("body")
          .setCheck(null)
          .appendField("Do");
      this.appendStatementInput("else_body")
          .setCheck(null)
          .appendField("Else, Do");
      this.setInputsInline(true);
      this.setPreviousStatement(true, 'MCBasicCode');
      this.setNextStatement(true, 'MCBasicCode');
      this.setColour(210);
   this.setTooltip("");
   this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['block_if'] = function(block) {
    var condition = Blockly.JavaScript.valueToCode(
                block,'condition',Blockly.JavaScript.ORDER_ATOMIC);
    var body = Blockly.JavaScript.statementToCode(block,'body');
    var else_body = Blockly.JavaScript.statementToCode(block,'else_body');
    var block_prefix = "'#" + block.id + "\n";
    var code = block_prefix + 'If ' + condition + ' then\n\t';
    code += body + '\nElse\n\t' + else_body + '\nEnd If\n';
    return code;
  };
  /* ----- END OF CONDITIONS BLOCKS ----- */
/* ----- END OF FLOW BLOCKS ----- */
/* ----- SYSTEM BLOCKS ----- */
  /* ----- VARIABLES BLOCKS ----- */
  Blockly.Blocks['block_var_val'] = {
    init: function() {
      this.appendValueInput("variable")
          .setCheck(null)
          .appendField("Set");
      this.appendValueInput("value")
          .setCheck(null)
          .appendField("to");
      this.setInputsInline(true);
      this.setPreviousStatement(true, 'MCBasicCode');
      this.setNextStatement(true, 'MCBasicCode');
      this.setColour(160);
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  Blockly.Blocks['block_val_custom'] = {
    init: function() {
      this.appendDummyInput()
          .appendField(new Blockly.FieldTextInput("0"), "varVal");
      this.setOutput(true, null);
      this.setColour(160);
      this.setTooltip('');
      this.setHelpUrl('');
    }
  };
  Blockly.Blocks['block_var_joint'] = {
    init: function() {
      let block = this;
      this.appendDummyInput()
          .appendField("Joint")
          .appendField(new Blockly.FieldDropdown([['Choose...','Choose...']]),"variable");
      this.setOutput(true, null);
      this.setColour(160);
      this.setTooltip("");
      this.setHelpUrl("");
      this.customContextMenu = function(options) {
        options.splice(0,0,{
          text:'Teach Variable',
          enabled:true,
          callback: function() {
            const pos = block.getFieldValue('variable');
            Blockly.programService.teachVariableByName(pos);
          }
        });
      };
    }
  };
  Blockly.JavaScript['block_var_joint'] = function(block) {
    var code = block.getFieldValue('variable');
    return [code, Blockly.JavaScript.ORDER_NONE];
  };
  Blockly.Blocks['block_var_location'] = {
    init: function() {
      let block = this;
      this.appendDummyInput()
          .appendField("Location")
          .appendField(new Blockly.FieldDropdown([['Choose...','Choose...']]), "variable");
      this.setOutput(true, null);
      this.setColour(160);
      this.setTooltip("");
      this.setHelpUrl("");
      this.customContextMenu = function(options) {
        options.splice(0,0,{
          text:'Teach Variable',
          enabled:true,
          callback: function() {
            const pos = block.getFieldValue('variable');
            Blockly.programService.teachVariableByName(pos);
          }
        });
      };
    }
  };
  Blockly.JavaScript['block_var_location'] = Blockly.JavaScript['block_var_joint'];
  Blockly.Blocks['block_var_long'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Long")
          .appendField(new Blockly.FieldDropdown([['Choose...','Choose...']]), "variable");
      this.setOutput(true, null);
      this.setColour(160);
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['block_var_long'] = Blockly.JavaScript['block_var_joint'];
  Blockly.Blocks['block_var_double'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Double")
          .appendField(new Blockly.FieldDropdown([['Choose...','Choose...']]), "variable");
      this.setOutput(true, null);
      this.setColour(160);
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['block_var_double'] = Blockly.JavaScript['block_var_joint'];
  Blockly.Blocks['block_var_string'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("String")
          .appendField(new Blockly.FieldDropdown([['Choose...','Choose...']]), "variable");
      this.setOutput(true, null);
      this.setColour(160);
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['block_var_string'] = Blockly.JavaScript['block_var_joint'];
  /* ----- END OF VARIABLES BLOCKS ----- */
  /* ----- IO BLOCKS ----- */
  Blockly.Blocks['block_inp'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("Input")
        .appendField(new Blockly.FieldNumber(101, 0), "io");
      this.setOutput(true, null);
      this.setColour('#3E2723');
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['block_inp'] = function(block) {
    var code = 'Sys.dIN.' + block.getFieldValue('io');
    return [code, Blockly.JavaScript.ORDER_NONE];
  };
  Blockly.Blocks['block_out'] = {
    init: function() {
      this.appendDummyInput()
        .appendField("Output")
        .appendField(new Blockly.FieldNumber(101, 0), "io");
      this.setOutput(true, null);
      this.setColour('#3E2723');
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['block_out'] = function(block) {
    var code = 'Sys.dOUT.' + block.getFieldValue('io');
    return [code, Blockly.JavaScript.ORDER_NONE];
  };
  Blockly.Blocks['block_out_set'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Set Output")
          .appendField(new Blockly.FieldDropdown([["101","101"]]), "variable")
          .appendField("to")
          .appendField(new Blockly.FieldDropdown([["true","1"], ["false","0"]]), "stat");
      this.setPreviousStatement(true, ['MCBasicCode','move_param']);
      this.setNextStatement(true, ['MCBasicCode','move_param']);
      this.setColour('#3E2723');
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  Blockly.Blocks['block_inp_wait'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Wait until Input")
          .appendField(new Blockly.FieldDropdown([["101","101"]]), "variable")
          .appendField("is")
          .appendField(new Blockly.FieldDropdown([["true","1"], ["false","0"]]), "stat");
      this.setPreviousStatement(true, 'MCBasicCode');
      this.setNextStatement(true, 'MCBasicCode');
      this.setColour('#3E2723');
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  /* ----- END OF IO BLOCKS ----- */
  /* ----- PALLET BLOCKS ----- */
  Blockly.Blocks['block_pallet_pick'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Pick from Pallet")
          .appendField(new Blockly.FieldDropdown([['Choose...','Choose...']]), "variable");
      this.setPreviousStatement(true, 'MCBasicCode');
      this.setNextStatement(true, 'MCBasicCode');
      this.setColour('#455A64');
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['block_pallet_pick'] = function(block) {
    var block_prefix = "'#" + block.id + "\n";
    var pallet = block.getFieldValue('variable');
    var robot = Blockly.DataService.selectedRobot;
    let cmd = 'PLT_PICK_FROM_PALLET(' + robot + ',"' + pallet + '")';
    return block_prefix + cmd + '\n';
  };
  Blockly.Blocks['block_pallet_put'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Put in Pallet")
          .appendField(new Blockly.FieldDropdown([['Choose...','Choose...']]), "variable");
      this.setPreviousStatement(true, 'MCBasicCode');
      this.setNextStatement(true, 'MCBasicCode');
      this.setColour('#455A64');
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['block_pallet_put'] = function(block) {
    var block_prefix = "'#" + block.id + "\n";
    var pallet = block.getFieldValue('variable');
    var robot = Blockly.DataService.selectedRobot;
    let cmd = 'PLT_PLACE_ON_PALLET(' + robot + ',"' + pallet + '")';
    return block_prefix + cmd + '\n';
  };
  Blockly.Blocks['block_pallet_home'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Move to Pallet")
          .appendField(new Blockly.FieldDropdown([['Choose...','Choose...']]), "variable")
          .appendField("'s Safe position");
      this.setPreviousStatement(true, 'MCBasicCode');
      this.setNextStatement(true, 'MCBasicCode');
      this.setColour('#455A64');
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['block_pallet_home'] = function(block) {
    var block_prefix = "'#" + block.id + "\n";
    var pallet = block.getFieldValue('variable');
    var robot = Blockly.DataService.selectedRobot;
    let cmd = 'PLT_MOVE_TO_HOME_POSITION(' + robot + ',"' + pallet + '")';
    return block_prefix + cmd + '\n';
  };
  Blockly.Blocks['block_pallet_index_set'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Set Index of Pallet")
          .appendField(new Blockly.FieldDropdown([['Choose...','Choose...']]), "variable")
          .appendField("to")
          .appendField(new Blockly.FieldNumber(0, 0), "index");
      this.setPreviousStatement(true, 'MCBasicCode');
      this.setNextStatement(true, 'MCBasicCode');
      this.setColour('#455A64');
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['block_pallet_index_set'] = function(block) {
    var block_prefix = "'#" + block.id + "\n";
    var pallet = block.getFieldValue('variable');
    var index = block.getFieldValue('index');
    var robot = Blockly.DataService.selectedRobot;
    let cmd = 'PLT_SET_INDEX_STATUS("' + pallet + '",' + index + ')';
    return block_prefix + cmd + '\n';
  };
  Blockly.Blocks['block_pallet_condition_index'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Pallet")
          .appendField(new Blockly.FieldDropdown([["Choose...","Choose..."]]), "variable")
          .appendField("is")
          .appendField(new Blockly.FieldDropdown([["Empty","empty"], ["Full","full"]]), "status");
      this.setOutput(true, null);
      this.setColour('#455A64');
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['block_pallet_condition_index'] = function(block) {
    var pallet = block.getFieldValue('variable');
    var status = block.getFieldValue('status');
    var code = 'TODO: IMPLEMENT'; //TODO: IMPLEMENT
    return [code, Blockly.JavaScript.ORDER_NONE];
  };
  Blockly.Blocks['block_pallet_index_get'] = {
    init: function() {
      this.appendDummyInput()
          .appendField("Pallet")
          .appendField(new Blockly.FieldDropdown([["Choose...","Choose..."]]), "variable")
          .appendField("'s Index");
      this.setOutput(true, null);
      this.setColour('#455A64');
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['block_pallet_index_get'] = function(block) {
    var pallet = block.getFieldValue('variable');
    var code = 'PLT_GET_INDEX_STATUS("' + pallet + '")';
    return [code, Blockly.JavaScript.ORDER_NONE];
  };
  /* ----- END OF PALLET BLOCKS ----- */
  /* ----- GRIPPER BLOCKS ----- */
  Blockly.Blocks['block_gripper_open'] = {
    init: function() {
      var grippers = [];
      Blockly.grippers.forEach(function(grp){
        grippers.push([grp,grp]);
      });
      if (grippers.length === 0)
        grippers.push(["No Grippers","undefined"]);
      this.appendDummyInput()
          .appendField('Open Gripper')
          .appendField(new Blockly.FieldDropdown(grippers), "variable");
      this.setPreviousStatement(true, 'MCBasicCode');
      this.setNextStatement(true, 'MCBasicCode');
      this.setColour('#006064');
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['block_gripper_open'] = function(block) {
    var grp = block.getFieldValue('variable');
    var index = grp.indexOf(':');
    var ef = grp.substring(0,index);
    grp = grp.substring(index+2);
    var block_prefix = "'#" + block.id + "\n";
    var code = block_prefix + 'GRP_OPEN_GRIPPER("' + ef + '","' + grp + '")\n';
    return code;
  };
  Blockly.Blocks['block_gripper_close'] = {
    init: function() {
      var grippers = [];
      Blockly.grippers.forEach(function(grp){
        grippers.push([grp,grp]);
      });
      if (grippers.length === 0)
        grippers.push(["No Grippers","undefined"]);
      this.appendDummyInput()
          .appendField('Close Gripper')
          .appendField(new Blockly.FieldDropdown(grippers), "variable");
      this.setPreviousStatement(true, 'MCBasicCode');
      this.setNextStatement(true, 'MCBasicCode');
      this.setColour('#006064');
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['block_gripper_close'] = function(block) {
    var grp = block.getFieldValue('variable');
    var index = grp.indexOf(':');
    var ef = grp.substring(0,index);
    grp = grp.substring(index+2);
    var block_prefix = "'#" + block.id + "\n";
    var code = block_prefix + 'GRP_CLOSE_GRIPPER("' + ef + '","' + grp + '")\n';
    return code;
  };
  Blockly.Blocks['block_gripper_active'] = {
    init: function() {
      var grippers = [];
      Blockly.grippers.forEach(function(grp){
        grippers.push([grp,grp]);
      });
      if (grippers.length === 0)
        grippers.push(["No Grippers","undefined"]);
      this.appendDummyInput()
          .appendField('Set Active Gripper')
          .appendField(new Blockly.FieldDropdown(grippers), "variable");
      this.setPreviousStatement(true, 'MCBasicCode');
      this.setNextStatement(true, 'MCBasicCode');
      this.setColour('#006064');
      this.setTooltip("");
      this.setHelpUrl("");
    }
  };
  Blockly.JavaScript['block_gripper_active'] = function(block) {
    var grp = block.getFieldValue('variable');
    var index = grp.indexOf(':');
    var ef = grp.substring(0,index);
    grp = grp.substring(index+2);
    var block_prefix = "'#" + block.id + "\n";
    var code = block_prefix + 'GRP_SET_ACTIVE_GRIPPER("'+ef+'","'+grp+'")\n';
    return code;
  };
  /* ----- END OF GRIPPER BLOCKS ----- */
/* ----- END OF SYSTEM BLOCKS ----- */


/* OVERRIDE JAVASCRIPT'S DEFAULT BEHAVIOUR */
Blockly.JavaScript['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? '1' : '0';
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
Blockly.JavaScript.scrubNakedValue = function(line) {
  return line + '\n';
};
Blockly.JavaScript['logic_compare'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': '=',
    'NEQ': '<>',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var order = (operator == '=' || operator == '<>') ?
      Blockly.JavaScript.ORDER_EQUALITY : Blockly.JavaScript.ORDER_RELATIONAL;
  var argument0 = Blockly.JavaScript.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.JavaScript.valueToCode(block, 'B', order) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};
Blockly.JavaScript['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', Blockly.JavaScript.ORDER_ADDITION],
    'MINUS': [' - ', Blockly.JavaScript.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', Blockly.JavaScript.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', Blockly.JavaScript.ORDER_DIVISION],
    'POWER': [null, Blockly.JavaScript.ORDER_COMMA]  // Handle power separately.
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.JavaScript.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.JavaScript.valueToCode(block, 'B', order) || '0';
  var code;
  // Power in JavaScript requires a special case since it has no operator.
  if (!operator) {
    code = argument0 + '^' + argument1;
    return [code, Blockly.JavaScript.ORDER_FUNCTION_CALL];
  }
  code = argument0 + operator + argument1;
  return [code, order];
};
Blockly.JavaScript['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? 'AND' : 'OR';
  var order = (operator == 'AND') ? Blockly.JavaScript.ORDER_LOGICAL_AND :
      Blockly.JavaScript.ORDER_LOGICAL_OR;
  var argument0 = Blockly.JavaScript.valueToCode(block, 'A', order);
  var argument1 = Blockly.JavaScript.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == 'AND') ? 'true' : 'false';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};
Blockly.JavaScript['logic_negate'] = function(block) {
  // Negation.
  var order = Blockly.JavaScript.ORDER_LOGICAL_NOT;
  var argument0 = Blockly.JavaScript.valueToCode(block, 'BOOL', order) ||
      'true';
  var code = 'Not ' + argument0;
  return [code, order];
};
Blockly.JavaScript['controls_repeat_ext'] = function(block) {
  // Repeat n times.
  if (block.getField('TIMES')) {
    // Internal number.
    var repeats = String(Number(block.getFieldValue('TIMES')));
  } else {
    // External number.
    var repeats = Blockly.JavaScript.valueToCode(block, 'TIMES',
        Blockly.JavaScript.ORDER_ASSIGNMENT) || '0';
  }
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');
  branch = Blockly.JavaScript.addLoopTrap(branch, block.id);
  var code = '';
  // GET A UNIQUE VARIABLE NAME CALLED 'count' + a number
  var loopVar = Blockly.JavaScript.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  Blockly.helperVariables.push(loopVar);
  code += 'for ' + loopVar + ' = 1 to ' + repeats + '\n' +
      branch + '\nNext\n';
  return code;
};
Blockly.JavaScript['controls_whileUntil'] = function(block) {
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.JavaScript.valueToCode(block, 'BOOL',
      until ? Blockly.JavaScript.ORDER_LOGICAL_NOT :
      Blockly.JavaScript.ORDER_NONE) || 'false';
  var branch = Blockly.JavaScript.statementToCode(block, 'DO');
  branch = Blockly.JavaScript.addLoopTrap(branch, block.id);
  if (until) {
    argument0 = 'NOT ' + argument0;
  }
  return 'while ' + argument0 + '\n' + branch + '\nEnd While\n';
};

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
    var block_prefix = "'#" + block.id + "\n";
    var code = block_prefix + 'Program\n';
    for (let variable of Blockly.helperVariables) {
      code += 'Dim ' + variable + ' as long\n';
    }
    code += statements_program + "\nEnd Program\n";
    return code;
};

Blockly.JavaScript['block_var_val'] = function(block) {
  var value_variable = Blockly.JavaScript.valueToCode(block, 'variable', Blockly.JavaScript.ORDER_ATOMIC);
  var value_value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC);
  var code = "'#" + block.id + "\n" + value_variable + ' = ' + value_value + '\n';
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

/*Blockly.JavaScript['block_while'] = function(block) {
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
};*/

Blockly.JavaScript['block_sleep'] = function(block) {
  var text_time = block.getFieldValue('time');
  var code = "'#" + block.id + "\n" + 'Sleep ' + text_time + '\n';
  return code;
};