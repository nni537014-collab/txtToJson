export type Qna = {
    question: string;
    answer: string;
}
export type QnaChunks = Qna[][];

export type Multi = {
    qna: Qna;
    wrong: Qna[];
}

export type MultiChunks = Multi[][];