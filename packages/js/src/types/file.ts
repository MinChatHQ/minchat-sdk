export interface File {
    lastModified: number;
    lastModifiedDate: Date;
    name: string;
    size: number;
    type: string;
    slice(start?: number, end?: number, contentType?: string): Blob;
    arrayBuffer(): Promise<ArrayBuffer>;
    stream(): any;
    text(): Promise<string>;
    url: string;
}

export interface AltFile {
    blob: Blob;
    type: string;
    name: string;
}