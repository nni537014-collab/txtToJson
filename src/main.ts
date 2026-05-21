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
  createFtbFoldersFromTemplate,
  createFtbH5pJsonFiles,
  createFtbContentJsonFiles,
} from './util/writeStructureData.ts'



const asQna = loadChunks(getCardsPath());

rmDistFolder();
createFtbFoldersFromTemplate(asQna);
createFtbH5pJsonFiles(asQna);
createFtbContentJsonFiles(chunkToMulti(asQna))

createQuizFoldersFromTemplate(asQna);
createQuizH5pJsonFiles(asQna);
createQuizContentJsonFiles(chunkToMulti(asQna));

createDialogFoldersFromTemplate(asQna);
createDialogH5pJsonFiles(asQna);
createDialogContentJsonFiles(chunkToMulti(asQna));
  
;