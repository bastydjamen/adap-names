import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

/**
 * Helper function: unmaskForDelimiter
 * -----------------------------------
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
 * Helper function: maskForDelimiter
 * ---------------------------------
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

/**
 * StringName
 * ----------
 * Stores the name as one string (this.name) plus:
 *  - an array of components (this.components)
 *  - a component count (this.noComponents)
 *
 * IMPORTANT :
 *  - new StringName("") creates ONE EMPTY COMPONENT, not zero.
 *    So getNoComponents() === 1 and isEmpty() === false in that case.
 *  - isEmpty() is only true when number of components == 0.
 */
export class StringName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    // The full masked name as one string, e.g. "oss.cs.fau.de"
    protected name: string = "";

    // Number of components
    protected noComponents: number = 0;

    // Internal array of masked components
    protected components: string[] = [];

    /**
     * Constructor
     * -----------
     * source    = full masked name string (e.g. "oss.cs.fau.de")
     * delimiter = optional delimiter character (e.g. '.')
     *  - source == "" -> ONE empty component, not zero.
     */
    // @methodtype constructor
    constructor(source: string, delimiter?: string) {
        // Choose delimiter
        if (delimiter != undefined) {
            this.delimiter = delimiter;
        } else {
            this.delimiter = DEFAULT_DELIMITER;
        }

        // Store the full string
        this.name = source;

        this.components = [];

        if (source === "") {
            // IMPORTANT BEHAVIOR:
            // Empty string means: 1 empty component.
            this.components = [""];
            this.noComponents = 1;
        } else {
            // Normal case: split into masked components
            this.components = this.splitMasked(source, this.delimiter);
            this.noComponents = this.components.length;
        }
    }

    /**
     * Helper: splitMasked
     * -------------------
     * Splits a masked string into masked components.
     * Respects the escape character, so "\." does NOT split.
     */
    // @methodtype get-method
    protected splitMasked(masked: string, delimiter: string): string[] {
        let result: string[] = [];
        let current: string = "";

        let i: number = 0;
        while (i < masked.length) {
            let ch = masked.charAt(i);

            if (ch == ESCAPE_CHARACTER) {
                // Escape: take '\' and next char as part of this component
                if (i + 1 < masked.length) {
                    let next = masked.charAt(i + 1);
                    current = current + ch + next;
                    i = i + 2;
                } else {
                    // Trailing backslash (edge case)
                    current = current + ch;
                    i = i + 1;
                }
            } else if (ch == delimiter) {
                // Unescaped delimiter: end of component
                result[result.length] = current;
                current = "";
                i = i + 1;
            } else {
                // Normal character
                current = current + ch;
                i = i + 1;
            }
        }

        // Add last component
        result[result.length] = current;

        return result;
    }

    /**
     * Helper: updateNameFromComponents
     * --------------------------------
     * Rebuilds this.name and this.noComponents
     * from the current this.components array.
     *
     * This allows a 0-component StringName after operations like remove().
     * In that case, name will be "" and noComponents will be 0.
     */
    // @methodtype command-method
    protected updateNameFromComponents(): void {
        let newName: string = "";

        for (let i = 0; i < this.components.length; i++) {
            newName = newName + this.components[i];
            if (i < this.components.length - 1) {
                newName = newName + this.delimiter;
            }
        }

        this.name = newName;
        this.noComponents = this.components.length;
    }

    /**
     * Human-readable string (no escapes shown),
     * using the chosen delimiter between components.
     */
    // @methodtype get-method
    public asString(delimiter: string = this.delimiter): string {
        let result: string = "";

        for (let i = 0; i < this.components.length; i++) {
            let maskedComp = this.components[i];

            // Remove escaping for this instance's delimiter
            let clean = unmaskForDelimiter(maskedComp, this.delimiter);

            result = result + clean;

            // Put delimiter between components, not after last one
            if (i < this.components.length - 1) {
                result = result + delimiter;
            }
        }

        return result;
    }

    /**
     * Machine-readable string using DEFAULT_DELIMITER and ESCAPE_CHARACTER.
     */
    // @methodtype get-method
    public asDataString(): string {
        let result: string = "";

        for (let i = 0; i < this.components.length; i++) {
            let maskedComp = this.components[i];

            // Unmask with this.delimiter
            let unmasked = unmaskForDelimiter(maskedComp, this.delimiter);

            // Mask again with the DEFAULT_DELIMITER ('.')
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

    /**
     * isEmpty() is true iff number of components == 0.
     * (matches the interface comment and forum discussion)
     */
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
        // Shift elements to the right from the end
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
        // Shift elements to the left
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
        // append() already updates the name
    }
}
