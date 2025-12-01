import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import {IllegalArgumentException} from "../common/IllegalArgumentException";
import {MethodFailedException} from "../common/MethodFailedException";
import {InvalidStateException} from "../common/InvalidStateException";

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    constructor(source: string[], delimiter?: string) {
        super(delimiter);
        IllegalArgumentException.assert(
            source != null,
            "source array must not be null or undefined"
        );
        // copy into own array
        this.components = [];
        for (let i = 0; i < source.length; i++) {
            this.components[i] = source[i];
        }
        this.assertClassInvariant();
    }

    public clone(): Name {
        return new StringArrayName(this.components.slice(), this.delimiter);
    }


    // @methodtype get-method
    public getNoComponents(): number {
        return this.components.length;
    }

    // @methodtype get-method
    public getComponent(i: number): string {
        IllegalArgumentException.assert(
            Number.isInteger(i) && i >= 0 && i < this.components.length,
            "index out of range"
        );
        return this.components[i];
    }

    /** Expects that new Name component c is properly masked */
    // @methodtype set-method
    public setComponent(i: number, c: string): void {
        IllegalArgumentException.assert(
            Number.isInteger(i) && i >= 0 && i < this.components.length,
            "index out of range for setComponent"
        );
        IllegalArgumentException.assert(
            c != null,
            "component must not be null or undefined"
        );

        const oldCount = this.components.length;
        this.components[i] = c;
        // POST: number of components unchanged
        MethodFailedException.assert(
            this.components.length === oldCount,
            "setComponent must not change number of components"
        );

        this.assertClassInvariant();
    }

    // @methodtype command-method
    public insert(i: number, c: string): void {
        // valid positions: 0..length
        IllegalArgumentException.assert(
            Number.isInteger(i) && i >= 0 && i <= this.components.length,
            "index out of range for insert"
        );
        IllegalArgumentException.assert(
            c != null,
            "component must not be null or undefined"
        );

        const oldCount = this.components.length;
        // shift elements to the right
        for (let j = this.components.length; j > i; j--) {
            this.components[j] = this.components[j - 1];
        }
        this.components[i] = c;
        // POST: number of components increased by 1
        MethodFailedException.assert(
            this.components.length === oldCount + 1,
            "insert failed: wrong number of components"
        );

        this.assertClassInvariant();
    }

    // @methodtype command-method
    public append(c: string): void {
        IllegalArgumentException.assert(
            c != null,
            "component must not be null or undefined"
        );

        const oldCount = this.components.length;
        this.components[this.components.length] = c;
        // POST: number of components increased by 1
        MethodFailedException.assert(
            this.components.length === oldCount + 1,
            "append failed: wrong number of components"
        );

        this.assertClassInvariant();
    }
    // @methodtype command-method
    public remove(i: number): void {
        IllegalArgumentException.assert(
            Number.isInteger(i) && i >= 0 && i < this.components.length,
            "index out of range for remove"
        );

        const oldCount = this.components.length;
        // Shift all elements after i to the left
        for (let j = i; j < this.components.length - 1; j++) {
            this.components[j] = this.components[j + 1];
        }
        // Remove the last (now duplicate) element
        this.components.length = this.components.length - 1;

        // POST: number of components decreased by 1
        MethodFailedException.assert(
            this.components.length === oldCount - 1,
            "remove failed: wrong number of components"
        );

        this.assertClassInvariant();
    }
    protected assertClassInvariant(): void {
        // First: AbstractName invariant (delimiter)
        super.assertClassInvariant();

        // Then: StringArrayName-specific invariants
        InvalidStateException.assert(
            this.components != null,
            "components must not be null or undefined"
        );
        for (const c of this.components) {
            InvalidStateException.assert(
                c != null,
                "name component must not be null or undefined"
            );
        }
    }
}