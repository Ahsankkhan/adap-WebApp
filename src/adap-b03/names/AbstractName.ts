import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;
    protected components: string[] = [];

    constructor(delimiter: string = DEFAULT_DELIMITER) {
        this.delimiter = delimiter;
    }


    public asString(delimiter: string = this.delimiter): string {
        const components: string[] = [];
        for (let i = 0; i < this.getNoComponents(); i++) {
            components.push(this.getComponent(i));
        }
        return components.join(delimiter);
    }

    public toString(): string {
        return this.asDataString();
    }

    public asDataString(): string {
        const masked = [];
        for (let i = 0; i < this.getNoComponents(); i++) {
            masked.push(this.mask(this.getComponent(i)));
        }
        return masked.join(this.delimiter);
    }

    public isEqual(other: Name): boolean {
        if(this.getDelimiterCharacter()!==other.getDelimiterCharacter()) return false;
        if(this.getNoComponents()!==other.getNoComponents()) return false;
        for(let i=0; i<this.getNoComponents(); i++) {
            if(this.getComponent(i)!==other.getComponent(i)) return false;
        }
        return true;
    }

    public getHashCode(): number {
        let str=this.asDataString();
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash=(hash*31 + str.charCodeAt(i))|0;
        }
        return hash;
    }

    public isEmpty(): boolean {
        return this.getNoComponents() === 0;
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    public getNoComponents(): number {
        return this.components.length;
    }

    public getComponent(i: number): string {
        return this.components[i];
    }

    public setComponent(i: number, c: string) {
        this.components[i]=c;
    }

    public insert(i: number, c: string) {
        this.components.splice(i,0,c);
    }

    public append(c: string) {
        this.components.push(c);
    }

    public remove(i: number) {
        this.components.splice(i,1);
    }



    /// Abstract methods
    ///    
    abstract clone(): Name;


    /// Helper methods
    /// 

    public concat(other: Name): void {
        for (let i = 0; i < other.getNoComponents(); i++) {
            this.append(other.getComponent(i));
        }
    }

    protected mask(value: string): string {
        let out = "";

        for (const ch of value) {
            if (ch === ESCAPE_CHARACTER) {
                out += ESCAPE_CHARACTER + ESCAPE_CHARACTER;
            } else if (ch === this.delimiter) {
                out += ESCAPE_CHARACTER + this.delimiter;
            } else {
                out += ch;
            }
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

        return out;
    }

    protected splitEscaped(str: string): string[] {
        const parts: string[] = [];
        let current = "";
        let escaping = false;

        for (const ch of str) {
            if (escaping) {
                current += ch;
                escaping = false;
            } else if (ch === ESCAPE_CHARACTER) {
                escaping = true;
            } else if (ch === this.delimiter) {
                parts.push(this.unmask(current));
                current = "";
            } else {
                current += ch;
            }
        }

        parts.push(this.unmask(current));
        return parts;
    }

}