export enum CommandType {
    GetJobData = 'VGetJobData',
    GetJobError = 'VGetJobError',
    GetJobStatus = 'VGetJobStatus',
    RunJob = 'VRunJob',
    StopJob = 'VStopJob',
    RunJobFull = 'VRunJobFull',
    PixelToPos = 'VPixelToPos',
}

export enum CommandOptions {
    Station = 'stationName',
    Job = 'jobName',
    Dimension = 'dimension',
    DataNum = 'dataNum',
    AsData = 'asData',
    Status = 'status',
    Error = 'error',
    Variable = 'variable',
    Timeout = 'timeout',
    Pixel_x = 'Pixel_x',
    Pixel_y = 'Pixel_y',
    Pos_x = 'Pos_x',
    Pos_y = 'Pos_y',
}

export interface GetCommandOption {
    [CommandOptions.Station]: string,
    [CommandOptions.Job]: string,
    [CommandOptions.Dimension]: string,
    [CommandOptions.DataNum]: string,
    [CommandOptions.AsData]: string,
    [CommandOptions.Status]: string,
    [CommandOptions.Error]: string,
    [CommandOptions.Timeout]: number,
    [CommandOptions.Variable]: string,
    [CommandOptions.Pixel_x]: string,
    [CommandOptions.Pixel_y]: string,
    [CommandOptions.Pos_x]: string,
    [CommandOptions.Pos_y]: string,
}
const DIMENSION_AUTHORIZED = [
    CommandType.GetJobData,
    CommandType.RunJobFull,
];

const DATA_NUM_AUTHORIZED = [
    CommandType.GetJobData,
    CommandType.RunJobFull,
];

const AS_DATA_AUTHORIZED = [
    CommandType.GetJobData,
    CommandType.RunJobFull,
];

const STATUS_AUTHORIZED = [
    CommandType.GetJobStatus,
];

const ERROR_AUTHORIZED = [
    CommandType.GetJobError,
    CommandType.RunJobFull,
];

const VARIABLE_AUTHORIZED = [
    CommandType.GetJobData,
    CommandType.GetJobError,
    CommandType.GetJobStatus,
    CommandType.RunJob,
    CommandType.RunJobFull,
];

const TIMEOUT_AUTHORIZED = [
    CommandType.GetJobStatus,
    CommandType.RunJob,
    CommandType.RunJobFull,
];

const PixelToPos = [
    CommandType.PixelToPos,
]

const fined = (types: CommandType[], type: CommandType) => types.findIndex(x => x === type) === -1 ? false : true;

export class CommandOptionAuth {
    private type: CommandType;
    constructor(_type: CommandType) {
        this.type = _type;
    }
    get hasDimension(): boolean { return fined(DIMENSION_AUTHORIZED, this.type); };
    get hasDataNum(): boolean { return fined(DATA_NUM_AUTHORIZED, this.type); };
    get hasAsData(): boolean { return fined(AS_DATA_AUTHORIZED, this.type); };
    get hasStatus(): boolean { return fined(STATUS_AUTHORIZED, this.type); };
    get hasError(): boolean { return fined(ERROR_AUTHORIZED, this.type); };
    get hasTimeout(): boolean { return fined(TIMEOUT_AUTHORIZED, this.type); };
    get hasVariable(): boolean { return fined(VARIABLE_AUTHORIZED, this.type) };
    get hasPixelToPos(): boolean { return fined(PixelToPos, this.type) };
}
