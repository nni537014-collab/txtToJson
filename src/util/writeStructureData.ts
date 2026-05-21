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
  quizOutFolder,

  dialogH5pTemplate,
  getDialogFolder,
  getDialogFolderTemplatePath,
  dialogContentTemplate,
  dialogOutFolder,
  ftbH5pTemplate,
  getFtbFolder,
  getFtbFolderTemplatePath,
  ftbContentTemplate,
  ftbOutFolder,
} from './config.ts'

import { 
  jsTTSScript,
  createButton,
 } from './contentRenderHelpers.ts'
///////////////////////////////////////////////
// WRITE UTIL FUNCS
export const rmDistFolder = () => {
  rmSync(quizOutFolder, { recursive: true, force: true });
  rmSync(dialogOutFolder, { recursive: true, force: true });
  rmSync(ftbOutFolder, { recursive: true, force: true });
}
//////////////////////////////////////////////
// QUIZ

export const createQuizFoldersFromTemplate = (data: QnaChunks) => {
  for (let i = 0; i < data.length; i++) {
    //@todo /quiz --- remove strings!!
    mkdirSync(getQuizFolder(i), { recursive: true });
    cpSync(getQuizFolderTemplatePath(), getQuizFolder(i), { recursive: true });
    //copy default folder to created folder
  }
}

export const createQuizH5pJsonFiles = (data: QnaChunks) => {
  for (let i = 0; i < data.length; i++) {
    let h5p = structuredClone(quizH5pTemplate);
    if (h5p?.title) {
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
//@todo button func to replace string
export const createQuizContentJsonFiles = (data: MultiChunks) => {
  const createAnsHtmlString = (ans: string) => {
    return `${jsTTSScript()}
         <div>
            <span>${ans}</span>
            ${createButton(ans)}
            <button data-text="${encodeURIComponent(ans)}" onclick="speak(decodeURIComponent(this.dataset.text))">
              listen
            </button>             
         </div>`;
  }
  for (let i = 0; i < data.length; i++) {
    let content = structuredClone(quizContentTemplate);
    let questionTemplate = structuredClone(content?.questions[0]);
    // reset questions after taking template
    content.questions = []
    if (typeof questionTemplate !== "object" || typeof questionTemplate === null) {
      throw new Error("json structure not correct")
    } else {
      console.log("processing parsed json ...")
    }
    let set = data[i];
    if (!set?.length) continue;
    for (let j = 0; j < set.length; j++) {
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
      if (!ans) continue
      correctAnswer.text = createAnsHtmlString(ans);
      //ans array can store correct and incorrect answers
      let answers: any[] = [];
      answers.push(correctAnswer);
      //deal with all wrong ans
      set[j]?.wrong.map((wrongUn: any) => {
        let answer = structuredClone(answerTemplate);
        answer.correct = false;
        answer.text = createAnsHtmlString(wrongUn.answer);
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


////////////////////////////////////////////
// DIALOG
export const createDialogFoldersFromTemplate = (data: QnaChunks) => {
  for (let i = 0; i < data.length; i++) {

    mkdirSync(getDialogFolder(i), { recursive: true });
    cpSync(getDialogFolderTemplatePath(), getDialogFolder(i), { recursive: true });


  }
}

export const createDialogH5pJsonFiles = (data: QnaChunks) => {
  for (let i = 0; i < data.length; i++) {
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

export const createDialogContentJsonFiles = (data: MultiChunks) => {
  for (let i = 0; i < data.length; i++) {
    let content = structuredClone(dialogContentTemplate);
    let dialogTemplate = structuredClone(content?.dialogs[0]);
    content.dialogs = [];
    if (typeof dialogTemplate !== "object" || typeof dialogTemplate === null) {
      throw new Error("json structure not correct")
    } else {
      console.log("processing parsed json ...")
    }

    let set = data[i];
    if (!set?.length) continue;

    for (let j = 0; j < set.length; j++) {
      // clone struction for main question struction
      let dialog = structuredClone(dialogTemplate);
      const ans = set[j]?.qna.answer;
      if(!ans) continue;
      //add question text to structure
      dialog.text = `<p style="text-align:center;">${set[j]?.qna.question}</p>`;

      // @todo refactor and encapsulate the html wrapping
      dialog.answer = jsTTSScript();
      dialog.answer += `<p style="text-align:center;">${set[j]?.qna.answer}</p>`;
      dialog.answer += createButton(ans);
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

///////////////////////////////////////////////////////
// FILL THE BLANKS
export const createFtbFoldersFromTemplate = (data: QnaChunks) => {
  for (let i = 0; i < data.length; i++) {

    mkdirSync(getFtbFolder(i), { recursive: true });
    cpSync(getFtbFolderTemplatePath(), getFtbFolder(i), { recursive: true });


  }
}

export const createFtbH5pJsonFiles = (data: QnaChunks) => {
  for (let i = 0; i < data.length; i++) {
    let h5p = structuredClone(ftbH5pTemplate);
    h5p.title = `Fill in the Blanks no. ${i + 1}`;
    const folder = getFtbFolder(i);
    mkdirSync(folder, { recursive: true });
    writeFileSync(
      `${folder}/h5p.json`,
      JSON.stringify(h5p, null),
      "utf8"
    );
  }

}

export const createFtbContentJsonFiles = (data: MultiChunks) => {
  const formatFtbQuestion = (question: string | undefined) => {
    if(typeof question !== "string") throw new Error("bad data set")
    const words = question.trim().split(/\s+/);
    let longestIndex = -1;
    let longestLength = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if(!word) continue
      if (word.length > longestLength) {
        longestLength = word.length;
        longestIndex = i;
      }
    }
    if(longestIndex === -1) throw new Error("bad data set");
    words[longestIndex] = `*${words[longestIndex]}*`
    return words.join(" ");
  }
  for (let i = 0; i < data.length; i++) {
    let content = structuredClone(ftbContentTemplate);

    let set = data[i];
    if (!set?.length) continue;
    let questions: string[] = [];
    for (let j = 0; j < set.length; j++) {
      const ans = set[j]?.qna.answer;
      if(typeof ans !== "string") continue;
      const button = createButton(ans)
      questions[j] = jsTTSScript();
      questions[j] += `<p style="text-align:center;">${set[j]?.qna.question}</p></br>`;
      questions[j] += `<p style="text-align:center;">${formatFtbQuestion(set[j]?.qna.answer)}</p>`
      questions[j] += button;
    }
    content.questions = questions;
    const folder = `${getFtbFolder(i)}/content`;
    mkdirSync(folder, { recursive: true });
    writeFileSync(
      `${folder}/content.json`,
      JSON.stringify(content, null),
      "utf8"
    );
  }
}

//@todo end todo





