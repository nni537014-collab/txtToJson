import { 
  getCardsPath 
} from './util/config.ts'

import {
  loadChunks,
  chunkToMulti
} from './util/loadStructuredData.ts'

import {
  rmDistFolder,
  createQuizH5pJsonFiles,
  createQuizContentJsonFiles,
  createQuizFoldersFromTemplate,
  createDialogContentJsonFiles,
  createDialogFoldersFromTemplate,
  createDialogH5pJsonFiles,
} from './util/writeStructureData.ts'



const asQna = loadChunks(getCardsPath());

rmDistFolder();
createQuizFoldersFromTemplate(asQna);
createQuizH5pJsonFiles(asQna);
createQuizContentJsonFiles(chunkToMulti(asQna));

createDialogFoldersFromTemplate(asQna);
createDialogH5pJsonFiles(asQna);
createDialogContentJsonFiles(chunkToMulti(asQna));
  