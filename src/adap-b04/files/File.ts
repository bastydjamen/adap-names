import { Node } from "./Node";
import { Directory } from "./Directory";
import { MethodFailedException } from "../common/MethodFailedException";
import {IllegalArgumentException} from "../common/IllegalArgumentException";

enum FileState {
    OPEN,
    CLOSED,
    DELETED        
};

export class File extends Node {

    protected state: FileState = FileState.CLOSED;

    constructor(baseName: string, parent: Directory) {
        super(baseName, parent);
    }

    public open(): void {
        // PRE: file must be CLOSED (not already open or deleted)
        IllegalArgumentException.assert(
            this.state === FileState.CLOSED,
            "file must be closed to be opened"
        );
        this.state = FileState.OPEN;
    }

    public read(noBytes: number): Int8Array {
        // PRE: file must be OPEN
        IllegalArgumentException.assert(
            this.state === FileState.OPEN,
            "file must be open to read"
        );
        // PRE: noBytes must be a non-negative integer
        IllegalArgumentException.assert(
            Number.isInteger(noBytes) && noBytes >= 0,
            "noBytes must be a non-negative integer"
        );

        return new Int8Array(noBytes);

    }

    public close(): void {
        // PRE: file must be OPEN
        IllegalArgumentException.assert(
            this.state === FileState.OPEN,
            "file must be open to close"
        );
        this.state = FileState.CLOSED;

    }

    protected doGetFileState(): FileState {
        return this.state;
    }

}