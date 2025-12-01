import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { MethodFailedException } from "../common/MethodFailedException";
import { Name } from "./Name";

export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
        IllegalArgumentException.assert(delimiter != null, "delimiter must not be null");
        IllegalArgumentException.assert(
            delimiter.length === 1,
            "delimiter must be a single character"
        );
        IllegalArgumentException.assert(
            delimiter !== ESCAPE_CHARACTER,
            "delimiter must not equal escape character"
        );

        this.delimiter = delimiter;
    }


    protected require(condition: boolean, message: string): void {
        IllegalArgumentException.assert(condition, message);
    }

    protected ensure(condition: boolean, message: string): void {
        MethodFailedException.assert(condition, message);
    }


    protected checkInvariant(): void {
        InvalidStateException.assert(this.delimiter != null, "delimiter must not be null");
        InvalidStateException.assert(
            this.delimiter.length === 1,
            "delimiter must be a single character"
        );
        InvalidStateException.assert(
            this.delimiter !== ESCAPE_CHARACTER,
            "delimiter must not equal escape character"
        );
    }

  
    public asString(delimiter: string = this.delimiter): string {
        this.checkInvariant();

        this.require(delimiter != null, "delimiter must not be null");
        this.require(delimiter.length === 1, "delimiter must be a single character");

        const humanComponents: string[] = [];
        const n = this.getNoComponents();
        for (let i = 0; i < n; i++) {
            const masked = this.getComponent(i);
            humanComponents.push(this.unmask(masked));
        }

        const result = humanComponents.join(delimiter);
        this.checkInvariant();
        return result;
    }


    public asDataString(): string {
        this.checkInvariant();

        const parts: string[] = [];
        const n = this.getNoComponents();

        for (let i = 0; i < n; i++) {
            const c = this.getComponent(i);
            InvalidStateException.assert(
                this.isProperlyMasked(c),
                "stored component is not properly masked"
            );
            parts.push(c);
        }

        const result = parts.join(this.delimiter);

        const parsed = this.splitEscaped(result);
        MethodFailedException.assert(
            parsed.length === n,
            "asDataString must be round-trippable (component count)"
        );
        for (let i = 0; i < n; i++) {
            MethodFailedException.assert(
                parsed[i] === parts[i],
                "asDataString must be round-trippable (components)"
            );
        }

        this.checkInvariant();
        return result;
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    public toString(): string {
        return this.asDataString();
    }


    public isEqual(other: Object): boolean {
        this.checkInvariant();

        if (this === other) {
            return true;
        }

        const o: any = other;
        if (
            !o ||
            typeof o.getNoComponents !== "function" ||
            typeof o.getComponent !== "function" ||
            typeof o.getDelimiterCharacter !== "function"
        ) {
            return false;
        }

        if (this.getDelimiterCharacter() !== o.getDelimiterCharacter()) {
            return false;
        }

        const n = this.getNoComponents();
        if (n !== o.getNoComponents()) {
            return false;
        }

        for (let i = 0; i < n; i++) {
            if (this.getComponent(i) !== o.getComponent(i)) {
                return false;
            }
        }

        this.checkInvariant();
        return true;
    }

    public getHashCode(): number {
        this.checkInvariant();

        const str = this.asDataString();
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 31 + str.charCodeAt(i)) | 0;
        }

        this.checkInvariant();
        return hash;
    }


    public isEmpty(): boolean {
        this.checkInvariant();

        const result = this.getNoComponents() === 0;

        this.ensure(
            result === (this.getNoComponents() === 0),
            "isEmpty must be consistent with getNoComponents"
        );

        this.checkInvariant();
        return result;
    }

    public concat(other: Name): void {
        this.checkInvariant();
        this.require(other != null, "other must not be null");

        const oldCount = this.getNoComponents();
        const otherCount = other.getNoComponents();

        for (let i = 0; i < otherCount; i++) {
            this.append(other.getComponent(i));
        }

        this.ensure(
            this.getNoComponents() === oldCount + otherCount,
            "concat must increase number of components by other's size"
        );

        this.checkInvariant();
    }


    protected mask(value: string): string {
        let out = "";
        for (const ch of value) {
            if (ch === ESCAPE_CHARACTER || ch === this.delimiter) {
                out += ESCAPE_CHARACTER;
            }
            out += ch;
        }
        return out;
    }


    protected unmask(value: string): string {
        let out = "";
        let escaping = false;

        for (const ch of value) {
            if (escaping) {
                out += ch;
                escaping = false;
            } else if (ch === ESCAPE_CHARACTER) {
                escaping = true;
            } else {
                out += ch;
            }
        }

        InvalidStateException.assert(!escaping, "unterminated escape in masked value");
        return out;
    }

   
    protected splitEscaped(str: string): string[] {
        if (str.length === 0) {
            return [];
        }

        const parts: string[] = [];
        let current = "";
        let escaping = false;

        for (const ch of str) {
            if (escaping) {
                current += ch;
                escaping = false;
            } else if (ch === ESCAPE_CHARACTER) {
                current += ch;
                escaping = true;
            } else if (ch === this.delimiter) {
                parts.push(current);
                current = "";
            } else {
                current += ch;
            }
        }

        InvalidStateException.assert(!escaping, "unterminated escape in data string");
        parts.push(current);
        return parts;
    }


    protected isProperlyMasked(component: string): boolean {
        let escaping = false;

        for (const ch of component) {
            if (escaping) {
                escaping = false;
                continue;
            }

            if (ch === ESCAPE_CHARACTER) {
                escaping = true;
            } else if (ch === this.delimiter) {
                return false;
            }
        }

        return !escaping;
    }


    public abstract clone(): Name;

    public abstract getNoComponents(): number;

    public abstract getComponent(i: number): string;
    public abstract setComponent(i: number, c: string): void;

    public abstract insert(i: number, c: string): void;
    public abstract append(c: string): void;
    public abstract remove(i: number): void;
}
