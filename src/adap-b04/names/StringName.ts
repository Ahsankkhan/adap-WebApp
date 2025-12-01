import { DEFAULT_DELIMITER } from "../common/Printable";
import { InvalidStateException } from "../common/InvalidStateException";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringName extends AbstractName {

    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter: string = DEFAULT_DELIMITER) {
        super(delimiter);

        this.require(source != null, "source string must not be null");

        this.name = source;

        if (source.length === 0) {
            this.noComponents = 0;
        } else {
            const components = this.splitEscaped(source);
            for (const c of components) {
                this.require(
                    this.isProperlyMasked(c),
                    "component parsed from source is not properly masked"
                );
            }
            this.noComponents = components.length;
        }

        this.checkInvariant();
    }

    protected checkInvariant(): void {
        super.checkInvariant();
        InvalidStateException.assert(this.name != null, "name must not be null");
        InvalidStateException.assert(this.noComponents >= 0, "noComponents must not be negative");

        if (this.name.length === 0) {
            InvalidStateException.assert(
                this.noComponents === 0,
                "empty name string must have zero components"
            );
        } else {
            const components = this.splitEscaped(this.name);
            InvalidStateException.assert(
                components.length === this.noComponents,
                "noComponents must equal number of parsed components"
            );
            for (const c of components) {
                InvalidStateException.assert(
                    this.isProperlyMasked(c),
                    "parsed component is not properly masked"
                );
            }
        }
    }

    public getNoComponents(): number {
        return this.noComponents;
    }

    protected getComponentsArray(): string[] {
        if (this.name.length === 0) {
            return [];
        }
        return this.splitEscaped(this.name);
    }

    public getComponent(i: number): string {
        this.checkInvariant();
        this.require(
            Number.isInteger(i) && i >= 0 && i < this.noComponents,
            "index out of range in getComponent"
        );
        const components = this.getComponentsArray();
        const result = components[i];
        this.checkInvariant();
        return result;
    }

    public setComponent(i: number, c: string): void {
        this.checkInvariant();
        this.require(
            Number.isInteger(i) && i >= 0 && i < this.noComponents,
            "index out of range in setComponent"
        );
        this.require(c != null, "component must not be null");
        this.require(this.isProperlyMasked(c), "component is not properly masked");

        const components = this.getComponentsArray();
        const oldCount = components.length;
        components[i] = c;

        this.name = components.join(this.delimiter);
        this.noComponents = components.length;

        this.ensure(
            this.noComponents === oldCount,
            "setComponent must not change noComponents"
        );
        this.ensure(
            this.getComponent(i) === c,
            "setComponent must store the new value"
        );

        this.checkInvariant();
    }

    public insert(i: number, c: string): void {
        this.checkInvariant();
        this.require(
            Number.isInteger(i) && i >= 0 && i <= this.noComponents,
            "index out of range in insert"
        );
        this.require(c != null, "component must not be null");
        this.require(this.isProperlyMasked(c), "component is not properly masked");

        const components = this.getComponentsArray();
        const oldCount = components.length;
        components.splice(i, 0, c);

        this.name = components.join(this.delimiter);
        this.noComponents = components.length;

        this.ensure(
            this.noComponents === oldCount + 1,
            "insert must increase number of components by 1"
        );
        this.ensure(
            this.getComponent(i) === c,
            "insert must place component at index i"
        );

        this.checkInvariant();
    }

    public append(c: string): void {
        this.insert(this.noComponents, c);
    }

    public remove(i: number): void {
        this.checkInvariant();
        this.require(
            Number.isInteger(i) && i >= 0 && i < this.noComponents,
            "index out of range in remove"
        );

        const components = this.getComponentsArray();
        const oldCount = components.length;
        components.splice(i, 1);

        this.name = components.join(this.delimiter);
        this.noComponents = components.length;

        this.ensure(
            this.noComponents === oldCount - 1,
            "remove must decrease number of components by 1"
        );

        this.checkInvariant();
    }

    public clone(): Name {
        this.checkInvariant();
        const copy = new StringName(this.name, this.delimiter);
        this.ensure(copy.isEqual(this), "clone must produce an equal Name");
        return copy;
    }
}
