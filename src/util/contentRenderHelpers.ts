import { readFileSync } from "fs";

function loadFileAsString(path) {
    return readFileSync(path, "utf8");
}
function wrapInScriptTag(jsString) {
    return `<script>\n${jsString}\n</script>`;
}
function jsTTSScript(path){
    return wrapInScriptTag(loadFileAsString(path))
}