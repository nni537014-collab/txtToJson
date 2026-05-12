import {readFileSync} from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { z } from 'zod';
import { parseArgs } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename) + '/../';
const dirSeparator = '/'
const h5pFilename = 'h5p.json'
const h5pContentFolderName = 'content';
const h5pContentFilename = 'content.json';
// 1. Define the schema
const args =  process.argv.slice(2);
const options = {
  paths: {
  type: 'string'
}
} as const;

export const getConfig = () => {
  return JSON.parse(readFileSync(path.resolve(__dirname, "../config.json"), "utf8"))
}

const { values } = parseArgs({ args, options });
export const config = getConfig()
      console.log(config);

      console.log(values);//process.exit();


const unsafePaths = ((paths) => {
  if(!paths){
    return {
      h5pJsonTemplate: "../assets/h5p/qset/h5p.json",  
      contentJsonTemplate: "../assets/h5p/qset/content/content.json",
      outFolder: `../dist/quizzes`,
      questionSetFolderTemplate: "../assets/h5p/qset", 
      cards: "../assets/cards.txt",
      folderTemplate: "../assets/h5p/qset"
    }
  } else {
      console.log(paths, config);
    if (Array.isArray(config.paths)){
      let p = config.paths as any[];
        const foundIndex = p.findIndex((value)=>{
          if (typeof value === 'object' && value !== null && !Array.isArray(value)){
            let correctPaths = value[paths];
            if (typeof correctPaths === 'object' && correctPaths !== null && !Array.isArray(correctPaths)) {

              return true;

            } else {
              return false;

            }
          } 
        })
        if(foundIndex !== -1 ){
          return config.paths[foundIndex][paths];
        }
    }
  }  
})(values.paths);
// Run: node script.js --port 3000 --debug
const ConfigSchema = z.object({
  h5pJsonTemplate: z.string().min(1, "Path cannot be empty"),
  contentJsonTemplate: z.string().min(1),
  outFolder: z.string().min(1),
  questionSetFolderTemplate: z.string().min(1),
  cards: z.string().min(1),
  folderTemplate: z.string().min(1),
});
export const paths = ConfigSchema.parse(unsafePaths);
const getQuestionSetFolderTemplatePath = () => {
  return path.resolve(__dirname, paths.questionSetFolderTemplate);
}
export const getQuizH5pTemplate = (() => {
  const p = path.join(getQuestionSetFolderTemplatePath(),
                      h5pFilename);
  return JSON.parse(readFileSync(p, "utf8"));
})()
export const getQuizContentTemplate = (() => {
  const p = path.join(getQuestionSetFolderTemplatePath(),
                      h5pContentFolderName, 
                      h5pContentFilename)
  const contentTemplateRaw = readFileSync(p, "utf8");
  return JSON.parse(contentTemplateRaw);
})()
 
const outFolder = `${path.resolve(__dirname, paths.outFolder)}`;

export const getQuizFolder = (i:number) => {
  return `${outFolder}/Quiz${i+1}`
}
export const getQuizFolderTemplatePath = () => {
  return path.resolve(__dirname, paths.folderTemplate);

}
export const folderTemplate = path.resolve(__dirname, paths.folderTemplate);
export const getCardsPath = () => {
  return path.resolve(__dirname, paths.cards);
}

