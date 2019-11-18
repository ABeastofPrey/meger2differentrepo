import { CommandOptions } from '../enums/command-type.enum';

export interface VisionCommand {
    id: number,

    [CommandOptions.Station]: string;

    jobNames: string[];
    [CommandOptions.Job]: string;

    dimensions: string[];
    [CommandOptions.Dimension]: string;

    dataNums: string[];
    [CommandOptions.DataNum]: string;

    asDatas: string[];
    [CommandOptions.AsData]: string;

    statusList: string[];
    [CommandOptions.Status]: string;

    errors: string[];
    [CommandOptions.Error]: string;

    variables: string[];
    [CommandOptions.Variable]: string;

    [CommandOptions.Timeout]: number;
}
