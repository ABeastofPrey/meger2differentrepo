import { Component, OnInit } from '@angular/core';
// import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { TraceService } from '../../../services/trace.service';
import { isEmptyString, isNotUndefined } from 'ramda-adjunct';

export interface Item {
    module: string;
    variable: string;
    turnOn?: 0 | 1 | 2 | 3 | 4;
    isIO: boolean;
    disabled: boolean;
    axis1Disabled: boolean;
    axis2Disabled: boolean;
    axis3Disabled: boolean;
    axis4Disabled: boolean;
}

const isSelectedItem = (x: Item, arr: Item[]) => {
    return arr.findIndex(a => a.module === x.module && a.variable === x.variable) !== -1;
};
const isAllSelectedItem = (x: Item, arr: Item[]) => {
    return arr.filter(a => a.module === x.module && a.variable === x.variable).length === 4;
};
const firstSelectedItemAxis = (x: Item, arr: Item[]) => {
    const finded = arr.filter(a => a.module === x.module && a.variable === x.variable);
    if (finded.length === 0) return 1;
    const ordered = finded.sort((a, b) => b.turnOn - a.turnOn);
    const maxAxis = ordered[0].turnOn;
    return maxAxis === 4 ? 0 : maxAxis + 1;
};

@Component({
    selector: 'app-trace-channel',
    templateUrl: './trace-channel.component.html',
    styleUrls: ['./trace-channel.component.scss']
})
export class TraceChannelComponent implements OnInit {
    public selectedTrace: string = '';
    public moduleList: string[] = [];
    public selectedModule: string = '';
    public todoItems: Item[] = [];
    public doneItems: Item[] = [];

    constructor(private service: TraceService) { }

    ngOnInit(): void {
        this.service.getSelectedTraceName().subscribe(trace => {
            this.selectedTrace = trace;
            if (isEmptyString(trace)) return; // If there is no selected trace, then trigger can not use.
            this.service.getModuleList('CHANNEL').subscribe(modules => {
                this.moduleList = modules;
                this.selectedModule = modules[0];
                this.getData();
            });
        });
    }

    // public dragDrop(event: CdkDragDrop<Item[]>): void {
    //     const { previousIndex, currentIndex, previousContainer, container } = event;
    //     if (previousContainer === container) return;
    //     const dragItem: Item = event.previousContainer.data[previousIndex];
    //     const isIt = x => x.module === dragItem.module && x.variable === dragItem.variable && x.turnOn === dragItem.turnOn;
    //     const isFromSelected = this.doneItems.findIndex(isIt) !== -1;
    //     transferArrayItem(previousContainer.data, container.data, previousIndex, currentIndex);
    //     if (isFromSelected) {
    //         this.unselectOne(dragItem);
    //     } else {
    //         this.selectOne(dragItem);
    //     }
    // }

    public changeModule(): void {
        this.getData();
    }

    public selectOne(item: Item): void {
        if (item.turnOn === 0) {
            this.service.selectAllAxies(this.selectedTrace, 'CHANNEL', this.selectedModule, item.variable).subscribe(success => {
                this.getData();
            });
        } else {
            this.service.selectOne(this.selectedTrace, 'CHANNEL', this.selectedModule, item.variable, item.turnOn).subscribe(success => {
                this.getData();
            });
        }
    }

    public unselectOne(item: Item): void {
        this.service.unselectOne(this.selectedTrace, 'CHANNEL', item.module, item.variable, item.turnOn).subscribe(success => {
            this.getData();
        });
    }

    public unselectAll(): void {
        this.service.unselectAll(this.selectedTrace, 'CHANNEL').subscribe(success => {
           this.getData();
        });
    }

    private getData(): void {
        const findInSelected = (x: Item, arr: Item[], axis: number) => {
            const finded = arr.filter(a => a.variable === x.variable);
            return isNotUndefined(finded) ? (finded.findIndex(b => b.turnOn === axis) !== -1) : false;
        };
        this.service.getTodoDoneList('CHANNEL', this.selectedModule, this.selectedTrace).subscribe(([available, selected]) => {
            this.todoItems = available.map(x => ({
                module: this.selectedModule,
                variable: x.variable,
                isIO: x.isIO,
                turnOn: x.isIO ? firstSelectedItemAxis(x, selected) as any: 1,
                disabled: x.isIO ? isAllSelectedItem(x, selected) : isSelectedItem(x, selected),
                axis1Disabled: findInSelected(x, selected, 1),
                axis2Disabled: findInSelected(x, selected, 2),
                axis3Disabled: findInSelected(x, selected, 3),
                axis4Disabled: findInSelected(x, selected, 4),
            }));
            this.doneItems = selected.map((x: Item) => ({
                module: x.module,
                variable: x.variable,
                isIO: x.isIO,
                turnOn: x.turnOn,
                disabled: true,
                axis1Disabled: true,
                axis2Disabled: true,
                axis3Disabled: true,
                axis4Disabled: true,
            }));
        });
    }
}
