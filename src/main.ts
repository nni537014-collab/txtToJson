import { 
  getCardsPath 
} from './util/config.ts'

import {
  loadChunks,
  chunkToMulti
} from './util/loadStructuredData.ts'

import {
  createQuizH5pJsonFiles,
  createQuizContentJsonFiles,
  createQuizFoldersFromTemplate
} from './util/writeStructureData.ts'



const asQna = loadChunks(getCardsPath())
createQuizFoldersFromTemplate(asQna);
createQuizH5pJsonFiles(asQna);
createQuizContentJsonFiles(chunkToMulti(asQna));
