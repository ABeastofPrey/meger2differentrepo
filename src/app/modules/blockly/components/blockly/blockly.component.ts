import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {Subscription} from 'rxjs';
import {MatSnackBar} from '@angular/material';
import {ApiService, MCFile, imgPath} from '../../../../modules/core/services/api.service';
import {BlocklyService} from '../../services/blockly.service';
import {WebsocketService, MCQueryResponse} from '../../../../modules/core/services/websocket.service';
import {ProgramStatus, TASKSTATE_RUNNING, TRNERRLine} from '../../../program-editor/services/program-editor.service';

declare var Blockly:any

@Component({
  selector: 'blockly',
  templateUrl: './blockly.component.html',
  styleUrls: ['./blockly.component.css']
})
export class BlocklyComponent implements OnInit {
  
  @ViewChild('editor') editorDiv : ElementRef;
  @ViewChild('toolbox') toolbox : ElementRef;
  
  private workspace : any;
  private fileSub : Subscription;
  private statSub : Subscription;
  private errSub : Subscription;
  private prevStat : number = null;
  
  // EXTERNAL BLOCKS
  private externalBlocks : any = null;
  private blockLibs : string[];
  private newToolboxCategory : string = "<category name='Custom'>";
  private customBlockIndex : number = 0;

  constructor(
    private api : ApiService,
    public service : BlocklyService,
    private snack : MatSnackBar,
    private ws : WebsocketService) {
  }

  ngOnInit() {
    this.initBlockly();
    this.fileSub = this.service.onFileChange.subscribe((content:string)=>{
      if (content) { // FILE OPENED
        try {
          let xml = Blockly.Xml.textToDom(content);
          Blockly.Xml.domToWorkspace(xml, this.workspace);
          var blocks:any[] = this.workspace.getAllBlocks();
          blocks.forEach((block,i)=>{
            if (!block.isErrorBlock)
              block.originalColor = block.getColour();
          });
        } catch (err) {
          this.service.close(true);
          this.snack.open('INVALID FILE','',{duration: 2000});
        }
      } else { // FILE CLOSED
        if (this.workspace)
          this.workspace.clear();
        this.prevStat = null;
      }
    });
    this.statSub = this.service.statusChange.subscribe((stat:ProgramStatus)=>{
      let isChanged: boolean = this.prevStat !== stat.statusCode;
      if (isChanged)
        this.prevStat = stat.statusCode;
      if (stat.statusCode !== TASKSTATE_RUNNING && isChanged) // NOT RUNNING
        this.restoreColors();
      else if (stat.statusCode === TASKSTATE_RUNNING)
        this.onBlocklyRunning(stat);
    });
    this.errSub = this.service.errLinesChange.subscribe((lines:TRNERRLine[])=>{
      let codeLines: string[] = this.getCode().split('\n');
      for (let line of lines) {
        line.number--;
        if (codeLines[line.number-1] !== undefined &&
          codeLines[line.number-1].trim().substr(0,2) === "'#") {
          let id = codeLines[line.number-1].trim().substr(2);
          let block = this.workspace.getBlockById(id);
          if (block !== null) {
            if (typeof block.originalTooltip === 'undefined')
              block.originalTooltip = block.tooltip;
            block.tooltip = line.error;
            block.isErrorBlock = true;
            block.setColour("#ff0000");
          } else {
            console.log('CANT FIND BLOCK FOR ERROR: ' + line.error);
          }
        } else {
          console.log('CANT FIND BLOCK FOR ERROR: ' + line.error);
        }
      }
    });
  }
  
  ngOnDestroy() {
    this.fileSub.unsubscribe();
    this.statSub.unsubscribe();
    this.errSub.unsubscribe();
  }

  initBlockly() {
    this.initExternalBlocks();
    this.loadBlocklyfiles().then(()=>{
      Blockly.selectedRobot = 'PUMA';
      this.workspace = Blockly.inject(this.editorDiv.nativeElement,
        {toolbox: this.toolbox.nativeElement});
      Blockly.WorkspaceSvg.prototype.preloadAudio_ = function() {};
      Blockly.svgResize(this.workspace);
      this.workspace.addChangeListener(event=>{
        this.onBlocklyChange();
      });
      this.workspace.registerButtonCallback("createVar", ()=>{
        Blockly.Variables.createVariable(this.workspace);
      });
      if (this.service.BlkContent) {
        let content = this.service.BlkContent;
        try {
          let xml = Blockly.Xml.textToDom(content);
          Blockly.Xml.domToWorkspace(xml, this.workspace);
          var blocks:any[] = this.workspace.getAllBlocks();
          blocks.forEach((block,i)=>{
            if (!block.isErrorBlock)
              block.originalColor = block.getColour();
          });
        } catch (err) {
          this.service.close(true);
          this.snack.open('INVALID FILE','',{duration: 2000});
        }
      }
    });
  }
  
  getCode() {
    Blockly.currBlocklySubs = [];
    let code : string = Blockly.JavaScript.workspaceToCode(this.workspace);
    this.blockLibs.forEach((libFile)=>{
      code = 'import ' + libFile + '\n' + code;
    });
    let lines = code.split("\n");
    let i = lines.length;
    while (i--) {
      if (lines[i].trim().substr(0,3) === "var")
        lines.splice(i,3);
    }
    return lines.join("\n");
  }
  
  onBlocklyChange() {
    this.service.generatedText = this.getCode();
    let xml = Blockly.Xml.workspaceToDom(this.workspace);
    var xml_text = Blockly.Xml.domToText(xml);
    this.service.BlkContent = xml_text;
  }
  
  restoreColors(colorBlock?:any,colorBlock2?:any) {
    if (typeof this.workspace === 'undefined')
      return;
    var blocks : any[] = this.workspace.getAllBlocks();
    blocks.forEach((block, index)=>{
      if (colorBlock !== undefined && colorBlock.id === block.id) {
        colorBlock.setColour("#00ff00");
      } else if (colorBlock2 !== undefined && colorBlock2.id === block.id) {
        colorBlock2.setColour("#ff6600");
      } else if (block.originalColor !== undefined &&
          block.getColour() !== block.originalColor) {
        block.setColour(block.originalColor);
      }
    });
  }
  
  onBlocklyRunning(stat:ProgramStatus) {
    let code : string = this.getCode();
    if (typeof code === 'undefined')
      return;
    let codeLines = code.split("\n");
    if (codeLines[stat.programLine-1] !== undefined && codeLines[stat.programLine-1].trim().substr(0,2) === "'#") {
      let id = codeLines[stat.programLine-1].trim().substr(2);
      let block = this.workspace.getBlockById(id);
      if (block !== null) {
        this.ws.query('backtrace blockly.prg').then((result: MCQueryResponse)=>{
          if (!new BackTraceParser(result.result).isInSameFile)
            this.restoreColors(block);
          else {
            if (stat.programLine === stat.sourceLine)
              this.restoreColors(block); // paints the block in green
            else {
              if (codeLines[stat.sourceLine-1] !== undefined && codeLines[stat.sourceLine-1].trim().substr(0,2) === "'#") {
                id = codeLines[stat.sourceLine-1].trim().substr(2);
                let block2 = this.workspace.getBlockById(id);
                if (block2 !== null) {
                  this.restoreColors(block,block2); // paints the block in green and block2 in orange
                } else
                  this.restoreColors(block);
              } else
                  this.restoreColors(block);
            }
          }
        });
      }
    }
  }
  
  private initExternalBlocks() {
    if (this.externalBlocks === null)
      return;
    let data = this.externalBlocks;
    let newToolboxCategory = "";
    try {
      data.forEach((category)=>{
        newToolboxCategory += "<category name='" + category.category + "'>";
        category.subs.forEach(function(subcategory){
          newToolboxCategory += "<category name='" + subcategory.subName + "'>";
          subcategory.blocks.forEach(function(block){
            Blockly.Blocks[block.type] = {
              init: function() {
                this.jsonInit(block);
              }
            };
            Blockly.JavaScript[block.type] = function(blockObject) {
              var code = block.code;
              block.args0.forEach(function(varMap_var){
                var stringToReplace = "%" + varMap_var.name;
                var re = new RegExp(stringToReplace,"g");
                var stringToReplaceTo = null;
                switch (varMap_var.type) {
                  case "input_dummy":
                    break;
                  case "field_variable":
                    stringToReplaceTo = Blockly.JavaScript.variableDB_.getName(
                        blockObject.getFieldValue(varMap_var.name),
                        Blockly.Variables.NAME_TYPE
                    );
                    break;
                  case "input_statement":
                    stringToReplaceTo = Blockly.JavaScript.statementToCode(
                        blockObject,
                        varMap_var.name
                    );
                    break;
                  default:
                    stringToReplaceTo = blockObject.getFieldValue(
                       varMap_var.name
                    );
                    break;
                }
                if (stringToReplaceTo === null)
                  return;
                code = code.replace(re,stringToReplaceTo);
              });
              var codeLines = code.split('\n');
              code = "";
              codeLines.forEach(function(line){
                code += "'#" + blockObject.id + "\n" + line + "\n";
              });
              return code;
            };
            newToolboxCategory += "<block type='" + block.type + "'></block>";
          });
          newToolboxCategory += "</category>";
        });
        newToolboxCategory += "</category>";
      });
      this.toolbox.nativeElement.innerHTML += newToolboxCategory;
    } catch (err) {
      console.log("error in blocks definition - blocks wasn't loaded");
    }
  }
  
  private loadBlocklyfiles() {
    this.blockLibs = [];
    let files : MCFile[];
    return this.api.getFiles('LIB').then((ret:MCFile[])=>{      
      files = ret;
      let promises : Promise<any>[] = [];
      for (let f of ret) {
        promises.push(this.api.getFile(f.fileName));
      }
      return Promise.all(promises);
    }).then((results:string[])=>{
      results.forEach((content,index)=>{
        if (this.convertFileToBlock(content)) {
          this.ws.query('unload ' + files[index].fileName).then(()=>{
            this.ws.query('load ' + files[index].fileName).then((ret: MCQueryResponse)=>{
              this.blockLibs.push(files[index].fileName);
            });
          });
        }
      });
      this.newToolboxCategory += "</category>";
      this.toolbox.nativeElement.innerHTML += this.newToolboxCategory;
    });
  }
  
  private convertFileToBlock(fileContent:string) {
    // get library name
    let libName = fileContent.split('\n')[1];
    if (typeof libName === 'undefined' || libName.indexOf('libName') === -1)
      return false;
    libName = libName.substring(9);
    this.newToolboxCategory += "<category name='" + libName + "'>";
    let subs : Sub[] = this.getSubsFromFile(fileContent);
    for (let i=0; i<subs.length; i++) {
      let sub = subs[i];
      let title = sub.title || sub.name;
      var currParamIndex = 1;
      var args = [];
      var blockContent = title;
      if (sub.icon) {
        blockContent = '%' + (currParamIndex++) + ' ' + blockContent;
        args.push({
          type: 'field_image',
          src: sub.icon,
          width: sub.iconSize,
          height: sub.iconSize,
          alt:''
        });
      }
      for (let paramName in sub.params) {
        var param = sub.params[paramName];
        var prompt = param.prompt || (paramName + ': ');
        blockContent += 
          ' %' + (currParamIndex++) + ' ' + prompt + ' %' + (currParamIndex++);
        args.push({type: 'input_dummy'});
        if (param.inputType === 'var')
          args.push({type: 'field_variable', name: paramName, variable: null});
        else if (param.inputType === 'checkbox')
          args.push({type: 'field_checkbox', name: paramName, checked: false});
        else if (param.inputType === 'checkbox true')
          args.push({type: 'field_checkbox', name: paramName, checked: true});
        else if (param.inputType && param.inputType.indexOf('options') === 0) {
          var options = 
            param.inputType.substring(8,param.inputType.length-1).split(',');
          var blockOptions = [];
          for (var j=0; j<options.length; j++) {
            var option = options[j].trim();
            blockOptions.push([option,option]);
          }
          args.push({
            type: 'field_dropdown',
            name: paramName,
            options: blockOptions
          });
        }
        else {
          args.push(
            {
              type: 'field_input',
              name: paramName,
              text: '',
              varType: param.type
            }
          );
        }
      }
      let jsonBlock = {
        "type": 'block_custom_' + (this.customBlockIndex++),
        "message0": blockContent,
        "args0": args,
        "colour": sub.color,
        "tooltip": '',
        "helpUrl": '',
        "previousStatement": null,
        "nextStatement": null,
      };
      Blockly.Blocks[jsonBlock.type] = {
        init: function() {
          this.jsonInit(jsonBlock);
          this.args = args;
        }
      };
      Blockly.JavaScript[jsonBlock.type] = function(block) {
        var args : any[] = block.args;
        var params = '';
        if (args.length > 0) {
          params = '(';
          args.forEach(function(arg, index){
            if (arg.type === 'field_input' || arg.type === 'field_dropdown') {
              if (arg.varType === 'string')
                params += '"' + block.getFieldValue(arg.name) + '"';
              else
                params += block.getFieldValue(arg.name);
            }
            else if (arg.type === 'field_checkbox') {
              var result = block.getFieldValue(arg.name) === 'TRUE' ? 1 : 0;
              params += result;
            }
            else if (arg.type === 'field_variable') {
              params += 
                Blockly.JavaScript.variableDB_.getName(
                  block.getFieldValue(arg.name),
                  Blockly.Variables.NAME_TYPE
                );
            }
            if (
                arg.type !== 'field_image' &&
                arg.type.indexOf('field') === 0 &&
                index < args.length - 1
            ) {
              params += ',';
            }
          });
          params += ')';
          if (params === '()')
            params = '';
        }
        var code = "'#" + block.id + '\ncall ' + sub.name + params + '\n';
        return code;
      };
      this.newToolboxCategory += "<block type='" + jsonBlock.type + "'></block>";
    }
    this.newToolboxCategory += "</category>";
    return true;
  }
  
  private getSubsFromFile(fileContent: string) : Sub[] {
    let subs : Sub[] = [];
    let text : string[] = fileContent.split('\n');
    let title : string = null;
    let currSub : string = null;
    let params : Param[] = [];
    let index : number = -1;
    let path : string = null;
    let color : number = 285;
    let iconSize : number = 15;
    for (let i=0; i<text.length; i++) {
      text[i] = text[i].trim();
      if (title === null && text[i].indexOf("'title") === 0) {
        index = text[i].indexOf('"');
        if (index > -1) {
          title = text[i].substring(index+1);
          index = title.indexOf('"');
          if (index > -1)
            title = title.substring(0,index);
          else
            title = null;
        }
      } else if (path === null && text[i].indexOf("'icon") === 0) {
        index = text[i].indexOf('"');
        if (index > -1) {
          path = text[i].substring(index+1);
          index = path.indexOf('"');
          if (index > -1) {
            if (path.substring(index).length > 1) {
              iconSize = Number(path.substring(index+1));
              if (isNaN(iconSize))
                iconSize = 15;
            }
            path = imgPath + path.substring(0,index);
          } else
            path = null;
        }
      } else if (text[i].indexOf("'color") === 0) {
        text[i] = text[i].substring(7);
        color = Number(text[i]);
        if (isNaN(color))
          color = 285;
      } else if (text[i].indexOf("'param") === 0) {
        text[i] = text[i].substring(7);
        index = text[i].indexOf(' ');
        if (index > -1) {
          var name = text[i].substring(0, index);
          index = text[i].indexOf('"');
          if (index > -1) {
            var prompt = text[i].substring(index+1);
            index = prompt.indexOf('"');
            if (index > -1) {
              prompt = prompt.substring(0,index);
              if (params[name])
                params[name].prompt = prompt;
            }
          }
          var inputType = 'text';
          index = text[i].indexOf('as');
          if (index > -1)
            inputType = text[i].substring(index+3).trim().toLowerCase();
          if (params[name])
            params[name].inputType = inputType;
        }
      } else if (currSub === null && text[i].indexOf("public sub") === 0) {
        text[i] = text[i].substring(11);
        index = text[i].indexOf('(');
        if (index > -1) {
          currSub = text[i].substring(0,index).trim();
          // PARSE PARAMETERS
          var index2 = text[i].indexOf(')');
          if (index > -1 && index2 > -1) {
            var subParams = text[i].substring(index+1,index2).split(',');
            for (var j=0; j<subParams.length; j++) {
              // remove 'byval' if exists
              var paramValue = subParams[j].replace('byval ','').trim();
              index = paramValue.indexOf('as');
              if (index > -1) {
                let param : Param = new Param();
                param.name = paramValue.substring(0,index).trim();
                param.type = paramValue.substring(index+3);
                params[param.name] = param;
              }
            }
          } else {
            currSub = null;
            params = [];
          }
        } else {
          currSub = text[i].trim();
        }
      } else if (currSub !== null && text[i].indexOf("end sub") === 0) {
        let sub : Sub = new Sub();
        sub.name = currSub;
        sub.params = params;
        sub.title = title;
        sub.icon = path;
        sub.iconSize = iconSize;
        sub.color = color;
        subs.push(sub);
        params = [];
        title = null;
        currSub = null;
        path = null;
      }
    }
    return subs;
  }

}

class BackTraceParser {
  
  lines : Line[] = [];
  isInSameFile : boolean = true;
  
  constructor(text : string) {
    var lines = text.split('\n');
    var firstLine = lines[0].split(' ');
    var currFile = firstLine[1];
    for (var i=1; i<lines.length; i++) {
      var line = new Line(lines[i]);
      this.lines.push(line);
      if (line.file !== currFile)
        this.isInSameFile = false;
    }
  }
  
}

class Line {
  line : number;
  file : string;
  constructor(text : string) {
    var lines = text.split(':');
    lines[1] = lines[1].trim();
    lines[2] = lines[2].trim();
    var index = lines[1].indexOf(' ');
    var line = parseInt(lines[1].substring(0,index));
    this.line = isNaN(line) ? -1 : line;
    index = lines[2].indexOf('Sub');
    this.file = lines[2].substring(0,index).trim();
  }
}

class Sub {
  name: string;
  params: Param[];
  title: string;
  icon: string;
  iconSize: number;
  color: number;
}

class Param {
  name: string;
  type: string;
  inputType: string;
  prompt: string;
}