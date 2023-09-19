/* import { UniqueESSymbolType } from "typescript";

const HINTS_ANSWERS: string = "hintsAnswers";
const HINTS_QUESTIONS: string = "hintsQuestions";
const WORD_TO_DISCOVER: string = "wordToDiscover";
const WORD_TO_DISCOVER_DEFINITION: unique  = "wordToDiscoverDefinition";
 */
interface HintsData {
  [index: number]: string;
}

interface ChallengeDataDocumentInterface {
    hintsAnswers: HintsData;
    hintsQuestions: HintsData;
    wordToDiscover: string;
    wordToDiscoverDefinition: string;
}

//const HINTS_ANSWERS_LENGTH = "hintsAnswersLength";
    //const HINTS_QUESTIONS_DIFFICULTY = "hintsQuestionsDifficulty";
    //hintsAnswersLength: HintsData;
    //hintsQuestionsDifficulty: HintsData;
    //numberOfGuessingTriesAllowed: number;    

interface ChallengeIndexDocumentInterface {
    creationDate: Date
    category: string
    categoryUid: string
    challengeDataUid: string
    commentCount: number
    likeCount: number
    description: string
    difficulty: number
    title: string,
    userDisplayName: string
}

// This data is introduced by the user in the creation of a new account to play in SKWords
interface UserDocumentInterface {
    uid:string,
    skPoints: number,
    postsIndexCollectionUids:Array<string>,
    likedChallengesIndexUids:Array<string>,
    dislikedChallengesIndexUids:Array<string>,
    name: string,
    nickname: string,
    birthday: Date,
    email: string,
    accCreationDate: Date,
    skChallengesPlayed?: Array<Object>,
    skPointsHistory?: Array<Object>,
}

// This data is admin by Firebase (Google associated account) internally and is associated to the user's email
interface UserIndexInterface {
    createdAt: number,
    email: string,
    emailVerified: boolean,
    isAnonymous: boolean,
    lastLoginAt: number,
    phoneNumber: string,
    photoURL: string,
    uid: string
}

interface challengesIndexObjectInterface extends ChallengeIndexDocumentInterface{
    challengeIndexUid: string,
}

interface challengeOfTheDayInterface extends challengesIndexObjectInterface{
}

export {ChallengeDataDocumentInterface,ChallengeIndexDocumentInterface, UserDocumentInterface, UserIndexInterface,challengesIndexObjectInterface,challengeOfTheDayInterface}