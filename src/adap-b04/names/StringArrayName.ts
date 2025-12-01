import { DEFAULT_DELIMITER } from "../common/Printable";
import { InvalidStateException } from "../common/InvalidStateException";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    constructor(source: string[], delimiter: string = DEFAULT_DELIMITER) {
        super(delimiter);

        this.require(source != null, "source must not be null");
        this.require(Array.isArray(source), "source must be an array");

        for (const comp of source) {
            this.require(comp != null, "source components must not be null");
            this.require(this.isProperlyMasked(comp), "source component is not properly masked");
        }

        this.components = source.slice();
        this.checkInvariant();
    }

    protected checkInvariant(): void {
        super.checkInvariant();
        InvalidStateException.assert(this.components != null, "components must not be null");
        for (const comp of this.components) {
            InvalidStateException.assert(comp != null, "components must not contain null");
            InvalidStateException.assert(
                this.isProperlyMasked(comp),
                "stored component is not properly masked"
            );
        }
    }

    public getNoComponents(): number {
        return this.components.length;
    }

    public getComponent(i: number): string {
        this.checkInvariant();
        this.require(
            Number.isInteger(i) && i >= 0 && i < this.components.length,
            "index out of range in getComponent"
        );
        const result = this.components[i];
        this.checkInvariant();
        return result;
    }

    public setComponent(i: number, c: string): void {
        this.checkInvariant();
        this.require(
            Number.isInteger(i) && i >= 0 && i < this.components.length,
            "index out of range in setComponent"
        );
        this.require(c != null, "component must not be null");
        this.require(this.isProperlyMasked(c), "component is not properly masked");

        const oldCount = this.components.length;
        this.components[i] = c;

        this.ensure(this.components.length === oldCount, "setComponent must not change size");
        this.ensure(this.components[i] === c, "setComponent must store the new value");

        this.checkInvariant();
    }

    public insert(i: number, c: string): void {
        this.checkInvariant();
        this.require(
            Number.isInteger(i) && i >= 0 && i <= this.components.length,
            "index out of range in insert"
        );
        this.require(c != null, "component must not be null");
        this.require(this.isProperlyMasked(c), "component is not properly masked");

        const oldCount = this.components.length;
        this.components.splice(i, 0, c);

        this.ensure(this.components.length === oldCount + 1, "insert must increase size by 1");
        this.ensure(this.components[i] === c, "insert must place the component at index i");

        this.checkInvariant();
    }

    public append(c: string): void {
        this.insert(this.components.length, c);
    }

    public remove(i: number): void {
        this.checkInvariant();
        this.require(
            Number.isInteger(i) && i >= 0 && i < this.components.length,
            "index out of range in remove"
        );

        const oldCount = this.components.length;
        this.components.splice(i, 1);

        this.ensure(this.components.length === oldCount - 1, "remove must decrease size by 1");

        this.checkInvariant();
    }

    public clone(): Name {
        this.checkInvariant();
        const copy = new StringArrayName(this.components, this.delimiter);
        this.ensure(copy.isEqual(this), "clone must produce an equal Name");
        return copy;
    }
}
