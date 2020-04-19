import { CommandOptions } from '../enums/jumpx-command.enums';
import { TPVariable } from '../../../../core/models/tp/tp-variable.model';

export interface JumpxCommand {
    id: number,

    [CommandOptions.TargetPoint]: TPVariable; // required
    [CommandOptions.TargetPointIndex]: number;
    [CommandOptions.TargetJoPoints]: TPVariable[];
    [CommandOptions.TargetLoPoints]: TPVariable[];

    [CommandOptions.AscendingPoint]: TPVariable; // required
    [CommandOptions.AscendingPointIndex]: number; // required
    [CommandOptions.AscendingJoPoints]: TPVariable[];
    [CommandOptions.AscendingLoPoints]: TPVariable[];

    [CommandOptions.DescendingPoint]: TPVariable; // required
    [CommandOptions.DescendingPointIndex]: number; // required
    [CommandOptions.DescendingJoPoints]: TPVariable[];
    [CommandOptions.DescendingLoPoints]: TPVariable[];

    [CommandOptions.MotionElement]: string; // optional
    [CommandOptions.MotionElements]: string[];

    [CommandOptions.WithPls]: string[]; // optional
    [CommandOptions.WithPlsList]: string[];

    [CommandOptions.ArchNo]: number; // optional
    [CommandOptions.ArchNoLimit]: number[];

    [CommandOptions.BlendingPercentage]: number; // optional
    [CommandOptions.BlendingPercentageLimit]: number[];

    [CommandOptions.VScale]: number; // optional
    [CommandOptions.VcruiseLimit]: number[];

    [CommandOptions.Vtran]: number; // optional
    [CommandOptions.VtranLimit]: number[];

    [CommandOptions.Acc]: number; // optional
    [CommandOptions.AccLimit]: number[];

    [CommandOptions.LimZ]: number; // optional
    [CommandOptions.LimZLimit]: number[];
}
