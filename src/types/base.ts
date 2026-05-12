export type qna = {
    question: string;
    answer: string;
}
export type QnaChunks = qna[][];

export type multi = {
    qna: qna;
    wrong: qna[];
}