import { mkdirSync, readFileSync, writeFileSync, cpSync } from "fs";
import { randomUUID } from "crypto";
import type { 
              multi, 
              QnaChunks} from './types/base.ts'
import { getH5pTemplate,
         getContentTemplate,
         getQuizFolder,
         getFolderTemplatePath,
         getCardsPath,
         loadChunks,
         chunkToMulti } from './util/data.ts'





const createH5pJsonFiles = (data: QnaChunks) => {
  for(let i = 0; i < data.length; i++){
    let h5p = structuredClone(getH5pTemplate);
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
    let content = structuredClone(getContentTemplate);
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


function createFoldersFromTemplate(data: QnaChunks){

  for(let i = 0; i < data.length; i++){
    //@todo /quiz --- remove strings!!
    mkdirSync(getQuizFolder(i), { recursive: true });
    cpSync(getFolderTemplatePath(), getQuizFolder(i), {recursive: true});
    //copy default folder to created folder
  }
}

const asQna = loadChunks(getCardsPath())
createFoldersFromTemplate(asQna);
createH5pJsonFiles(asQna)
createContentJsonFilesMultiChoice(chunkToMulti(asQna));
