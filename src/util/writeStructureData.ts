import {
  mkdirSync,
  writeFileSync,
  cpSync,
  rmSync
} from "fs";
import fs from "fs";
import archiver from "archiver";
import path from "path"
import {
  randomUUID
} from "crypto";

import type {
  QnaChunks,
  MultiChunks
} from '../types/base.ts';

import {
  quizH5pTemplate,
  getNumberedQuizFolder,
  quizContentTemplate,
  quizFolderTemplatePath,
  quizOutFolder,

  dialogH5pTemplate,
  getNumberedDialogFolder,
  dialogFolderTemplatePath,
  dialogContentTemplate,
  dialogOutFolder,
  
  ftbH5pTemplate,
  getNumberedFtbFolder,
  ftbFolderTemplatePath,
  ftbContentTemplate,
  ftbOutFolder,
} from './config.ts'

import { 
  jsTTSScript,
  createButton,
 } from './contentRenderHelpers.ts'

//////////////////////////////////
// DATA & TYPES
type H5pDep = {
  "machineName": string,
  "majorVersion": string,
  "minorVersion": string
}
type h5pJson = {
  "preloadedDependencies"?: H5pDep[]
}
const customLib: H5pDep = {
  machineName: "H5P.TTS",
  majorVersion: "1",
  minorVersion: "0"
}
///////////////////////////////////////////////
// WRITE UTIL FUNCS
export const rmDistFolder = () => {
  rmSync(quizOutFolder, { recursive: true, force: true });
  rmSync(dialogOutFolder, { recursive: true, force: true });
  rmSync(ftbOutFolder, { recursive: true, force: true });
}

const addCustomLibToH5pJson = <T extends h5pJson> (templ: T)=> {
  if (!Array.isArray(templ?.preloadedDependencies)){
    templ.preloadedDependencies = [];
  }
  templ.preloadedDependencies.push(customLib);
  return templ; 
}

const splitPath = (p: string) =>  {
  const dir = path.dirname(p);      // everything except the last part
  const last = path.basename(p);    // last directory or filename

  return { dir, last };
}
const archiveContent = (dirpath: string) => {
  const {dir, last} = splitPath(dirpath);
  
  const output = fs.createWriteStream(dirpath+".zip");

  const archive = archiver("zip", {
    zlib: { level: 9 },
    forceLocalTime: true
  });

  archive.pipe(output);

  // Remove directory entries (equivalent to -D)
  archive.directory(dirpath, false, file => {
    if (file.name.endsWith("/")) return false; // skip directory entries
    return file;
  });

  // Remove extra attributes (equivalent to -X)
  archive.on("entry", entry => {
    entry = {
      ...entry,
      mode: 0o644,          // strip permissions
      // mtime: new Date(0)    // strip timestamps
    };
  });

  archive.finalize();

}
//////////////////////////////////////////////
// QUIZ

export const createQuizFoldersFromTemplate = (data: QnaChunks) => {
  // for (let i = 0; i < data.length; i++) {
    //@todo /quiz --- remove strings!!
    mkdirSync(getNumberedQuizFolder(0), { recursive: true });
    cpSync(quizFolderTemplatePath, getNumberedQuizFolder(0), { recursive: true });
    //copy default folder to created folder
  // }
}

export const createQuizH5pJsonFiles = (data: QnaChunks) => {
  for (let i = 0; i < data.length; i++) {
    let h5p = structuredClone(quizH5pTemplate);
    if (h5p?.title) {
      h5p.title = `Quiz no. ${i + 1}`;
    } else {
      console.warn("no title in json")
    }
    h5p = addCustomLibToH5pJson(h5p);
    const folder = getNumberedQuizFolder(i);
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
            <span>${ans}</span>
            ${createButton(ans)}`;
  }
  for (let i = 0; i < data.length; i++) {
    let content = structuredClone(quizContentTemplate);
    let questionTemplate = structuredClone(content?.questions[0]);
    // reset questions after taking template
    content.questions = []
    if (typeof questionTemplate !== "object" || typeof questionTemplate === null) {
      throw new Error("json structure not correct")
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

    const folder = `${getNumberedQuizFolder(i)}/content`;
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
  // for (let i = 0; i < data.length; i++) {
    mkdirSync(getNumberedDialogFolder(0), { recursive: true });
    cpSync(dialogFolderTemplatePath, getNumberedDialogFolder(0), { recursive: true });
  // }
}

export const createDialogH5pJsonFiles = (data: QnaChunks) => {
  for (let i = 0; i < data.length; i++) {
    let h5p = structuredClone(dialogH5pTemplate);
    h5p.title = `Dialog no. ${i + 1}`;
    h5p = addCustomLibToH5pJson(h5p);
    const folder = getNumberedDialogFolder(i);
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
    const folder = `${getNumberedDialogFolder(i)}/content`;
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
  // for (let i = 0; i < data.length; i++) {

    mkdirSync(getNumberedFtbFolder(0), { recursive: true });
    cpSync(ftbFolderTemplatePath, getNumberedFtbFolder(0), { recursive: true });

  // }
}

export const createFtbH5pJsonFiles = (data: QnaChunks) => {
  for (let i = 0; i < data.length; i++) {
    let h5p = structuredClone(ftbH5pTemplate);
    h5p.title = `Fill in the Blanks no. ${i + 1}`;
    h5p = addCustomLibToH5pJson(h5p);
    const folder = getNumberedFtbFolder(i);
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
    const folder = `${getNumberedFtbFolder(i)}/content`;
    mkdirSync(folder, { recursive: true });
    writeFileSync(
      `${folder}/content.json`,
      JSON.stringify(content, null),
      "utf8"
    );
  }
}

//@todo end todo





