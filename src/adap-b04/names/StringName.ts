import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import {IllegalArgumentException} from "../common/IllegalArgumentException";
import {MethodFailedException} from "../common/MethodFailedException";
import {InvalidStateException} from "../common/InvalidStateException";

export class StringName extends AbstractName {

    protected name: string = "";
    protected noComponents: number = 0;
    protected components: string[] = [];

    constructor(source: string, delimiter?: string) {
        super(delimiter);
        //PRE: source must not be null/undefined
        IllegalArgumentException.assert(
            source != null,
            "source string must not be null or undefined"
        );
        this.name = source;
        this.components = [];

        if (source === "") {
            // special case: 1 empty component
            this.components = [""];
            this.noComponents = 1;
        } else {
            this.components = this.splitMasked(source, this.delimiter);
            this.noComponents = this.components.length;
        }
        this.assertClassInvariant();
    }

    protected splitMasked(masked: string, delimiter: string): string[] {
        let result: string[] = [];
        let current: string = "";

        let i = 0;
        while (i < masked.length) {
            const ch = masked.charAt(i);

            if (ch === ESCAPE_CHARACTER) {
                // Take '\' and next char as part of this component
                if (i + 1 < masked.length) {
                    const next = masked.charAt(i + 1);
                    current = current + ch + next;
                    i = i + 2;
                } else {
                    // trailing backslash
                    current = current + ch;
                    i = i + 1;
                }
            } else if (ch === delimiter) {
                // unescaped delimiter -> end of component
                result[result.length] = current;
                current = "";
                i = i + 1;
            } else {
                // normal char
                current = current + ch;
                i = i + 1;
            }
        }

        // last component
        result[result.length] = current;

        return result;
    }

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
        this.assertClassInvariant();
    }


    public clone(): Name {
        return new StringName(this.name, this.delimiter);
    }

    // @methodtype get-method
    public getNoComponents(): number {
        return this.noComponents;
    }

    // @methodtype get-method
    public getComponent(n: number): string {
        // PRE: index in range
        IllegalArgumentException.assert(
            Number.isInteger(n) && n >= 0 && n < this.noComponents,
            "index out of range"
        );
        return this.components[n];
    }

    // @methodtype set-method
    public setComponent(n: number, c: string): void {
        // PRE: index in range, component not null/undefined
        IllegalArgumentException.assert(
            Number.isInteger(n) && n >= 0 && n < this.noComponents,
            "index out of range for setComponent"
        );
        IllegalArgumentException.assert(
            c != null,
            "component must not be null or undefined"
        );
        const oldCount = this.noComponents;
        this.components[n] = c;
        this.updateNameFromComponents();

        MethodFailedException.assert(
            this.noComponents === oldCount,
            "setComponent must not change number of components"
        );
    }

    // @methodtype command-method
    public insert(n: number, c: string): void {
        // valid positions: 0..noComponents
        IllegalArgumentException.assert(
            Number.isInteger(n) && n >= 0 && n <= this.noComponents,
            "index out of range for insert"
        );
        IllegalArgumentException.assert(
            c != null,
            "component must not be null or undefined"
        );
        const oldCount = this.noComponents;

        // Shift elements to the right from the end
        for (let j = this.components.length; j > n; j--) {
            this.components[j] = this.components[j - 1];
        }
        this.components[n] = c;
        this.updateNameFromComponents();

        // POST: number of components increased by 1
        MethodFailedException.assert(
            this.noComponents === oldCount + 1,
            "insert failed: wrong number of components"
        );
    }

    // @methodtype command-method
    public append(c: string): void {
        IllegalArgumentException.assert(
            c != null,
            "component must not be null or undefined"
        );

        const oldCount = this.noComponents;
        this.components[this.components.length] = c;
        this.updateNameFromComponents();

        // POST: number of components increased by 1
        MethodFailedException.assert(
            this.noComponents === oldCount + 1,
            "append failed: wrong number of components"
        );
    }

    // @methodtype command-method
    public remove(n: number): void {
        IllegalArgumentException.assert(
            Number.isInteger(n) && n >= 0 && n < this.noComponents,
            "index out of range for remove"
        );

        const oldCount = this.noComponents;

        // Shift elements to the left
        for (let j = n; j < this.components.length - 1; j++) {
            this.components[j] = this.components[j + 1];
        }
        this.components.length = this.components.length - 1;
        this.updateNameFromComponents();
        MethodFailedException.assert(
            this.noComponents === oldCount - 1,
            "remove failed: wrong number of components"
        );
    }

    protected assertClassInvariant(): void {
        // First: AbstractName invariant (delimiter)
        super.assertClassInvariant();

        // Then: StringName-specific invariants
        InvalidStateException.assert(
            this.components != null,
            "components must not be null or undefined"
        );
        InvalidStateException.assert(
            this.noComponents === this.components.length,
            "noComponents must equal components.length"
        );
    }

}