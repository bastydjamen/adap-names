import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    constructor(source: string[], delimiter?: string) {
        super(delimiter);

        // copy into own array
        this.components = [];
        for (let i = 0; i < source.length; i++) {
            this.components[i] = source[i];
        }
    }

    public clone(): Name {
        return new StringArrayName(this.components.slice(), this.delimiter);
    }


    public isEqual(other: Name): boolean {
        throw new Error("needs implementation or deletion");
    }

    // @methodtype get-method
    public getNoComponents(): number {
        return this.components.length;
    }

    // @methodtype get-method
    public getComponent(i: number): string {
        return this.components[i];
    }

    /** Expects that new Name component c is properly masked */
    // @methodtype set-method
    public setComponent(i: number, c: string): void {
        this.components[i] = c;
    }

    // @methodtype command-method
    public insert(i: number, c: string): void {
        // shift elements to the right
        for (let j = this.components.length; j > i; j--) {
            this.components[j] = this.components[j - 1];
        }
        this.components[i] = c;
    }

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