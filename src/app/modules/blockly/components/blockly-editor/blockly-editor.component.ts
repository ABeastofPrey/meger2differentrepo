import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import {MatSnackBar, MatDialog} from '@angular/material';
import {Subscription} from 'rxjs';
import {ProgramEditorService} from '../../../program-editor/services/program-editor.service';
import {DataService, WebsocketService, ApiService, LoginService, MCQueryResponse, MCFile} from '../../../core';
import {AddVarComponent} from '../../../program-editor/components/add-var/add-var.component';
import {ErrorDialogComponent} from '../../../../components/error-dialog/error-dialog.component';

declare var Blockly:any

@Component({
  selector: 'blockly-editor',
  templateUrl: './blockly-editor.component.html',
  styleUrls: ['./blockly-editor.component.css']
})
export class BlocklyEditorComponent implements OnInit {
  
  @ViewChild('toolbox', {static: false}) toolbox : ElementRef;
  
  private blocklyArea : any;
  private blocklyDiv : any;
  private workspace : any;
  private externalBlocks : any = null;
  private blockLibs : string[];
  private newToolboxCategory = "<category name='Custom'>";
  private customBlockIndex = 0;
  private externalBlocksInit = false;
  private prevState : number = null;
  private lastRefreshTime = 0;
  private subscriptions : Subscription[] = [];

  constructor(
    public prg : ProgramEditorService,
    private data : DataService,
    private ws : WebsocketService,
    private api : ApiService,
    private login : LoginService,
    private snack : MatSnackBar,
    private dialog : MatDialog
  ) {
  
  }

  
  private saveBlockColorState() {
    const blocks:any[] = this.workspace.getAllBlocks();
    blocks.forEach((block,i)=>{
      if (!block.isErrorBlock) {
        block.originalColor = block.getColour();
      }
    });
  }
  
  ngOnInit() {
    this.ws.query('?TP_GET_ROBOT_LIST').then((ret: MCQueryResponse)=>{
      if (ret.err || ret.result.length === 0) {
        return;
      }
      const robots = [];
      for (const r of ret.result.split(',')) {
        robots.push([r,r]);
      }
      Blockly.robots = robots;
    });
  }
  ngAfterViewInit() {
    this.initBlockly();
  }
  ngOnDestroy() {
    for (const sub of this.subscriptions) {
      sub.unsubscribe();
    }
  }
  
  initBlockly() {
    // INIT PALLETS
    if (this.data.palletLibVer !== null) {
      const pallets = [];
      const robots = [];
      for (const p of this.data.pallets) {
        pallets.push([p.name, p.name]);
      }
      Blockly.pallets = pallets;
    }
    // INIT GRIPPERS
    let gripperPromise: Promise<any> = Promise.resolve(null);
    if (this.data.gripperLibVer) {
      const grippers : string[] = [];
      gripperPromise = this.ws.query('?grp_get_grippers_list').then((ret: MCQueryResponse)=>{
        for (const ef of ret.result.split(';')) {
          const index = ef.indexOf(':');
          const name = ef.substring(0,index);
          for (const grp of ef.substring(index + 1).split(',')) {
            grippers.push(name+': '+grp);
          }
        }
        Blockly.grippers = grippers;
      });
    }
    Blockly.DataService = this.data;
    this.initExternalBlocks();
    gripperPromise.then(()=>this.loadBlocklyfiles()).then(()=>{
      this.blocklyArea = document.getElementById('blocklyArea');
      this.blocklyDiv = document.getElementById('blocklyDiv');
      this.workspace = Blockly.inject(this.blocklyDiv,
        {toolbox: this.toolbox.nativeElement});
      Blockly.WorkspaceSvg.prototype.preloadAudio_ = function() {};
      this.blocklyOnResize();
      Blockly.svgResize(this.workspace);
      this.workspace.addChangeListener(event=>{
        this.onBlocklyChange(event);
      });
      this.workspace.registerButtonCallback("createVar", ()=>{
        this.dialog.open(AddVarComponent);
      });
    });
  }
  
  private getTrnErr() {
    this.ws.query('?TP_GET_TRNERR').then((ret: MCQueryResponse)=>{
      const trnerr = ret.result;
      const inULB = (trnerr.indexOf(".ULB") > -1);
      const inDEFVAR = (trnerr.indexOf(".DEF")>-1 || trnerr.indexOf(".VAR") > -1);
      const ref = this.dialog.open(ErrorDialogComponent,{
        width: '600px',
        data: {err: trnerr}
      });
      ref.afterClosed().subscribe(()=>{
        this.ws.query("sys.motion = 1");
        this.ws.query("?TP_ERROR_MESSAGE_ACK");
      });
      if (inDEFVAR) {
        // TODO: CLOSE FILE
      } else {
        const errorList = trnerr.split('\n');
        this.getTrnErrLines(errorList);
      }
    });
  }
  
  getTrnErrLines(errorList : string[]) {
    this.ws.query('?TP_GET_TRNERR_LINE_NUMBERS').then((ret : MCQueryResponse)=>{
      const lines = ret.result.split(",");
      lines.forEach((line:string, i : number) => {
        let lineNumber = Number(line);
        if (!isNaN(lineNumber)) {
          lineNumber--;
          const codeLines = this.getCode(true).split('\n');
          if (codeLines[lineNumber-1] !== undefined &&
              codeLines[lineNumber-1].trim().substr(0,2) === "'#") {
            const id = codeLines[lineNumber-1].trim().substr(2);
            const block = this.workspace.getBlockById(id);
            if (block !== null) {
              if (typeof block.originalTooltip === 'undefined') {
                block.originalTooltip = block.tooltip;
              }
              block.tooltip = errorList[i+1];
              block.isErrorBlock = true;
              block.setColour("#ff0000");
            } else {
              console.log('CANT FIND BLOCK FOR ERROR: ' + errorList[lineNumber]);
            }
          } else {
            console.log('CANT FIND BLOCK FOR ERROR: ' + errorList[lineNumber]);
          }
        }
      });
    });
  }
  
  onBlocklyChange(event : any) {
    if (!event) {
      return;
    }
    const prototype = Object.getPrototypeOf(event);
    if (prototype && prototype.type === 'create') {
      
    }
    this.getCode(true);
    const block = this.workspace.getBlockById(event.newValue);
    /*if (event.element==='click' && event.blockId!==screen.optionsForBlock.id) {
      closeSidePanel();
    } else if (
        event.element==='selected' &&
        block !== null && typeof(block.bf1) !== 'undefined') {
      // SELECTED AN ADEPT-CYCLE BLOCK
      block.showProperties();
    }*/
  }
  
  getCode(keepComments : boolean) {
    Blockly.currBlocklySubs = [];
    Blockly.helperVariables = [];
    if (this.workspace === undefined) {
      console.log("Workspace is not defined!");
      return;
    }
    let blocklyCode = Blockly.JavaScript.workspaceToCode(this.workspace);
    /*this.blockLibs.forEach((libFile)=>{
      blocklyCode = 'import ' + libFile + '\n' + blocklyCode;
    });*/
    const lines = blocklyCode.split("\n");
    let i = lines.length;
    while (i--) {
      if (lines[i].trim().substr(0,3) === "var") {
        lines.splice(i,1);
      }
      else if (!keepComments && lines[i].trim().charAt(0) === "'") {
        lines.splice(i,1);
 }
    }
    blocklyCode = lines.join("\n");
    //console.log(blocklyCode);
    return blocklyCode;
  }
  
  blocklyOnResize() {
    let element : any = this.blocklyArea;
    if (typeof element === 'undefined') {
      return;
    }
    let x = 0;
    let y = 0;
    do {
      x += element.offsetLeft;
      y += element.offsetTop;
      element = element.offsetParent;
    } while (element);
    // Position blocklyDiv over blocklyArea.
    this.blocklyDiv.style.left = x + 'px';
    this.blocklyDiv.style.top = y + 'px';
    this.blocklyDiv.style.width = this.blocklyArea.offsetWidth + 'px';
    this.blocklyDiv.style.height = this.blocklyArea.offsetHeight + 'px';
  }
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.blocklyOnResize();
  }

  restoreColors(colorBlock?:any,colorBlock2?:any) {
    if (typeof this.workspace === 'undefined') {
      return;
    }
    const blocks : any[] = this.workspace.getAllBlocks();
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
  
  private initExternalBlocks() {
    if (this.externalBlocks === null || this.externalBlocksInit) {
      return;
    }
    const data = this.externalBlocks;
    let newToolboxCategory = "";
    try {
      data.forEach((category)=>{
        newToolboxCategory += "<category name='" + category.category + "'>";
        category.subs.forEach(function(subcategory){
          newToolboxCategory += "<category name='" + subcategory.subName + "'>";
          subcategory.blocks.forEach(function(block){
            Blockly.Blocks[block.type] = {
              init() {
                this.jsonInit(block);
              }
            };
            Blockly.JavaScript[block.type] = function(blockObject) {
              let code = block.code;
              block.args0.forEach(function(varMap_var){
                const stringToReplace = "%" + varMap_var.name;
                const re = new RegExp(stringToReplace,"g");
                let stringToReplaceTo = null;
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
                if (stringToReplaceTo === null) {
                  return;
                }
                code = code.replace(re,stringToReplaceTo);
              });
              const codeLines = code.split('\n');
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
    if (this.externalBlocksInit) {
      return Promise.resolve();
    }
    this.blockLibs = [];
    let files : MCFile[];
    return this.api.getFiles('LIB').then((ret:MCFile[])=>{
      files = ret;
      const promises : Array<Promise<any>> = [];
      for (const f of ret) {
        promises.push(this.api.getFile(f.fileName));
      }
      return Promise.all(promises);
    }).then((results:string[])=>{
      results.forEach((content,index)=>{
        
      });
      this.newToolboxCategory += "</category>";
      this.toolbox.nativeElement.innerHTML += this.newToolboxCategory;
      this.externalBlocksInit = true;
    });
  }
}
