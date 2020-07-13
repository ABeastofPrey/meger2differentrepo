import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
// import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { TraceService } from '../../../services/trace.service';
import { isEmptyString, isNotUndefined } from 'ramda-adjunct';

export interface Item {
    module: string;
    variable: string;
    turnOn?: 0 | 1;
    isIO: boolean;
    disabled: boolean;
}

const isSelectedItem = (x: Item, arr: Item[]) => {
    return arr.findIndex(a => a.module === x.module && a.variable === x.variable) !== -1;
};

@Component({
    selector: 'app-trace-trigger',
    templateUrl: './trace-trigger.component.html',
    styleUrls: ['./trace-trigger.component.scss']
})
export class TraceTriggerComponent implements OnInit {
    public selectedTrace: string = '';
    public moduleList: string[] = [];
    public selectedModule: string = '';

    public todoItems: Item[] = [];
    public doneItems: Item[] = [];

    constructor(private service: TraceService, private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit(): void {
        this.service.getSelectedTraceName().subscribe(trace => {
            this.selectedTrace = trace;
            if (isEmptyString(trace)) return; // If there is no selected trace, then trigger can not use.
            this.service.getModuleList('TRIGGER').subscribe(modules => {
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
    //     const isIt = x => x.module === dragItem.module && x.variable === dragItem.variable;
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
        this.service.selectOne(this.selectedTrace, 'TRIGGER', this.selectedModule, item.variable, item.turnOn).subscribe(success => {
            this.getData();
        });
    }

    public unselectOne(item: Item): void {
        this.service.unselectOne(this.selectedTrace, 'TRIGGER', item.module, item.variable, item.turnOn).subscribe(success => {
            this.getData();
        });
    }

    public unselectAll(): void {
        this.service.unselectAll(this.selectedTrace, 'TRIGGER').subscribe(success => {
            this.getData();
        });
    }

    private getData(): void {
        const findInSelected = (x: Item, arr: Item[]) => {
            const finded = arr.find(a => a.variable === x.variable);
            return isNotUndefined(finded) ? finded.turnOn : 1;
        }
        this.service.getTodoDoneList('TRIGGER', this.selectedModule, this.selectedTrace).subscribe(([available, selected]) => {
            this.todoItems = available.map(x => ({
                module: this.selectedModule,
                variable: x.variable,
                isIO: x.isIO,
                turnOn: findInSelected(x, selected),
                disabled: isSelectedItem(x, selected),
            }));
            this.doneItems = selected.map((x: Item) => ({
                module: x.module,
                variable: x.variable,
                isIO: x.isIO,
                turnOn: x.turnOn,
                disabled: true,
            }));
            this.changeDetectorRef.detectChanges();
        });
    }

    ngOnDestroy(): void {
        const elements: HTMLCollectionOf<Element> = document.getElementsByTagName("app-trace-trigger");
        for(let i=0;i<elements.length;i++){
            elements[i].parentNode.removeChild(elements[i]);
        }
    }
}
