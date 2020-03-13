import { Component, OnInit, Input } from '@angular/core';
import { SystemLog } from '../../enums/sys-log.model';
import { LoginService, ScreenManagerService } from '../../../core';
import { Router } from '@angular/router';
import { ProgramEditorService } from '../../../program-editor/services/program-editor.service';

@Component({
    selector: 'app-log-mc-info',
    templateUrl: './log-mc-info.component.html',
    styleUrls: ['./log-mc-info.component.scss']
})
export class LogMCInfoComponent implements OnInit {
    @Input() log: SystemLog;

    constructor(
        public login: LoginService,
        private mgr: ScreenManagerService,
        private router: Router,
        private prg: ProgramEditorService,) { }

    ngOnInit(): void { }

    public goToError(err: string): void {
        let path = err.substring(11);
        path = path.substring(0, path.lastIndexOf('/')) + '/';
        const fileName = err.substring(err.lastIndexOf('/') + 1);
        this.mgr.screen = this.mgr.screens[2];
        this.router.navigateByUrl('/projects');
        this.prg.setFile(fileName, path, null, -1);
        this.prg.mode = 'editor';
    }
}
