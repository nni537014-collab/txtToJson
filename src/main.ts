import { mkdirSync, readFileSync, writeFileSync, cpSync } from "fs";
import { randomUUID } from "crypto";
import { parseArgs } from 'node:util';
import { z } from 'zod';
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Define the schema
const args =  process.argv.slice(2);
const options = {
  paths: {
  type: 'string'
}
} as const;
const { values } = parseArgs({ args, options });
const config = JSON.parse(readFileSync(path.resolve(__dirname, "../config.json"), "utf8"))
      console.log(config);

      console.log(values);//process.exit();


const unsafePaths = ((paths) => {
  if(!paths){
    return {
      h5pJsonTemplate: "../assets/h5p/qset/h5p.json",  
      contentJsonTemplate: "../assets/h5p/qset/content/content.json",
      outFolder: `../dist/quizzes`,
      questionSetFFolderTemplate: "../assets/h5p/qset", 
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
  questionSetFFolderTemplate: z.string().min(1),
  cards: z.string().min(1),
  folderTemplate: z.string().min(1),
});
const paths = ConfigSchema.parse(unsafePaths);

console.log(paths);
const h5pTemplateRaw = readFileSync(path.resolve(__dirname, paths.h5pJsonTemplate), "utf8");
const h5pTemplate = JSON.parse(h5pTemplateRaw);

 
const contentTemplateRaw = readFileSync(path.resolve(__dirname, paths.contentJsonTemplate), "utf8");
const contentTemplate = JSON.parse(contentTemplateRaw);


type qna = {
    question: string;
    answer: string;
}
type multi = {
    qna: qna;
    wrong: qna[];
}

export interface H5PMultiChoiceAnswer {
  text: string;
  correct: boolean;
}

export interface H5PMultiChoiceParams {
  question: string;
  answers: H5PMultiChoiceAnswer[];
  behaviour?: {
    enableRetry?: boolean;
    enableSolutionsButton?: boolean;
    randomAnswers?: boolean;
  };
}
export interface H5PMultiChoice {
  library: "H5P.MultiChoice 1.14" | "H5P.MultiChoice 1.15";
  params: H5PMultiChoiceParams;
}

export interface H5PQuestionSetParams {
  title?: string;
  introPage?: {
    showIntroPage: boolean;
    title?: string;
    introduction?: string;
  };
  endPage?: {
    showResultPage: boolean;
    title?: string;
    subtitle?: string;
  };
  questions: H5PMultiChoice[];
}

export interface H5PQuestionSet {
  library: "H5P.QuestionSet 1.17" | "H5P.QuestionSet 1.18";
  params: H5PQuestionSetParams;
}



export function loadChunks(path: string): qna[][] {
  // read whole file as UTF‑8 text
  const raw = readFileSync(path, "utf8");

  // split into lines (handles Windows + Linux newlines)
  const lines = raw.split(/\r?\n/);

  // skip first 2 lines
  const data = lines.slice(2);

const chunks: qna[][] = [];

  for (let i = 0; i < data.length; i += 20) {
    const slice = data.slice(i, i + 20).filter(Boolean); // remove empty lines

    if (!slice.length) continue;

    // convert each line into a qna object
    const qnas: qna[] = slice.map<qna>((line: string) => {
      const [question, answer] = line.split("\t");

      return {
        question: question?.trim() ?? "",
        answer: answer?.trim() ?? ""
      };
    });

    chunks.push(qnas);
  }

  return chunks;
}

function chunkToMulti(chunks: qna[][]){//: multi[][]{
  let ret: multi[][] = [];  
  for(let j=0; j < chunks.length; j++ ) {
     const chunk = chunks[j];
     if(!chunk) continue
     for(let k=0; k < chunk.length; k++){
        const row = chunk[k];
        if(!row) continue;
        let rowList = ret[j];
        if(!rowList){
            rowList = [];
            ret[j] = rowList;
        }
        let mul = rowList[k] = {
            qna: row,
            wrong: new Array<qna>()
        };
        
        while (mul.wrong.length < 3 ){
            const target = Math.floor(Math.random() * chunk.length);
            if (target == k) continue;
            const targetQna = chunk[target]
            
            if (targetQna){
              if (mul.wrong.includes(targetQna)) continue;
              mul.wrong.push(targetQna)
            }
            

        }  
     }
  }
  return ret; 
}



function createH5pJsonFiles(data: multi[][]){
  for(let i = 0; i < data.length; i++){
    let h5p = structuredClone(h5pTemplate);
    if(h5p?.title){
        h5p.title = `Quiz no. ${i + 1}`;
    } else {
        console.warn("no title in json")
    }
    
    const folder = `${path.resolve(__dirname, paths.outFolder)}/Quiz${i+1}`;
    mkdirSync(folder, { recursive: true });
    writeFileSync(
      `${folder}/h5p.json`,
       JSON.stringify(h5p, null),
       "utf8"
    );
  }

}

function createContentJsonFilesMultiChoice(data: multi[][]){
  
  for(let i = 0; i < data.length; i++){
    let content = structuredClone(contentTemplate);
    let questionTemplate = structuredClone(content?.questions[0]);
    // reset questions after taking template
    content.questions = []
    if( typeof questionTemplate !== "object" || typeof questionTemplate === null ){
      throw new Error("json structure not correct")
    } else {
      console.log("processing parsed json ...")
    }
    let set = data[i];
    if(!set?.length) continue;
    for(let j = 0; j < set.length; j++){
      // clone struction for main question struction
      let question = structuredClone(questionTemplate);
      //add question text to structure
      question.params.question = `<div>${set[j]?.qna.question}</div>`;
      //drill into question template to get a answer template 
      //of which a few may be used
      let answerTemplate = structuredClone(questionTemplate?.params?.answers[0]);
      //create clone of ans templ for the one correct ans possible at 
      // the moment
      let correctAnswer = structuredClone(answerTemplate);
      correctAnswer.correct = true;
      // @todo refactor and encapsulate the html wrapping
      correctAnswer.text = `<div>${ set[j]?.qna.answer }</div>`
      //ans array can store correct and incorrect answers
      let answers: any[] = [];
      answers.push(correctAnswer);
      //deal with all wrong ans
      set[j]?.wrong.map((wrongUn)=>{
        let answer = structuredClone(answerTemplate);
        answer.correct = false;
        answer.text =  `<div>${wrongUn.answer}</div>`;
        answers.push(answer); 
      })
      //add ans array to question structure
      
      question.params.answers = answers;
      question.subContentId = randomUUID();
      content.questions.push(question);
      
    }
  
    const folder = `${path.resolve(__dirname, paths.outFolder)}/Quiz${i+1}/content`;
    mkdirSync(folder, { recursive: true });
    writeFileSync(
      `${folder}/content.json`,
       JSON.stringify(content, null),
       "utf8"
    );
  }
}
// Example usage:
const chunks = loadChunks(path.resolve(__dirname, paths.cards));
const multiReady = chunkToMulti(chunks);

function createFoldersFromTemplate(data: multi[][]){
  const folderTemplate = path.resolve(__dirname, paths.folderTemplate);

  for(let i = 0; i < data.length; i++){
    //@todo /quiz --- remove strings!!
    const folder = `${path.resolve(__dirname, paths.outFolder)}/Quiz${i + 1}`;

    mkdirSync(folder, { recursive: true });
    cpSync(folderTemplate, folder, {recursive: true});
    //copy default folder to created folder
  }
}
createFoldersFromTemplate(multiReady);
createH5pJsonFiles(multiReady)
createContentJsonFilesMultiChoice(multiReady);
