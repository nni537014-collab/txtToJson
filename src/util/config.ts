import {readFileSync} from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { z } from 'zod';
import { parseArgs } from 'node:util';

const __filename = fileURLToPath(import.meta.url);
const backToRoot = '/../../'
const __rootDirname = path.dirname(__filename) + backToRoot;
const utilsFromRoot = "/src/util";
const h5pFilename = 'h5p.json'
const h5pContentFolderName = 'content';
const h5pContentFilename = 'content.json';
const ttsFilePath = `${ __rootDirname }${ utilsFromRoot }/tts.ts`
// 1. Define the schema
const args =  process.argv.slice(2);
const options = {
  paths: {
  type: 'string'
}
} as const;

export const getConfig = () => {
  return JSON.parse(readFileSync(path.resolve(__rootDirname, "config.json"), "utf8"))
}

const { values } = parseArgs({ args, options });
export const config = getConfig()

const unsafePaths = ((paths) => {
  if(!paths){
    return {
      quizOutFolder: "dist/quizzes",
      dialogOutFolder: "dist/dialogs",
      ftbOutFolder: "dist/ftb",
      questionSetFolderTemplate: "assets/h5p/qset",
      dialogFolderTemplate: "assets/h5p/dialog",
      ftbFolderTemplate: "assets/h5p/ftb",
      cards: "assets/cards.txt"
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
  quizOutFolder: z.string().min(1),
  dialogOutFolder: z.string().min(1),
  ftbOutFolder:  z.string().min(1),
  questionSetFolderTemplate: z.string().min(1),
  dialogFolderTemplate: z.string().min(1),
  ftbFolderTemplate: z.string().min(1),
  cards: z.string().min(1),
});
export const paths = ConfigSchema.parse(unsafePaths);
export const getQuizFolderTemplatePath = () => {
  return path.resolve(__rootDirname, paths.questionSetFolderTemplate);
}
export const getDialogFolderTemplatePath = () => {
  return path.resolve(__rootDirname, paths.dialogFolderTemplate);
}
export const getFtbFolderTemplatePath = () => {
  return path.resolve(__rootDirname, paths.ftbFolderTemplate);
}
export const quizH5pTemplate = (() => {
  const p = path.join(getQuizFolderTemplatePath(),
                      h5pFilename);
  return JSON.parse(readFileSync(p, "utf8"));
})()
export const dialogH5pTemplate = (() => {
  const p = path.join(getDialogFolderTemplatePath(),
                      h5pFilename);
  return JSON.parse(readFileSync(p, "utf8"));
})()

export const ftbH5pTemplate = (() => {
  const p = path.join(getFtbFolderTemplatePath(),
                      h5pFilename);
  return JSON.parse(readFileSync(p, "utf8"));
})()

export const quizContentTemplate = (() => {
  const p = path.join(getQuizFolderTemplatePath(),
                      h5pContentFolderName, 
                      h5pContentFilename)
  const contentTemplateRaw = readFileSync(p, "utf8");
  return JSON.parse(contentTemplateRaw);
})()

export const dialogContentTemplate = (() => {
  const p = path.join(getDialogFolderTemplatePath(),
                      h5pContentFolderName, 
                      h5pContentFilename)
  const contentTemplateRaw = readFileSync(p, "utf8");
  return JSON.parse(contentTemplateRaw);
})()
 
export const ftbContentTemplate = (() => {
  const p = path.join(getFtbFolderTemplatePath(),
                      h5pContentFolderName, 
                      h5pContentFilename)
  const contentTemplateRaw = readFileSync(p, "utf8");
  return JSON.parse(contentTemplateRaw);
})()

export const quizOutFolder = path.resolve(__rootDirname, paths.quizOutFolder)
export const getQuizFolder = (i:number) => {
  return `${quizOutFolder}/Quiz${i+1}`
}
export const dialogOutFolder = path.resolve(__rootDirname, paths.dialogOutFolder);
export const ftbOutFolder = path.resolve(__rootDirname, paths.ftbOutFolder);
export const getDialogFolder = (i:number) => {
  return `${dialogOutFolder}/Dialog${i+1}`
}

export const getFtbFolder = (i:number) => {
  return `${ftbOutFolder}/ftb${i+1}`
}
export const getCardsPath = () => {
  return path.resolve(__rootDirname, paths.cards);
}

export const getTTSFilePath = ()=> {
   return ttsFilePath;
}
