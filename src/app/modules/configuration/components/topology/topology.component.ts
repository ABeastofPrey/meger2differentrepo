import { Component, OnInit, OnDestroy } from '@angular/core';
import { TopologyService } from '../../services/topology.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { Observable, of as observableOf } from 'rxjs';
import { Either } from 'ramda-fantasy';
import { compose, bind, then } from 'ramda';

export interface DeviceNode {
    name: string;
    children?: DeviceNode[];
}

/** Flat node with expandable and level information */
export class FileFlatNode {
    name: string;
    level: number;
    expandable: boolean;
}

const getLevel = (node: FileFlatNode) => node.level;
const isExpandable = (node: FileFlatNode) => node.expandable;
const getChildren = (node: DeviceNode): Observable<DeviceNode[]> => observableOf(node.children);
const transformer = (node: DeviceNode, level: number) => {
    let flatNode = new FileFlatNode();
    flatNode.name = node.name;
    flatNode.level = level;
    flatNode.expandable = !!node.children && node.children.length > 0;
    return flatNode;
};
const treeFlattener = new MatTreeFlattener(transformer, getLevel, isExpandable, getChildren);

@Component({
    selector: 'app-topology',
    templateUrl: './topology.component.html',
    styleUrls: ['./topology.component.scss']
})
export class TopologyComponent implements OnInit, OnDestroy {

    public treeControl: FlatTreeControl<FileFlatNode>;

    public dataSource: MatTreeFlatDataSource<DeviceNode, FileFlatNode>;

    public hasChild = (_: number, nodeData: FileFlatNode) => nodeData.expandable;

    constructor(private service: TopologyService) {
        this.treeControl = new FlatTreeControl<FileFlatNode>(getLevel, isExpandable);
        this.dataSource = new MatTreeFlatDataSource(this.treeControl, treeFlattener);
    }

    async ngOnInit(): Promise<void> {
        await this.retrieveAndAssemble();
        setTimeout(() => { this.treeControl.expandAll(); }, 50);
    }

    ngOnDestroy(): void {
        // nothing todo currently.
    }

    private async retrieveAndAssemble(): Promise<void> {
        const retrieveTopology = bind(this.service.getDeviceTopology, this.service);
        const logError = err => console.warn('Retrieve device topology failed: ' + err);
        const assemble = res => this.dataSource.data = res;
        const logOrAssemble = Either.either(logError, assemble);
        const doIt = compose(then(logOrAssemble), retrieveTopology);
        doIt();
    }
}
