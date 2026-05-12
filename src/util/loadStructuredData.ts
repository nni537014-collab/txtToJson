import {readFileSync } from "fs";
import type { Qna,
              MultiChunks,
              QnaChunks} from '../types/base.ts'
export function loadChunks(path: string): QnaChunks {
  // read whole file as UTF‑8 text
  const raw = readFileSync(path, "utf8");

  // split into lines (handles Windows + Linux newlines)
  const lines = raw.split(/\r?\n/);

  // skip first 2 lines
  const data = lines.slice(2);

  const chunks: QnaChunks = [];

  for (let i = 0; i < data.length; i += 20) {
    const slice = data.slice(i, i + 20).filter(Boolean); // remove empty lines

    if (!slice.length) continue;

    // convert each line into a qna object
    const qnas: Qna[] = slice.map<Qna>((line: string) => {
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

export function chunkToMulti(chunks: QnaChunks){//: multi[][]{
  let ret: MultiChunks = [];  
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
            wrong: new Array<Qna>()
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