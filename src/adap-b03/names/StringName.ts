import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringName extends AbstractName {

    protected name: string = "";
    protected noComponents: number = 0;
    protected components: string[] = [];

    constructor(source: string, delimiter?: string) {
        super(delimiter);
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


}