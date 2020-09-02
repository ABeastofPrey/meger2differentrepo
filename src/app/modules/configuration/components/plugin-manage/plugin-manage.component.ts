import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { MatSort, MatTableDataSource, PageEvent, MatDialog } from '@angular/material';
import { LoginService, WebsocketService } from '../../../../modules/core';
import { Collation, PMINFO, PageSet } from '../../services/plugin.manage.enum';
import { PluginManageService } from '../../services/plugin.manage.service';
import { SysLogSnackBarService } from '../../../sys-log/services/sys-log-snack-bar.service';
import { LangService } from '../../../core/services/lang.service';
import { PluginManagePopService } from '../../services/plugin.manage.pop.service';

@Component({
    selector: 'app-plugin-manage',
    templateUrl: './plugin-manage.component.html',
    styleUrls: ['./plugin-manage.component.scss']
})
export class PluginManageComponent implements OnInit {
    constructor(
        private login: LoginService,
        private pms: PluginManageService,
        private pmsp: PluginManagePopService,
        private snackbarService: SysLogSnackBarService,
        private cdRef: ChangeDetectorRef,
        private lang: LangService) { }

    @ViewChild(MatSort, { static: false }) sort: MatSort;
    @ViewChild("selectPlugin", { static: false }) selectPlugin: ElementRef;
    @ViewChild("refreshData", { static: false }) refreshData: ElementRef;

    public displayedColumns: string[] = ['Name', 'Version', 'Date', 'State'];
    public dataSource = new MatTableDataSource([]);
    public allTableData: PMINFO[] = [];
    public tableData: PMINFO[] = [];
    public isAdmin: boolean;
    public langType: string = "en";
    public uninstallPluginName: string;
    public defaultSort: Collation = { "active": "date", "direction": "asc" };
    public defaultPage: PageSet = { "pageIndex": 0, "pageSize": 10 };

    ngOnInit(): void {
        this.langType = this.lang.getLang();
        this.isAdmin = this.login.isAdmin;
        this.isAdmin ? this.displayedColumns.push("manipulate") : "";
        this.pms.isConnected().subscribe(stat => {
            stat ? this.getPluginsList() : "";
        });
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.sort.sortChange.subscribe((sortType: Collation) => {
            this.defaultSort = sortType;
            this.tableDataSort(sortType.active, sortType.direction);
        })
    }

    private getPluginsList(): void {
        this.pms.getPluginsList().subscribe((result) => {
            this.allTableData = result;
            this.tableData = this.allTableData.slice(0, 10);
            this.tableDataSort("Date", "asc");
        })
    }

    public changePage({ pageIndex, pageSize }: PageEvent): void {
        this.defaultPage = { "pageIndex": pageIndex, "pageSize": pageSize };
        const strIndex = pageIndex * pageSize;
        const endIndex = strIndex + pageSize;
        this.tableData = this.allTableData.slice(strIndex, endIndex);
        this.tableDataSort(this.defaultSort.active, this.defaultSort.direction);
    }

    public tableDataSort(field: string, type: string): void {
        if (!type) {
            field = "Date";
            type = "asc";
        }
        this.tableData.sort((first: PMINFO, second: PMINFO) => {
            let sortNum: number;
            (type === "desc") ? (sortNum = first[field] < second[field] ? 1 : -1) : (sortNum = first[field] < second[field] ? -1 : 1);
            first[field] === second[field] ? sortNum = 0 : "";
            return sortNum;
        })
        // this.cdRef.detectChanges();
        setTimeout(() => {
            this.refreshData.nativeElement.click();
        }, 0);
    }

    public uninstall(e: Event, name: string): void {
        e.stopPropagation();
        this.uninstallPluginName = name;
        const unReadyTips = "pluginInstall.unReady";
        this.pms.unInStallIsReady().subscribe((result: number) => {
            (result === 1) ? this.selectPlugin.nativeElement.click() : this.snackbarService.openTipSnackBar(unReadyTips);
        })
    }

    public unInstallPop(name: string): void {
        this.pmsp.unInstallPop(name).subscribe((res) => {
            res ? this.pms.startUninstallPlugin(name, this.unLoadResult.bind(this)) : "";
        });
    }

    public unLoadResult(result: boolean): void {
        if (result) {
            this.pms.setUnPluginInstallResult(1);
            this.pms.getPluginsList().subscribe((result) => {
                this.allTableData = result;
                this.changePage(this.defaultPage as PageEvent);
            })
        } else {
            this.pms.setUnPluginInstallResult(0);
        }
    }

    public refreshTable(): void {
        
    }

}
