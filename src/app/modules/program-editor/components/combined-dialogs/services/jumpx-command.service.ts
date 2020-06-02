import { Injectable } from '@angular/core';
import { WebsocketService } from '../../../../core/services/websocket.service';
import { JumpxCommand } from '../models/jumpx-command.model';
import { CommandOptions } from '../enums/jumpx-command.enums';
import { Observable, Observer, of, combineLatest, throwError } from 'rxjs';
import { map as rxjsMap, catchError, mergeMap, tap } from 'rxjs/operators';
import { filter, compose, useWith, identity } from 'ramda';
import { DataService, MCQueryResponse } from '../../../../core/services';
import { PositionTriggerService } from '../../../services/position-trigger.service';
import { TPVariable } from '../../../../core/models/tp/tp-variable.model';

const leftHandler = (msg: string) => catchError(errs => {
    console.warn(`${msg}: ${errs[0].msg}`);
    return throwError(errs[0].msg)
}) as any;

const rightHandler = handler => rxjsMap((res: MCQueryResponse) => handler(res.result));

@Injectable()
export class JumpxCommandService {

    private defaultMotionEle: string;

    constructor(
        private ws: WebsocketService,
        private ds: DataService,
        private ps: PositionTriggerService
    ) { }

    public initJumpxCommand(): JumpxCommand {
        const removeTowDimension = filter(x => !x.isTwoDimension);
        const jointsAndLocaltions = useWith(Array, [removeTowDimension, removeTowDimension]);
        const [jos, los] = compose(jointsAndLocaltions)(this.ds.joints, this.ds.locations);
        return this.initModel([[], [jos, los], [jos, los], [jos, los], [], null, null, null, []]);
    }

    public getJumpxCommand(): Observable<any> {
        const queries = _motion => combineLatest([
            this.retriveMotionElements(),
            this.retrieveTargetPoints(),
            this.retrieveAscendingPoints(),
            this.retrieveDescendingPoints(),
            this.retrieveWithPls(),
            this.retrieveVcruiseMax(_motion),
            this.retrieveVtranMax(_motion),
            this.retrieveAccMax(_motion),
            this.retrieveLimitofLimZ(_motion)
        ]);
        return this.getDefaultMotionEle()
            .pipe(tap(m => this.defaultMotionEle = m))
            .pipe(mergeMap(queries))
            .pipe(rxjsMap(this.updateModel))
            .pipe(rxjsMap(cmd => {
                const changeModel = Object.assign({
                    id: 0,
                    changes: {
                        ...cmd
                    }
                });
                return changeModel;
            }))
            .pipe(catchError(this.catchErr));
    }

    public selectMotionElement(motion: string): Observable<any> {
        const queries = _motion => combineLatest([
            this.retrieveVcruiseMax(_motion),
            this.retrieveVtranMax(_motion),
            this.retrieveAccMax(_motion),
            this.retrieveLimitofLimZ(_motion)
        ]);
        const changeModel = ([vcMax, vtMax, acMax, lzRange]) => Object.assign({
            id: 0,
            changes: {
                [CommandOptions.VcruiseLimit]: [1, vcMax],
                [CommandOptions.VtranLimit]: [0, vtMax],
                [CommandOptions.AccLimit]: [0, 100],
                [CommandOptions.LimZLimit]: [lzRange[0], lzRange[1]],
            }
        });
        motion = !motion ? this.defaultMotionEle : motion;
        return queries(motion).pipe(
            rxjsMap(changeModel),
            catchError(this.catchErr)
        );
    }

    public createVarSuccess(): Observable<any> {
        const queries = [
            this.retrieveTargetPoints(),
            this.retrieveAscendingPoints(),
            this.retrieveDescendingPoints(),
        ];
        const changeModel = ([tp, ap, dp]) => Object.assign({
            id: 0,
            changes: {
                [CommandOptions.TargetJoPoints]: [...tp[0]],
                [CommandOptions.TargetLoPoints]: [...tp[1]],
                [CommandOptions.AscendingJoPoints]: [...ap[0]],
                [CommandOptions.AscendingLoPoints]: [...ap[1]],
                [CommandOptions.DescendingJoPoints]: [...dp[0]],
                [CommandOptions.DescendingLoPoints]: [...dp[1]],
            }
        });
        return combineLatest(queries)
            .pipe(rxjsMap(changeModel))
            .pipe(catchError(this.catchErr));
    }

    private getDefaultMotionEle(): Observable<string> {
        const api = '?tp_ggroup.elementname';
        return this.ws.observableQuery(api).pipe(
            rightHandler(identity),
            leftHandler('Get defalut motion element failed')
        );
    }

    private retrieveTargetPoints(): Observable<[TPVariable[], TPVariable[]]> {
        return this.getJoinsAndLocations();
    }

    private retrieveAscendingPoints(): Observable<[TPVariable[], TPVariable[]]> {
        return this.getJoinsAndLocations();
    }

    private retrieveDescendingPoints(): Observable<[TPVariable[], TPVariable[]]> {
        return this.getJoinsAndLocations();
    }

    private retriveMotionElements(): Observable<string[]> {
        const api = '?TP_GET_ROBOT_LIST';
        const parser = result => result.length !== 0 ? result.split(',') : [];
        return this.ws.observableQuery(api).pipe(
            rightHandler(parser),
            leftHandler('Get Station Tree failed')
        );
    }

    private retrieveWithPls(): Observable<string[]> {
        return Observable.create((observer: Observer<string[]>) => {
            this.ps.plsNameList().then(res => {
                observer.next(res);
            });
        });
    }

    private getJoinsAndLocations(): Observable<[TPVariable[], TPVariable[]]> {
        const removeTowDimension = filter(x => !x.isTwoDimension);
        const jointsAndLocaltions = useWith(Array, [removeTowDimension, removeTowDimension]);
        return compose(of, jointsAndLocaltions)(this.ds.joints, this.ds.locations);
    }

    private retrieveVcruiseMax(motionElement: string): Observable<number> {
        return of(100);
    }

    private retrieveVtranMax(motionElement: string): Observable<number> {
        return this.queryLimit(`?${motionElement}.vtran`);
    }

    private retrieveAccMax(motionElement: string): Observable<number> {
        return this.queryLimit(`?${motionElement}.ACCELERATIONMAX`);
    }

    private retrieveLimitofLimZ(motionElement: string): Observable<number[]> {
        const minApi = `?${motionElement}.ZMIN`;
        const maxApi = `?${motionElement}.ZMAX`;
        return combineLatest(this.queryLimit(minApi), this.queryLimit(maxApi));
    }

    private queryLimit(api: string): Observable<number> {
        return this.ws.observableQuery(api).pipe(
            rightHandler(Number),
            leftHandler('Get limit failed')
        );
    }

    private initModel([me, tp, ap, dp, wp, vm, vtm, am, lz]): JumpxCommand {
        return {
            id: 0,

            [CommandOptions.MotionElement]: null,
            [CommandOptions.MotionElements]: [...me],

            [CommandOptions.TargetPoint]: null,
            [CommandOptions.TargetPointIndex]: 1,
            [CommandOptions.TargetJoPoints]: [...tp[0]],
            [CommandOptions.TargetLoPoints]: [...tp[1]],

            [CommandOptions.AscendingPoint]: null,
            [CommandOptions.AscendingPointIndex]: 1,
            [CommandOptions.AscendingJoPoints]: [...ap[0]],
            [CommandOptions.AscendingLoPoints]: [...ap[1]],

            [CommandOptions.DescendingPoint]: null,
            [CommandOptions.DescendingPointIndex]: 1,
            [CommandOptions.DescendingJoPoints]: [...dp[0]],
            [CommandOptions.DescendingLoPoints]: [...dp[1]],

            [CommandOptions.ArchNo]: null,
            [CommandOptions.ArchNoLimit]: [1, 7],

            [CommandOptions.BlendingPercentage]: null,
            [CommandOptions.BlendingPercentageLimit]: [0, 100],

            [CommandOptions.VScale]: null,
            [CommandOptions.VcruiseLimit]: [1, vm],

            [CommandOptions.Vtran]: null,
            [CommandOptions.VtranLimit]: [0, vtm],

            [CommandOptions.Acc]: null,
            [CommandOptions.AccLimit]: [0, 100],

            [CommandOptions.LimZ]: null,
            [CommandOptions.LimZLimit]: [lz[0], lz[1]],

            [CommandOptions.WithPls]: null,
            [CommandOptions.WithPlsList]: [...wp]
        };
    }

    private updateModel([me, tp, ap, dp, wp, vm, vtm, am, lz]): any {
        return {
            id: 0,

            [CommandOptions.MotionElements]: [...me],

            [CommandOptions.TargetJoPoints]: [...tp[0]],
            [CommandOptions.TargetLoPoints]: [...tp[1]],

            [CommandOptions.AscendingJoPoints]: [...ap[0]],
            [CommandOptions.AscendingLoPoints]: [...ap[1]],

            [CommandOptions.DescendingJoPoints]: [...dp[0]],
            [CommandOptions.DescendingLoPoints]: [...dp[1]],

            [CommandOptions.ArchNoLimit]: [1, 7],

            [CommandOptions.BlendingPercentageLimit]: [0, 100],

            [CommandOptions.VcruiseLimit]: [1, vm],

            [CommandOptions.VtranLimit]: [0, vtm],

            [CommandOptions.AccLimit]: [0, 100],

            [CommandOptions.LimZLimit]: [lz[0], lz[1]],

            [CommandOptions.WithPlsList]: [...wp]
        };
    }

    private catchErr(): Observable<JumpxCommand> {
        const fakeModel = this.initModel(
            [[], [[], []], [[], []], [[], []], [], Infinity, Infinity, Infinity, [Infinity, Infinity]]
        );
        return of(fakeModel);
    }
}
