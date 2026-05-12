export type qna = {
    question: string;
    answer: string;
}
export type multi = {
    qna: qna;
    wrong: qna[];
}

export interface H5PMultiChoiceAnswer {
  text: string;
  correct: boolean;
}

export interface H5PMultiChoiceParams {
  question: string;
  answers: H5PMultiChoiceAnswer[];
  behaviour?: {
    enableRetry?: boolean;
    enableSolutionsButton?: boolean;
    randomAnswers?: boolean;
  };
}
export interface H5PMultiChoice {
  library: "H5P.MultiChoice 1.14" | "H5P.MultiChoice 1.15";
  params: H5PMultiChoiceParams;
}

export interface H5PQuestionSetParams {
  title?: string;
  introPage?: {
    showIntroPage: boolean;
    title?: string;
    introduction?: string;
  };
  endPage?: {
    showResultPage: boolean;
    title?: string;
    subtitle?: string;
  };
  questions: H5PMultiChoice[];
}

export interface H5PQuestionSet {
  library: "H5P.QuestionSet 1.17" | "H5P.QuestionSet 1.18";
  params: H5PQuestionSetParams;
}