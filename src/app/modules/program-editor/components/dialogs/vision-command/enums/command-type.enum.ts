export enum CommandType {
    GetJobData = 'VGetJobData',
    GetJobError = 'VGetJobError',
    GetJobStatus = 'VGetJobStatus',
    RunJob = 'VRunJob',
    StopJob = 'VStopJob',
    RunJobFull = 'VRunJobFull',
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
    [CommandOptions.Variable]: string
}
const DimensionAuthorized = [
    CommandType.GetJobData,
    CommandType.RunJobFull,
];

const DataNumAuthorized = [
    CommandType.GetJobData,
    CommandType.RunJobFull,
];

const AsDataAuthorized = [
    CommandType.GetJobData,
    CommandType.RunJobFull,
];

const StatusAuthorized = [
    CommandType.GetJobStatus,
];

const ErrorAuthorized = [
    CommandType.GetJobError,
    CommandType.RunJobFull,
];

const VariableAuthorized = [
    CommandType.GetJobData,
    CommandType.GetJobError,
    CommandType.GetJobStatus,
    CommandType.RunJob,
    CommandType.RunJobFull,
];

const TimeoutAuthorized = [
    CommandType.GetJobStatus,
    CommandType.RunJob,
    CommandType.RunJobFull,
];

const fined = (types: CommandType[], type: CommandType) => types.findIndex(x => x === type) === -1 ? false : true;

export class CommandOptionAuth {
    private type: CommandType;
    constructor(_type: CommandType) {
        this.type = _type;
    }
    get hasDimension(): boolean { return fined(DimensionAuthorized, this.type); };
    get hasDataNum(): boolean { return fined(DataNumAuthorized, this.type); };
    get hasAsData(): boolean { return fined(AsDataAuthorized, this.type); };
    get hasStatus(): boolean { return fined(StatusAuthorized, this.type); };
    get hasError(): boolean { return fined(ErrorAuthorized, this.type); };
    get hasTimeout(): boolean { return fined(TimeoutAuthorized, this.type); };
    get hasVariable(): boolean { return fined(VariableAuthorized, this.type) };
}
