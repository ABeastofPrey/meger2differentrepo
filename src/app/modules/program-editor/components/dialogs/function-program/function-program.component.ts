import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MatTable, MAT_DIALOG_DATA } from '@angular/material';
import { ProgramEditorService } from '../../../services/program-editor.service';

interface VariableList {
    "VariableName": FormControl;
    "VariableType": string;
    "operation": string;
}
interface DataTypeList {
    "value": string;
    "text": string;
}

@Component({
    selector: 'app-function-program',
    templateUrl: './function-program.component.html',
    styleUrls: ['./function-program.component.scss']
})
export class FunctionProgramComponent implements OnInit {

    constructor(
        private prg: ProgramEditorService,
        public dialogRef: MatDialogRef<FunctionProgramComponent>,
        @Inject(MAT_DIALOG_DATA) public data: {
            title: string
        }
    ) { }

    @ViewChild('parameterTable', { static: false })
    'parameterTable': MatTable<VariableList>;

    public existParameter: string[] = [];
    public dataType: DataTypeList[] = [
        { "value": "long", "text": "Long" }, { "value": "double", "text": "Double" }, { "value": "string", "text": "String" },
        { "value": "generic joint", "text": "Generic joint" }, { "value": "generic location", "text": "Generic location" }
    ];
    public returnType: string = "long";
    public functionName: FormControl = new FormControl('', [Validators.required, this.validFirstLetter()]);
    public displayedColumns: string[] = ['VariableName', 'VariableType', 'delete'];
    public dataSource: VariableList[] = [];
    public ULB_LIB_End: boolean;
    public parameterValid: boolean = true;
    public isParameterEmpty: boolean = false;

    ngOnInit() {
        this.ULB_LIB_End = this.prg.activeFile.endsWith(".ULB") || this.prg.activeFile.endsWith(".LIB");
    }

    private validFirstLetter(): ValidatorFn {
        return ({ value }: AbstractControl) => {
            let reg = /^[a-zA-Z]/;
            return (reg.test(value) ? null : { "letter": "letter" })
        }
    }

    private validExist(): ValidatorFn {
        return ({ value }: AbstractControl) => {
            let existList = this.existParameter.filter((data) => {
                return data === (value.toUpperCase())
            })
            return ((existList.length === 0) ? null : { "exist": "exist" })
        };
    }

    public changeInput(e: any): void {
        const [validName] = e.target.value.match(/[a-zA-Z0-9_]*/g);
        const functionName: string = validName.slice(0, 32);
        this.functionName.patchValue(functionName);
        this.functionName.markAsTouched();
    }

    public change(value: string): void {
        this.functionName.patchValue(value);
        this.functionName.markAsTouched();
    }

    public addParameter(): void {
        let parameter: VariableList = { "VariableName": new FormControl("", [Validators.required, this.validFirstLetter(), this.validExist()]), "VariableType": "long", "operation": "" };
        this.dataSource.push(parameter);
        this.parameterTable.renderRows();
        let addInputElement: any = document.getElementsByClassName("inputElementParameter")[this.dataSource.length - 1];
        // console.log(addInputElement.getElementsByTagName("input"));
        setTimeout(() => {
            addInputElement.getElementsByTagName("input")[0].click();
            this.changeParameter({target:{value:""}},this.dataSource.length - 1);
        }, 0);
    }

    public deleteParameter(index: number): void {
        this.dataSource.splice(index, 1);
        this.existParameter.splice(index,1);
        this.parameterTable.renderRows();
    }

    public changeParameter(e: any, index: number): void {
        this.isParameterEmpty = false;
        this.existParameter && this.existParameter.splice(0,this.existParameter.length);
        this.dataSource.forEach((item, i) => {
            (i !== index) ? this.existParameter.push(item.VariableName.value.toUpperCase()) : "";
        })
        const [validName] = e.target.value.match(/[a-zA-Z0-9_]*/g);
        const VariableName = validName.slice(0, 32);
        this.dataSource[index].VariableName.patchValue(VariableName);
        this.parameterValid = this.dataSource[index].VariableName.valid;
        this.dataSource[index].VariableName.markAsTouched();
    }

    public blurParameter(index: number): void {
        this.isParameterEmpty = false;
        let inputValid: boolean = this.dataSource[index].VariableName.valid;
        (!inputValid) ? this.dataSource.splice(index, 1) : "";
        this.parameterValid = true;
        this.parameterTable.renderRows();
    }

    public cancel(): void {
        this.dialogRef.close();
    }

    public insert(): void {
        let cmdPara: string = "";
        this.dataSource.forEach(item => {
            cmdPara += `byval ${item.VariableName.value.toLowerCase()} as ${item.VariableType},`
        })
        let cmd: string = "";
        this.ULB_LIB_End ? cmd = "public " : "";
        if (this.dataSource.length > 0) {
            cmd += `function ${this.functionName.value.toLowerCase()}(${cmdPara.slice(0, cmdPara.length - 1)}) as ${this.returnType}\n    'Your code here...\n\nend function`;
        } else {
            cmd += `function ${this.functionName.value.toLowerCase()} as ${this.returnType}\n    'Your code here...\n\nend function`;
        }
        this.dialogRef.close(cmd);
    }

}
