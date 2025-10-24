export const DEFAULT_DELIMITER: string = '.';
export const ESCAPE_CHARACTER = '\\';

/**
 * A name is a sequence of string components separated by a delimiter character.
 * Special characters within the string may need masking, if they are to appear verbatim.
 * There are only two special characters, the delimiter character and the escape character.
 * The escape character can't be set, the delimiter character can.
 * 
 * Homogenous name examples
 * 
 * "oss.cs.fau.de" is a name with four name components and the delimiter character '.'.
 * "///" is a name with four empty components and the delimiter character '/'.
 * "Oh\.\.\." is a name with one component, if the delimiter character is '.'.
 */

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
export class Name {

    private delimiter: string = DEFAULT_DELIMITER;
    private components: string[] = [];

    /** Expects that all Name components are properly masked */
    //@methodtype constructor
    constructor(other: string[], delimiter?: string) {
        // If the user gave us a delimiter, use it; otherwise, use the default '.'
        if (delimiter) {
            this.delimiter = delimiter;
        } else {
            this.delimiter = DEFAULT_DELIMITER;
        }

        // Make our own copy of the components array so we don’t modify the caller’s
        this.components = [];

        for (let i = 0; i < other.length; i++) {
            this.components[i] = other[i];  // assumes already masked
        }
    }

    /**
     * Returns a human-readable representation of the Name instance using user-set special characters
     * Special characters are not escaped (creating a human-readable string)
     * Users can vary the delimiter character to be used
     */
    // @methodtype get-method
    public asString(delimiter: string = this.delimiter): string {
        // Step 1: start with an empty result string
        let result = "";

        // Step 2: go through each component one by one
        for (let i = 0; i < this.components.length; i++) {

            // Step 2a: take the current component
            let current = this.components[i];

            // Step 2b: "unmask" it (turn '\.' into '.' and '\\' into '\')
            let clean = unmaskForDelimiter(current, this.delimiter);

            // Step 2c: add it to the result string
            result = result + clean;

            // Step 2d: add the delimiter after it,
            // except after the last component
            if (i < this.components.length - 1) {
                result = result + delimiter;
            }
        }

        // Step 3: return the final combined string
        return result;

    }

    /** 
     * Returns a machine-readable representation of Name instance using default special characters
     * Machine-readable means that from a data string, a Name can be parsed back in
     * The special characters in the data string are the default characters
     */
    //@methodtype get-method
    public asDataString(): string {
        let result = "";

        for (let i = 0; i < this.components.length; i++) {
            // 1) Unmask using this instance's delimiter
            const unmasked = unmaskForDelimiter(this.components[i], this.delimiter);

            // 2) Re-mask for the DEFAULT delimiter "."
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

     /** Returns number of components in Name instance */
     // @methodtype get-method
     public getNoComponents(): number {
        return this.components.length;
    }

    /** Expects that new Name component c is properly masked */
    // @methodtype command-method
    public insert(i: number, c: string): void {
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

}
