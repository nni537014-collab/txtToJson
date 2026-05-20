import {
  mkdirSync,
  writeFileSync,
  cpSync,
  rmSync
} from "fs";

import {
  randomUUID
} from "crypto";

import type { 
  QnaChunks,
  MultiChunks
} from '../types/base.ts';

import {
  quizH5pTemplate, 
  getQuizFolder,
  quizContentTemplate,
  getQuizFolderTemplatePath,
  dialogH5pTemplate,
  getDialogFolder,
  getDialogFolderTemplatePath,
  dialogContentTemplate,
  quizOutFolder,
  dialogOutFolder,
} from './config.ts'

import { jsTTSScript } from './contentRenderHelpers.ts'

export const rmDistFolder = () => {
  rmSync(quizOutFolder, { recursive: true, force: true });
  rmSync(dialogOutFolder, { recursive: true, force: true });
}
export const createQuizH5pJsonFiles = (data: QnaChunks) => {
  for(let i = 0; i < data.length; i++){
    let h5p = structuredClone(quizH5pTemplate);
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
//@todo finish
export const createDialogH5pJsonFiles = (data: QnaChunks) => {
  for(let i = 0; i < data.length; i++){
    let h5p = structuredClone(dialogH5pTemplate);
    h5p.title = `Dialog no. ${i + 1}`;
    const folder = getDialogFolder(i);     
    mkdirSync(folder, { recursive: true });
    writeFileSync(
      `${folder}/h5p.json`,
       JSON.stringify(h5p, null),
       "utf8"
    );
  }

}

export const createDialogFoldersFromTemplate = (data: QnaChunks) => {
  for(let i = 0; i < data.length; i++){
  
    mkdirSync(getDialogFolder(i), { recursive: true });
    cpSync(getDialogFolderTemplatePath(), getDialogFolder(i), {recursive: true});


  }
}
export const createDialogContentJsonFiles = (data: MultiChunks) =>{ 
  for(let i = 0; i < data.length; i++){
    let content = structuredClone(dialogContentTemplate);
    let dialogTemplate = structuredClone(content?.dialogs[0]);
    content.dialogs =[];
    if( typeof dialogTemplate !== "object" || typeof dialogTemplate === null ){
      throw new Error("json structure not correct")
    } else {
      console.log("processing parsed json ...")
    }

    let set = data[i];
    if(!set?.length) continue;
    
        for(let j = 0; j < set.length; j++){
      // clone struction for main question struction
      let dialog = structuredClone(dialogTemplate);
      //add question text to structure
      dialog.text = `<p style="text-align:center;">${set[j]?.qna.question}</p>`;

      // @todo refactor and encapsulate the html wrapping
      dialog.answer = `<p style="text-align:center;">${ set[j]?.qna.answer }</p>`
   
      content.dialogs.push(dialog);
      
    }
    const folder = `${getDialogFolder(i)}/content`;
    mkdirSync(folder, { recursive: true });
    writeFileSync(
      `${folder}/content.json`,
       JSON.stringify(content, null),
       "utf8"
    );
  }
}
export const createQuizContentJsonFiles = (data: MultiChunks) =>{ 
const createAnsHtmlString = (ans: string) => {
       return `${jsTTSScript()}
         <div>
            <span>${ ans }</span>
            <button data-text="${encodeURIComponent(ans)}" onclick="speak(decodeURIComponent(this.dataset.text))">
              listen
            </button>             
         </div>`;
  }
    for(let i = 0; i < data.length; i++){
    let content = structuredClone(quizContentTemplate);
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
      const ans = set[j]?.qna.answer;
      if(!ans) continue
      correctAnswer.text = createAnsHtmlString(ans);
      //ans array can store correct and incorrect answers
      let answers: any[] = [];
      answers.push(correctAnswer);
      //deal with all wrong ans
      set[j]?.wrong.map((wrongUn: any)=>{
        let answer = structuredClone(answerTemplate);
        answer.correct = false;
        answer.text =  createAnsHtmlString(wrongUn.answer);
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


export const createQuizFoldersFromTemplate = (data: QnaChunks) => {
  for(let i = 0; i < data.length; i++){
    //@todo /quiz --- remove strings!!
    mkdirSync(getQuizFolder(i), { recursive: true });
    cpSync(getQuizFolderTemplatePath(), getQuizFolder(i), {recursive: true});
    //copy default folder to created folder
  }
}


