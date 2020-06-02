export enum CommandType {
    Jump = 'Jump',
    Jump3 = 'Jump3',
    Jump3cp = 'Jump3cp'
}

export enum CommandOptions {
    TargetPoint = 'TargetPoint', // DestFrame = 'destFrame',
    TargetPointIndex = 'TargetPointIndex',
    TargetLoPoints = 'TargetLoPoints',
    TargetJoPoints = 'TargetJoPoints',
    AscendingPoint = 'AscendingPoint', // DepartPoint = 'departPoint',
    AscendingPointIndex = 'AscendingPointIndex',
    AscendingLoPoints = 'AscendingLoPoints',
    AscendingJoPoints = 'AscendingJoPoints',
    DescendingPoint = 'DescendingPoint', // ApproachPoint = 'approachPoint',
    DescendingPointIndex = 'DescendingPointIndex',
    DescendingLoPoints = 'DescendingLoPoints',
    DescendingJoPoints = 'DescendingJoPoints',
    MotionElement = 'MotionElement',
    MotionElements = 'MotionElements',
    ArchNo = 'ArchNo',
    ArchNoLimit = 'ArchNoLimit',
    LimZ = 'LimZ', // LimitZ = 'limitZ',
    LimZLimit = 'LimZLimit',
    BlendingPercentage = 'BlendingPercentage',
    BlendingPercentageLimit = 'BlendingPercentageLimit',
    VScale = 'VScale',
    VcruiseLimit = 'VcruiseLimit',
    Vtran = 'Vtran', // Speed = 'speed',
    VtranLimit = 'VtranLimit',
    Acc = 'AScale', // Acceleration = 'acceleration'
    AccLimit = 'AccLimit',
    WithPls = 'WithPls',
    WithPlsList = 'WithPlsList',
}

export interface GetCommandOption {
    [CommandOptions.TargetPoint]: string,
    [CommandOptions.AscendingPoint]: string,
    [CommandOptions.DescendingPoint]: string,
    [CommandOptions.MotionElement]: string,
    [CommandOptions.BlendingPercentage]: number,
    [CommandOptions.VScale]: number,
    [CommandOptions.Vtran]: number,
    [CommandOptions.ArchNo]: number,
    [CommandOptions.LimZ]: number,
    [CommandOptions.Acc]: number,
    [CommandOptions.WithPls]: string[],
}

const MotionEleAuthorized = [
    CommandType.Jump,
    CommandType.Jump3,
    CommandType.Jump3cp
];

const AscendingPAuthorized = [
    CommandType.Jump3,
    CommandType.Jump3cp
];

const DescendingPAuthorized = [
    CommandType.Jump3,
    CommandType.Jump3cp
];

const TargetPAuthorized = [
    CommandType.Jump,
    CommandType.Jump3,
    CommandType.Jump3cp
];

const ArchNoAuthorized = [
    CommandType.Jump,
    CommandType.Jump3,
    CommandType.Jump3cp
];

const LimZAuthorized = [
    CommandType.Jump,
];

const BlendingAuthorized = [
    CommandType.Jump,
    CommandType.Jump3,
    CommandType.Jump3cp
];

const VcruiseAuthorized = [
    CommandType.Jump,
];

const VtranAuthorized = [
    CommandType.Jump3,
    CommandType.Jump3cp
];

const AccAuthorized = [
    CommandType.Jump,
    CommandType.Jump3,
    CommandType.Jump3cp
];

const WithPlsAuthorized = [
    CommandType.Jump,
    CommandType.Jump3,
    CommandType.Jump3cp
];

const fined = (types: CommandType[], type: CommandType) => types.findIndex(x => x.toLowerCase() === type.toLowerCase()) === -1 ? false : true;

export class CommandOptionAuth {
    private type: CommandType;
    constructor(_type: CommandType) {
        this.type = _type;
    }
    get hasMotionElement(): boolean { return fined(MotionEleAuthorized, this.type); };
    get hasAscendingPoint(): boolean { return fined(AscendingPAuthorized, this.type); };
    get hasDescendingPoint(): boolean { return fined(DescendingPAuthorized, this.type); };
    get hasTargetPoint(): boolean { return fined(TargetPAuthorized, this.type); };
    get hasArchNo(): boolean { return fined(ArchNoAuthorized, this.type); };
    get hasLimZ(): boolean { return fined(LimZAuthorized, this.type); };
    get hasBlendingPercentage(): boolean { return fined(BlendingAuthorized, this.type) };
    get hasVcruise(): boolean { return fined(VcruiseAuthorized, this.type) };
    get hasVtran(): boolean { return fined(VtranAuthorized, this.type) };
    get hasAcc(): boolean { return fined(AccAuthorized, this.type) };
    get hasWithPls(): boolean { return fined(WithPlsAuthorized, this.type) };
}
