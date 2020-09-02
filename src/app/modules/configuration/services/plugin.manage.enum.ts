export interface DataList {
    "Name": string,
    "Version": string,
    "Date": string,
    "State": string,
    "Describe": string,
    "ChineseDes": string,
    "EnglishDes": string
}

export interface Collation {
    "active": string,
    "direction": string
}

export interface PageSize {
    "pageIndex": number,
    "pageSize": number
}

export enum PluginUnInStallIsReady {
    notReady = 0,
    ready = 1,
}

export interface MCQueryResponse {
    result: string;
    cmd: string;
    err: any;
}

export interface PMINFO {
    "Name": string,
    "Version": string,
    "Date": string,
    "State": number,
    "EnglishDes": string,
    "ChineseDes": string
}

export interface DependList {
    "Name": string;
    "Version": string;
}

export interface PageSet {
    "pageIndex": number;
    "pageSize": number;
}