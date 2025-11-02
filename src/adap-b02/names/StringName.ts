import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export class StringName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;
    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter?: string) {
        this.delimiter = delimiter ?? DEFAULT_DELIMITER;
        this.name = source;
        this.noComponents = source === "" ? 0 : source.split(this.delimiter).length;
    }

    public asString(delimiter: string = this.delimiter): string {
        return this.name.split(this.delimiter).join(delimiter);
    }

    public asDataString(): string {
        return this.name;
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    public isEmpty(): boolean {
        return this.noComponents === 0;
    }

    public getNoComponents(): number {
        return this.noComponents;
    }

    public getComponent(x: number): string {
        const comp = this.name.split(this.delimiter);
        return comp[x];
    }

    public setComponent(n: number, c: string): void {
        const comp = this.name.split(this.delimiter);
        comp[n] = c;
        this.name = comp.join(this.delimiter);
    }

    public insert(n: number, c: string): void {
        const comp = this.name.split(this.delimiter);
        comp.splice(n,0,c);
        this.name = comp.join(this.delimiter);
        this.noComponents = comp.length;
    }

    public append(c: string): void {
        const comp = this.name.split(this.delimiter);
        comp.push(c);
        this.name = comp.join(this.delimiter);
        this.noComponents = comp.length;
    }

    public remove(n: number): void {
        const comp = this.name.split(this.delimiter);
        comp.splice(n,1);
        this.name = comp.join(this.delimiter);
        this.noComponents = comp.length;
    }

    public concat(other: Name): void {
        const comp = this.name.split(this.delimiter);
        for (let i = 0; i < other.getNoComponents(); i++) {
            comp.push(other.getComponent(i));
        }
        this.name = comp.join(this.delimiter);
        this.noComponents = comp.length;
    }

}