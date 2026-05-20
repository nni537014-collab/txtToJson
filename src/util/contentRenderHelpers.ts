import { readFileSync } from "fs";
import { getTTSFilePath } from "./config.ts";
function loadFileAsString(path: string) {
    return readFileSync(path, "utf8");
}
function wrapInScriptTag(jsString: string) {
    return `<script>\n${jsString}\n</script>`;
}
export function jsTTSScript(){
    return wrapInScriptTag(loadFileAsString(getTTSFilePath()));
}
