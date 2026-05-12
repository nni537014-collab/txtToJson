import {
  mkdirSync,
  writeFileSync,
  cpSync 
} from "fs";

import {
  randomUUID
} from "crypto";

import type { 
  QnaChunks,
  MultiChunks
} from '../types/base.ts';

import {
  getQuizH5pTemplate, 
  getQuizFolder,
  getQuizContentTemplate,
  getQuizFolderTemplatePath
} from './config.ts'

export const createQuizH5pJsonFiles = (data: QnaChunks) => {
  for(let i = 0; i < data.length; i++){
    let h5p = structuredClone(getQuizH5pTemplate);
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

export const createQuizContentJsonFiles = (data: MultiChunks) =>{
  
  for(let i = 0; i < data.length; i++){
    let content = structuredClone(getQuizContentTemplate());
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
      set[j]?.wrong.map((wrongUn: any)=>{
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


export const createQuizFoldersFromTemplate = (data: QnaChunks) => {

  for(let i = 0; i < data.length; i++){
    //@todo /quiz --- remove strings!!
    mkdirSync(getQuizFolder(i), { recursive: true });
    cpSync(getQuizFolderTemplatePath(), getQuizFolder(i), {recursive: true});
    //copy default folder to created folder
  }
}


