// src/adap-b02/names/StringName.ts

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

export class StringName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;
    protected name: string = "";
    protected noComponents: number = 0;

    // we keep an internal array to make operations easier
    protected components: string[] = [];

    /**
     * source is the full masked name string, with components separated
     * by the given delimiter (or DEFAULT_DELIMITER if none given).
     */
    constructor(source: string, delimiter?: string) {
        if (delimiter != undefined) {
            this.delimiter = delimiter;
        } else {
            this.delimiter = DEFAULT_DELIMITER;
        }

        // store the raw string
        this.name = source;

        // build components array from the string
        this.components = [];

        // if source is empty, we treat it as 0 components
        if (source == "") {
            this.noComponents = 0;
        } else {
            this.components = this.splitMasked(source, this.delimiter);
            this.noComponents = this.components.length;
        }
    }

    /**
     * Helper: split a masked string into an array of masked components.
     * We must respect ESCAPE_CHARACTER when deciding where to split.
     */
    protected splitMasked(masked: string, delimiter: string): string[] {
        let result: string[] = [];  //final list of components
        let current: string = ""; // characters of the current component

        let i: number = 0;
        // Iterate over each character in the masked string
        while (i < masked.length) {
            let ch = masked.charAt(i);
       //// We found a backslash. This means the next character is escaped.
            if (ch == ESCAPE_CHARACTER) {
                // take this backslash and the next char as part of the component
                if (i + 1 < masked.length) {
                    let next = masked.charAt(i + 1);
                    current = current + ch + next; // keep them together
                    i = i + 2; // move index by 2, since we consumed two characters
                } else {
                    // Else case: backslash is the last character
                    // trailing backslash, just add it
                    current = current + ch;
                    i = i + 1;
                }
            } else if (ch == delimiter) {
                // We found the delimiter (e.g. '.')
                // This means the current component ends here.
                // delimiter ends the current component
                // Add current component to the result array
                result[result.length] = current;
                // Reset current component to empty string
                current = "";
                i = i + 1; //// Move to next character
            } else {
                current = current + ch; // Normal character, just add to current component
                i = i + 1;
            }
        }
         // After the loop, we still have the last component in "current"
        // add last component
        result[result.length] = current;

        return result; // Return the array of components
    }

    /**
     * Helper: recompute this.name and this.noComponents from this.components
     */
    /**
     * Helper: updateNameFromComponents
     * --------------------------------
     * This method rebuilds the "name" string and "noComponents" number
     * from the current "components" array.
     *
     * Whenever we insert, remove, or append, we change the components array,
     * so we must call this to keep "name" and "noComponents" in sync.
     */
    // @methodtype command-method
    protected updateNameFromComponents(): void {
        // Build a single string by joining components with the delimiter
        let newName: string = "";
        for (let i = 0; i < this.components.length; i++) {
            newName = newName + this.components[i];
            if (i < this.components.length - 1) {
                newName = newName + this.delimiter;
            }
        }
       // Update the stored name string
        this.name = newName;
        // Update the number of components
        this.noComponents = this.components.length;
    }
    // @methodtype get-method
    public asString(delimiter: string = this.delimiter): string {
        let result: string = "";

        for (let i = 0; i < this.components.length; i++) {
            let maskedComp = this.components[i];

            // 1) Unmask using this instance's delimiter
            let clean = unmaskForDelimiter(maskedComp, this.delimiter);

            // 2) Add to result
            result = result + clean;

            // put delimiter between components, not after last one
            if (i < this.components.length - 1) {
                result = result + delimiter;
            }
        }

        return result;
    }
    // @methodtype get-method
    public asDataString(): string {
        let result: string = "";

        for (let i = 0; i < this.components.length; i++) {
            let maskedComp = this.components[i];

            // 1) Unmask using this instance's delimiter
            let unmasked = unmaskForDelimiter(maskedComp, this.delimiter);

            // 2) Re-mask using the default delimiter
            let remasked = maskForDelimiter(unmasked, DEFAULT_DELIMITER);

            result = result + remasked;

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
    // @methodtype get-method
    public isEmpty(): boolean {
        return this.noComponents == 0;
    }
    // @methodtype get-method
    public getNoComponents(): number {
        return this.noComponents;
    }
    // @methodtype get-method
    public getComponent(n: number): string {
        return this.components[n];
    }
    // @methodtype set-method
    public setComponent(n: number, c: string): void {
        this.components[n] = c;
        this.updateNameFromComponents();
    }
    // @methodtype command-method
    public insert(n: number, c: string): void {
        // shift elements to the right
        for (let j = this.components.length; j > n; j--) {
            this.components[j] = this.components[j - 1];
        }
        this.components[n] = c;
        this.updateNameFromComponents();
    }
    // @methodtype command-method
    public append(c: string): void {
        this.components[this.components.length] = c;
        this.updateNameFromComponents();
    }
    // @methodtype command-method
    public remove(n: number): void {
        // shift elements to the left
        for (let j = n; j < this.components.length - 1; j++) {
            this.components[j] = this.components[j + 1];
        }
        this.components.length = this.components.length - 1;
        this.updateNameFromComponents();
    }
    // @methodtype command-method
    public concat(other: Name): void {
        let count = other.getNoComponents();
        for (let i = 0; i < count; i++) {
            this.append(other.getComponent(i));
        }
        // append already calls updateNameFromComponents, so nothing more needed
    }
}
