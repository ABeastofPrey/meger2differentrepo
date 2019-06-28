import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReferenceMasteringService } from '../../services/reference-mastering.service';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar, MatDialog, MatHorizontalStepper, MatSelectChange } from '@angular/material';
import { TpStatService } from '../../../../modules/core/services/tp-stat.service';
import { YesNoDialogComponent } from '../../../../components/yes-no-dialog/yes-no-dialog.component';
import { Either, Maybe } from 'ramda-fantasy';
import { isNilOrEmpty } from 'ramda-adjunct';
import { compose, bind, then, map, addIndex, T, F, ifElse, identity } from 'ramda';
import { TerminalService } from '../../../home-screen/services/terminal.service';

const { Nothing } = Maybe;

interface IAxis {
    index: number;
    position: number;
    offset: number;
}

@Component({
    selector: 'app-reference-mastering',
    templateUrl: './reference-mastering.component.html',
    styleUrls: ['./reference-mastering.component.scss']
})
export class ReferenceMasteringComponent implements OnInit, OnDestroy {
    public isBasicMode: boolean = true;
    public tableColumns: string[] = ['a', 'b', 'c'];
    public tableData: IAxis[] = [];
    public referencePoints: string[] = [];
    public firstFormGroup: FormGroup;
    public secondFormGroup: FormGroup;
    public thirdFormGroup: FormGroup;
    public fourthFormGroup: FormGroup;
    public fifthFormGroup: FormGroup;
    public sixthFormGroup: FormGroup;
    public zeroAxis: string = null;
    public selectedPoint: string;
    public isMoveingComplete: boolean = true;
    public moveCommand: string;
    private subscription: any;
    @ViewChild('stepper') stepper: MatHorizontalStepper;

    public hotJoint(index: number): boolean {
        if (!this.zeroAxis) { return false; }
        return JSON.parse(this.zeroAxis)[index] === 1 ? true : false;
    }

    constructor(
        public stat: TpStatService,
        private service: ReferenceMasteringService,
        private _formBuilder: FormBuilder,
        private trn: TranslateService,
        private dialog: MatDialog,
        private terminalService: TerminalService,
        private snack: MatSnackBar,
        private cd: ChangeDetectorRef
    ) {
        this.subscription = this.terminalService.sentCommandEmitter.subscribe(cmd => {
            this.retrieveData();
        });
    }

    ngOnInit(): void {
        this.firstFormGroup = this._formBuilder.group({
            firstCtrl: ['', Validators.required]
        });
        this.retrieveData();
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
        if(this.stepper.selectedIndex !== 0) {
            this.resetOriginal();
        }
    }

    public canNotUse(): boolean {
        const isNotT1Mode = this.stat.mode !== 'T1';
        const _canNotUse = isNotT1Mode ? true : false;
        return _canNotUse;
    }

    public isInvalidForm(formGroup: FormGroup): boolean {
        return (formGroup.status === 'INVALID') ? true : false;
    }

    public masterZero(): void {
        const callApi = bind(this.service.masterZero, this.service);
        const promptError = () => {
            this.trn.get('robots.mastering.masterZeroWarm').subscribe(word => {
                this.snack.open(word, '', { duration: 1500 });
            });
        };
        const moveToNext = () => this.stepper.next();
        const logOrMove = Either.either(promptError, moveToNext);
        const _masterZero = compose(then(logOrMove), callApi, JSON.parse);
        _masterZero(this.zeroAxis);
    }

    public masterFinal(): void {
        const callApi = bind(this.service.masterFinal, this.service);
        const promptError = () => {
            this.trn.get('robots.mastering.masterFinalWarm').subscribe(word =>
                this.snack.open(word, '', { duration: 1500 })
            );
        };
        const moveToNext = () => this.stepper.next();
        const logOrMove = Either.either(promptError, moveToNext);
        const _masterZero = compose(then(logOrMove), callApi, JSON.parse);
        _masterZero(this.zeroAxis);
    }

    public recordPoint(): void {
        const callApi = bind(this.service.recordPoint, this.service);
        const promptError = () => {
            this.trn.get('robots.mastering.recordPointWarm').subscribe(word => {
                this.snack.open(word, '', { duration: 1500 });
            });
        };
        const moveToNext = () => this.stepper.next();
        const logOrMove = Either.either(promptError, moveToNext);
        const _recordPoint = compose(then(logOrMove), callApi);
        _recordPoint();
    }

    public masterLeftRight(): void {
        const callApi = bind(this.service.masterLeftRight, this.service);
        const promptError = () => {
            this.trn.get('robots.mastering.masterLeftRightWarm').subscribe(word => {
                this.snack.open(word, '', { duration: 1500 });
            });
        };
        const moveToNext = () => this.stepper.next();
        const logOrMove = Either.either(promptError, moveToNext);
        const _masterLeftRight = compose(then(logOrMove), callApi);
        _masterLeftRight();
    }

    public moveToRef(isBasicMode = true): void {
        this.isMoveingComplete = false;
        const moveToRef = this.service.moveToRef.bind(this.service, isBasicMode);
        const isMoveing = bind(this.service.isMoveing, this.service);
        const promptError = () => {
            this.trn.get('robots.mastering.moveToRefWarn').subscribe(word => {
                this.snack.open(word, '', { duration: 1500 });
            });
        };
        const watchMove = () => {
            const watchInterval = setInterval(() => {
                const logError = err => {
                    clearInterval(watchInterval);
                    console.warn('Retrieve robot moveing status failed: ' + err);
                };
                const clearWatch = () => {
                    clearInterval(watchInterval);
                    this.isMoveingComplete = true;
                };
                const checkMoving = ifElse(identity, Nothing, clearWatch);
                const logOrCheck = Either.either(logError, checkMoving);
                const watchMoveing = compose(then(logOrCheck), isMoveing);
                watchMoveing();
            }, 500);
        };
        const logOrMove = Either.either(promptError, watchMove);
        const _moveToRef = compose(then(logOrMove), moveToRef);
        _moveToRef();
    }

    public changeMode(isChanged = false): void {
        this.service.initRobot();
        if (isChanged) {
            this.isBasicMode = !this.isBasicMode;
            this.zeroAxis = null;
            // Set 150mm delay in order to improve user experience when user switchs mode.
            setTimeout(() => {
                this.stepper.next();
            }, 150);
        } else {
            this.stepper.next();
        }
    }

    public async cancel(): Promise<void> {
        this.trn.get([
            'robots.mastering.cancelTitle', 'robots.mastering.cancelWarm',
            'robots.mastering.cancelMsg', 'button.yes', 'button.cancel'
        ]).subscribe(words => {
            this.dialog.open(YesNoDialogComponent, {
                data: {
                    title: words['robots.mastering.cancelTitle'],
                    msg: words['robots.mastering.cancelMsg'],
                    yes: words['button.yes'],
                    no: words['button.cancel']
                },
                disableClose: true,
                width: '500px'
            }).afterClosed().subscribe(async response => {
                if (response) {
                    const preSelectedPoint = this.selectedPoint;
                    const preMode = this.isBasicMode;
                    const res = await this.resetOriginal();
                    if (res) {
                        this.stepper.reset();
                        this.zeroAxis = null;
                        this.isMoveingComplete = true;
                        setTimeout(() => {
                            this.selectedPoint = preSelectedPoint;
                            this.isBasicMode = preMode;
                        }, 0);
                    } else {
                        this.snack.open(words['robots.mastering.cancelWarm'], '', { duration: 1500 });
                    }
                }
            });
        });
    }

    public async stepBackAndReset(): Promise<void> {
        const res = await this.resetOriginal();
        if (res) {
            this.stepper.previous();
        } else {
            this.trn.get(['robots.mastering.previousWarm']).subscribe(words => {
                this.snack.open(words['robots.mastering.previousWarm'], '', { duration: 1500 });
            });
        }
    }

    public finish(): void {
        const preSelectedPoint = this.selectedPoint;
        const preMode = this.isBasicMode;
        const preAxis = this.zeroAxis;
        this.isMoveingComplete = true;
        this.retrieveData();
        this.stepper.reset();
        setTimeout(() => {
            this.zeroAxis = preAxis;
            this.selectedPoint = preSelectedPoint;
            this.isBasicMode = preMode;
        }, 0);
    }

    public selectionChange(event: MatSelectChange): void {
        this.zeroAxis = null;
        const callApi = bind(this.service.setReferencePoint, this.service);
        const logError = err => console.warn('Retrieve reference points failed: ' + err);
        const fetchAxisInfo = () => this.retrieveData();
        const logOrFetchAxisInfo = Either.either(logError, fetchAxisInfo);
        const setReferencePoint = compose(then(logOrFetchAxisInfo), callApi);
        setReferencePoint(event.value);
    }

    private retrieveData(): void {
        this.retrieveAndAssembleAxisInfo();
        this.retrieveReferencePoints();
        this.retrieveSelectedPoint();
        this.retrieveMoveCommand();
    }

    private resetOriginal(): Promise<boolean> {
        const callApi = bind(this.service.resetOriginal, this.service);
        const returnValue = ifElse(isNilOrEmpty, F, T);
        const logError = err => console.warn('Reset original failed: ' + err);
        const hasErrOrNot = Either.either(logError, T);
        const _resetOriginal = compose(then(compose(returnValue, hasErrOrNot)), callApi);
        return _resetOriginal();
    }

    private async retrieveAndAssembleAxisInfo(): Promise<void> {
        const mapIndexed = addIndex(map);
        const getAxisInfo = bind(this.service.retrieveAxisInfo, this.service);
        const logError = err => console.warn('Retrieve axies info failed: ' + err);
        const assembleRow = ([position, offset], index) => Object({
            index: ++index,
            position: position,
            offset: offset
        });
        const bindToTable = axisInfo => this.tableData = axisInfo;
        const detectChanges = () => this.cd.detectChanges();
        const assembleTable = compose(detectChanges, bindToTable, mapIndexed(assembleRow));
        const logOrAssemble = Either.either(logError, assembleTable);
        const _retrieveAndAssembleAxisInfo = compose(then(logOrAssemble), getAxisInfo);
        _retrieveAndAssembleAxisInfo();
    }

    private async retrieveReferencePoints(): Promise<void> {
        const fetchReferencePoints = bind(this.service.fetchReferencePoints, this.service);
        const logError = err => console.warn('Retrieve reference points failed: ' + err);
        const bindToAttr = rPoints => this.referencePoints = rPoints;
        const logOrAssemble = Either.either(logError, bindToAttr);
        const _retrieveReferencePoints = compose(then(logOrAssemble), fetchReferencePoints);
        _retrieveReferencePoints();
    }

    private async retrieveSelectedPoint(): Promise<void> {
        const getReferencePoint = bind(this.service.getReferencePoint, this.service);
        const logError = err => console.warn('Retrieve selected reference point failed: ' + err);
        const bindToAttr = point => this.selectedPoint = point;
        const logOrAssemble = Either.either(logError, bindToAttr);
        const _retrieveSelectedPoint = compose(then(logOrAssemble), getReferencePoint);
        _retrieveSelectedPoint();
    }

    private async retrieveMoveCommand(): Promise<void> {
        const getCommand = bind(this.service.getCommand, this.service);
        const logError = err => console.warn('Retrieve move command failed: ' + err);
        const bindToAttr = command => this.moveCommand = command;
        const logOrAssemble = Either.either(logError, bindToAttr);
        const _retrieveMoveCommand = compose(then(logOrAssemble), getCommand);
        _retrieveMoveCommand();
    }
}
