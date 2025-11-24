import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringName extends AbstractName {

    protected components: string[] = [];

    constructor(source: string, delimiter?: string) {
        super(delimiter);
        if(source.length===0){
            this.components=[];
        }
        else {
            this.components = this.splitEscaped(source);
        }
    }

    public clone(): Name {
        return new StringName(this.asDataString(), this.delimiter);
    }


}