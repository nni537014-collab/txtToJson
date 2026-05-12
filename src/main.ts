import { mkdirSync, readFileSync, writeFileSync, cpSync } from "fs";
import { randomUUID } from "crypto";
import { getConfig,
         config,
         paths,
         h5pTemplate,
         contentTemplate,
         getQuizFolder,
         getFolderTemplate,
         getCardsPath
        } from './util/data.ts'

import type { qna
            ,  multi
            ,  H5PMultiChoiceAnswer
            , H5PMultiChoiceParams
            , H5PMultiChoice
            , H5PQuestionSetParams
            , H5PQuestionSet } from './types/base.ts'

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



const createH5pJsonFiles = (data: multi[][]) => {
  for(let i = 0; i < data.length; i++){
    let h5p = structuredClone(h5pTemplate);
    if(h5p?.title){
        h5p.title = `Quiz no. ${i + 1}`;
    } else {
        console.warn("no title in json")
    }
    const folder = getQuizFolder(i);     
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
  
    const folder = `${getQuizFolder(i)}/content`;
    mkdirSync(folder, { recursive: true });
    writeFileSync(
      `${folder}/content.json`,
       JSON.stringify(content, null),
       "utf8"
    );
  }
}
// Example usage:
const chunks = loadChunks(getCardsPath());
const multiReady = chunkToMulti(chunks);

function createFoldersFromTemplate(data: multi[][]){

  for(let i = 0; i < data.length; i++){
    //@todo /quiz --- remove strings!!
    mkdirSync(getQuizFolder(i), { recursive: true });
    cpSync(getFolderTemplate(), getQuizFolder(i), {recursive: true});
    //copy default folder to created folder
  }
}
createFoldersFromTemplate(multiReady);
createH5pJsonFiles(multiReady)
createContentJsonFilesMultiChoice(multiReady);
