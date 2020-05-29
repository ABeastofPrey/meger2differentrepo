import { CommandOptions } from '../enums/vision-command.enum';

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

    pixels_x: string[]; 
    [CommandOptions.Pixel_x]: string;

    pixels_y: string[]; 
    [CommandOptions.Pixel_y]: string;

    poss_x: string[]; 
    [CommandOptions.Pos_x]: string;

    poss_y: string[]; 
    [CommandOptions.Pos_y]: string;

}
