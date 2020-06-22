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

    async goToError(err: string) {
        if (!this.login.isAdmin && !this.login.isSuper) return;
        const i = err.lastIndexOf('/');
        const path = i === -1 ? '' : err.substring(0,i+1);
        const name = err.substring(i+1);
        this.prg.mode = 'editor';
        const ret = await this.router.navigateByUrl('/projects');
        if (ret === false) return;
        this.mgr.screen = this.mgr.screens[2];
        await this.prg.setModeToggle('mc');
        this.prg.setFile(name, path, null, -1);
    }
}
