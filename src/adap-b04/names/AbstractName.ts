import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import {IllegalArgumentException} from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import {MethodFailedException} from "../common/MethodFailedException";

/**
 * Helper: unmaskForDelimiter
 * Turns masked text (e.g. "Oh\\\.\\\.\\\.")
 * into readable text (e.g. "Oh...") for a given delimiter.
 */
function unmaskForDelimiter(masked: string, delimiter: string): string {
    const esc = ESCAPE_CHARACTER;

    // Replace escaped delimiter (e.g. "\.") with the delimiter "."
    let step1 = masked.split(esc + delimiter).join(delimiter);

    // Replace "\\" with "\"
    let step2 = step1.split(esc + esc).join(esc);

    return step2;
}

/**
 * Helper: maskForDelimiter
 * Turns raw text (e.g. "Oh...")
 * into masked text (e.g. "Oh\\\.\\\.\\\.") for a given delimiter.
 */
function maskForDelimiter(raw: string, delimiter: string): string {
    const esc = ESCAPE_CHARACTER;

    // Escape backslashes: "\" -> "\\"
    let step1 = raw.split(esc).join(esc + esc);

    // Escape delimiter: "." -> "\."
    let step2 = step1.split(delimiter).join(esc + delimiter);

    return step2;
}


export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
        // PRE: delimiter must be a single character, not null/undefined
        IllegalArgumentException.assert(
            delimiter != null  && delimiter.length === 1,
            "delimiter must be a single character"
        );
        this.delimiter = delimiter;

    }

    public abstract clone(): Name;


    // @methodtype get-method
    public asString(delimiter: string = this.delimiter): string {
        IllegalArgumentException.assert(
            delimiter != null && true && delimiter.length === 1,
            "delimiter must be a single character"
        );
        let result: string = "";

        for (let i = 0; i < this.getNoComponents(); i++) {
            let maskedComp = this.getComponent(i);

            // Remove escaping for this instance's delimiter
            let clean = unmaskForDelimiter(maskedComp, this.delimiter);

            result = result + clean;

            // Put delimiter between components, not after last one
            if (i < this.getNoComponents() - 1) {
                result = result + delimiter;
            }
        }
        MethodFailedException.assert(
            result !== null && result !== undefined,
            "asString failed"
        );
        return result;
    }

    public toString(): string {
        return this.asDataString();
    }

    public asDataString(): string {
        let result = "";

        for (let i = 0; i < this.getNoComponents(); i++) {
            const maskedComp = this.getComponent(i);

            // 1) Unmask with this.delimiter
            const unmasked = unmaskForDelimiter(maskedComp, this.delimiter);

            // 2) Re-mask with DEFAULT_DELIMITER '.'
            const remasked = maskForDelimiter(unmasked, DEFAULT_DELIMITER);

            result = result + remasked;

            if (i < this.getNoComponents() - 1) {
                result = result + DEFAULT_DELIMITER;
            }
        }
        MethodFailedException.assert(
            result !== null && result !== undefined,
            "asDataString failed"
        );

        return result;
    }

    public isEqual(other: Name): boolean {
        if (other == null) {
            return false;
        }

        if (this.getNoComponents() !== other.getNoComponents()) {
            return false;
        }

        for (let i = 0; i < this.getNoComponents(); i++) {
            if (this.getComponent(i) !== other.getComponent(i)) {
                return false;
            }
        }

        return true;
    }

    public getHashCode(): number {
        let hashCode = 0;
        const s = this.asDataString();

        for (let i = 0; i < s.length; i++) {
            const c = s.charCodeAt(i);
            hashCode = (hashCode << 5) - hashCode + c;
            hashCode |= 0; // force 32-bit
        }

        return hashCode;
    }

    public isEmpty(): boolean {
        return this.getNoComponents() === 0;
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    abstract getNoComponents(): number;

    abstract getComponent(i: number): string;
    abstract setComponent(i: number, c: string): void;

    abstract insert(i: number, c: string): void;
    abstract append(c: string): void;
    abstract remove(i: number): void;

    // @methodtype command-method
    public concat(other: Name): void {
        IllegalArgumentException.assert(other != null, "other must not be null");

        const oldCount = this.getNoComponents();
        const toAdd = other.getNoComponents();

        for (let i = 0; i < toAdd; i++) {
            this.append(other.getComponent(i));
        }

        MethodFailedException.assert(
            this.getNoComponents() === oldCount + toAdd,
            "concat failed: wrong number of components"
        );

        this.assertClassInvariant();
    }

    protected assertClassInvariant(): void {
        InvalidStateException.assert(
            this.delimiter != null && this.delimiter != undefined,
            "delimiter must not be null or undefined"
        );
        InvalidStateException.assert(
            this.delimiter.length === 1,
            "delimiter must be a single character"
        );
    }


}