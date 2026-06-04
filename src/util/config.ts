import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { z } from 'zod';
import { parseArgs } from 'node:util';

///////////////////////////////////////////
// DEFINE STRINGS FOR RELATIVE PATHS 
// GET PWD AND FIND ROOT
const __filename = fileURLToPath(import.meta.url);
const backToRoot = '/../../'
const __rootDirname = path.dirname(__filename) + backToRoot;
const utilsFromRoot = "/src/util";
const h5pFilename = 'h5p.json'
const h5pContentFolderName = 'content';
const h5pContentFilename = 'content.json';
const distFolderName = 'dist';
const assetsFolderName = 'assets';
const assetsH5pFolderName = 'h5p';
const quiz = "quiz";
const quizListening = "quiz-listening";
const dialog = "dialog";
const ftb = "ftb";
const ttsFilePath = `${__rootDirname}${utilsFromRoot}/tts.ts`
export const cssQuizListeningQuestion = "listening-question"
export const langBase = 'en-US';
export const langLearning = 'es-ES';
export const paths = {
  quizOutFolder: path.join(distFolderName, quiz),
  quizListeningOutFolder: path.join(distFolderName, quizListening),
  dialogOutFolder: path.join(distFolderName, dialog),
  ftbOutFolder: path.join(distFolderName, ftb),
  questionSetFolderTemplate: path.join(assetsFolderName, assetsH5pFolderName, quiz),
  questionSetListeningFolderTemplate: path.join(assetsFolderName, assetsH5pFolderName, quizListening),
  dialogFolderTemplate: path.join(assetsFolderName, assetsH5pFolderName, dialog),
  ftbFolderTemplate: path.join(assetsFolderName, assetsH5pFolderName, ftb),
  cards: path.join(assetsFolderName, "cards.txt"),
};

////////////////////////////////////////////////
// FOLDER TEMPLATE PATHS
export const quizFolderTemplatePath = path.resolve(__rootDirname, paths.questionSetFolderTemplate);
export const quizListeningFolderTemplatePath = path.resolve(__rootDirname, paths.questionSetListeningFolderTemplate);
export const dialogFolderTemplatePath = path.resolve(__rootDirname, paths.dialogFolderTemplate);
export const ftbFolderTemplatePath = path.resolve(__rootDirname, paths.ftbFolderTemplate);
///////////////////////////////////////////////
// H5P TEMPLATES
export const quizH5pTemplate = (() => {
  const p = path.join(quizFolderTemplatePath,
    h5pFilename);
  return JSON.parse(readFileSync(p, "utf8"));
})();
export const quizListeningH5pTemplate = (() => {
  const p = path.join(quizListeningFolderTemplatePath,
    h5pFilename);
  return JSON.parse(readFileSync(p, "utf8"));
})();
export const dialogH5pTemplate = (() => {
  const p = path.join(dialogFolderTemplatePath,
    h5pFilename);
  return JSON.parse(readFileSync(p, "utf8"));
})();

export const ftbH5pTemplate = (() => {
  const p = path.join(ftbFolderTemplatePath,
    h5pFilename);
  return JSON.parse(readFileSync(p, "utf8"));
})();
///////////////////////////////////////////////////////////
// CONTENT TEMPLATES
export const quizContentTemplate = (() => {
  const p = path.join(quizFolderTemplatePath,
    h5pContentFolderName,
    h5pContentFilename)
  return JSON.parse(readFileSync(p, "utf8"));
})()

export const quizListeningContentTemplate = (() => {
  const p = path.join(quizListeningFolderTemplatePath,
    h5pContentFolderName,
    h5pContentFilename)
  return JSON.parse(readFileSync(p, "utf8"));
})()

export const dialogContentTemplate = (() => {
  const p = path.join(dialogFolderTemplatePath,
    h5pContentFolderName,
    h5pContentFilename)
  return JSON.parse(readFileSync(p, "utf8"));
})()

export const ftbContentTemplate = (() => {
  const p = path.join(ftbFolderTemplatePath,
    h5pContentFolderName,
    h5pContentFilename)
  return JSON.parse(readFileSync(p, "utf8"));
})()
///////////////////////////////////////////////////
// OUT FOLDERS
export const quizOutFolder = path.resolve(__rootDirname, paths.quizOutFolder)
export const getNumberedQuizFolder = (i: number) => {
  return path.join(quizOutFolder, `${quiz}${i + 1}`)
}

export const quizListeningOutFolder = path.resolve(__rootDirname, paths.quizListeningOutFolder)
export const getNumberedQuizListeningFolder = (i: number) => {
  return path.join(quizListeningOutFolder, `${quizListening}${i + 1}`)
}

export const dialogOutFolder = path.resolve(__rootDirname, paths.dialogOutFolder);
export const getNumberedDialogFolder = (i: number) => {
  return path.join(dialogOutFolder, `${dialog}${i + 1}`);
}

export const ftbOutFolder = path.resolve(__rootDirname, paths.ftbOutFolder);
export const getNumberedFtbFolder = (i: number) => {
  return path.join(ftbOutFolder, `${ftb}${i + 1}`);
}
//////////////////////////////////////////////////////
// CARDS
export const getCardsPath = () => {
  return path.resolve(__rootDirname, paths.cards);
}
//////////////////////////////////////////////
// TTS 
export const getTTSFilePath = () => {
  return ttsFilePath;
}
