export type LogSource = 'firmware' | 'drive' | 'lib' | 'webServer';

export type LogType = 'error' | 'warning' | 'information';

export interface SystemLog {
    id: string, // required
    code?: number, // required
    date: string,
    time: string,
    timestamp: number,
    source: LogSource, // required
    type: LogType, // required
    message: string, // required
    module: string,
    paras?: string[],
    task?: string, // optional
    file?: string, // optional
    line?: number, // optional
    sernum?: number,
    userName?: string,
}

export interface ErrHistory {
    uuid: string,
    code: number, // lib: [20000,20999], dirve: [19000,19999], fw: others
    date: string,
    time: string,
    task: string,
    file: string,
    line: number,
    module: string,
    message: string,
    sernum: number,
    severity: 'Error' | 'Info' | 'Note' | 'Fatal Fault' | 'Fault',
}

export interface WebServerLog {
    UUID: string,
    username: string;
    time: number;
    msg: string;
}

// ErrHistory severity mapping to SystemLog type
// Fw:
// Fatal Fault       --------          error
// Fault             --------          error
// Error             --------          error
// Note              --------          warning
 
// LIB:
// Error             -------           error
// Info              -------           information
// Note              -------           warning


// This variable is definded for unittest.
export const fakeLog: SystemLog = {
    id: '9e08eee5-7baf-4689-a302-32e3b5037dee',
    code: 5049,
    type: 'error',
} as SystemLog;