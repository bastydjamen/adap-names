

import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

/** Turn masked text (like "Oh\\\.\\\.\\\.") back into readable ("Oh...") */
function unmaskForDelimiter(masked: string, delimiter: string): string {
    const esc = ESCAPE_CHARACTER;

    // 1) Replace escaped delimiter (e.g., "\.") with the real delimiter "."
    let step1 = masked.split(esc + delimiter).join(delimiter);

    // 2) Replace double backslashes ("\\") with a single "\"
    let step2 = step1.split(esc + esc).join(esc);

    return step2;
}

/** Turn raw text (like "Oh...") into masked for a given delimiter ("Oh\\\.\\\.\\\.") */
function maskForDelimiter(raw: string, delimiter: string): string {
    const esc = ESCAPE_CHARACTER;

    // 1) Escape existing backslashes first: "\" -> "\\"
    let step1 = raw.split(esc).join(esc + esc);

    // 2) Escape the delimiter: "." -> "\." (or "/" -> "\/" etc.)
    let step2 = step1.split(delimiter).join(esc + delimiter);

    return step2;
}

export class StringArrayName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;
    protected components: string[] = [];

    /** Expects that all Name components are properly masked */
    constructor(source: string[], delimiter?: string) {

        if (delimiter != undefined) {
            this.delimiter = delimiter;
        } else {
            this.delimiter = DEFAULT_DELIMITER;
        }

        // Copy all components into our own array
        this.components = [];
        for (let i = 0; i < source.length; i++) {
            this.components[i] = source[i];
        }
    }

    /**
     * Returns a human-readable representation of the Name instance using user-set special characters
     * Special characters are not escaped (creating a human-readable string)
     * Users can vary the delimiter character to be used
     */
    // @methodtype get-method
    public asString(delimiter: string = this.delimiter): string {
        let result = "";

        for (let i = 0; i < this.components.length; i++) {
            let current = this.components[i];

            // Turn '\.' into '.' and '\\' into '\'
            let clean = unmaskForDelimiter(current, this.delimiter);

            result = result + clean;

            // Put delimiter between components, not after last one
            if (i < this.components.length - 1) {
                result = result + delimiter;
            }
        }

        return result;
    }

    /**
     * Returns a machine-readable representation using the default special characters
     */
    // @methodtype get-method
    public asDataString(): string {
        let result = "";

        for (let i = 0; i < this.components.length; i++) {
            // 1) Unmask using this instance's delimiter
            const unmasked = unmaskForDelimiter(this.components[i], this.delimiter);

            // 2) Re-mask using the DEFAULT delimiter "."
            const remasked = maskForDelimiter(unmasked, DEFAULT_DELIMITER);

            // 3) Add to result
            result = result + remasked;

            // 4) Put "." between components (not after the last one)
            if (i < this.components.length - 1) {
                result = result + DEFAULT_DELIMITER;
            }
        }

        return result;
    }

    // @methodtype get-method
    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    /** Returns true, if number of components == 0; else false */
    // @methodtype get-method
    public isEmpty(): boolean {
        return this.components.length == 0;
    }

    /** Returns number of components in Name instance */
    // @methodtype get-method
    public getNoComponents(): number {
        return this.components.length;
    }

    /** Returns properly masked component string */
    // @methodtype get-method
    public getComponent(i: number): string {
        return this.components[i];
    }

    /** Expects that new Name component c is properly masked */
    // @methodtype set-method
    public setComponent(i: number, c: string): void {
        this.components[i] = c;
    }

    /** Expects that new Name component c is properly masked */
    // @methodtype command-method
    public insert(i: number, c: string): void {
        // shift elements to the right
        for (let j = this.components.length; j > i; j--) {
            this.components[j] = this.components[j - 1];
        }
        this.components[i] = c;
    }

    /** Expects that new Name component c is properly masked */
    // @methodtype command-method
    public append(c: string): void {
        this.components[this.components.length] = c;
    }
    // @methodtype command-method
    public remove(i: number): void {
        // Shift all elements after i to the left
        for (let j = i; j < this.components.length - 1; j++) {
            this.components[j] = this.components[j + 1];
        }
        // Remove the last (now duplicate) element
        this.components.length = this.components.length - 1;
    }
     // @methodtype command-method
    public concat(other: Name): void {
        let count = other.getNoComponents();
        for (let i = 0; i < count; i++) {
            this.append(other.getComponent(i));
        }
    }
}
