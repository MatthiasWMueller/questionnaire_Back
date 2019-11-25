const {buildSchema} = require('graphql');

module.exports = buildSchema(`

type User {
    id: String,
    name: String
    pw: String
}
input UserInput {
    name: String
    pw: String
}

type AuthData {
    id: String
    token: String
    exp: Int
}


type Question {
    id: String
    left: String
    right: String
    chapter: Int
    value: Int
}
input QuestionInput {
    left: String
    right: String
    chapter: Int
}
input NewQuestionInput {
    id: String
    left: String
    right: String
}



input Chapter {
    nr: Int
    chapterScore: Int
    chapterProgress: Int
}

input SetStatInput {
    user: String
    totalAVG: Int
    answerProg: Int
    chapter: [Chapter]
}


type TotalStat {
    totalAVG: Float 
    answerProg: [Int]
    chapterAVGs: [Float]
}
type ChapterStat {
    chapterScore: Float
    valueCounts: [Int]
}




type RootQuery {
    login(name: String, pw: String): AuthData
    questions(chapter: Int, user: String): [Question]

    getStatsTotal(user: String): TotalStat
    getStatsChapter(user: String, chapter: Int): ChapterStat

}
type RootMutation {
    createUser(userInput: UserInput): User
    createQuestion(questionInput: QuestionInput): String
    saveAnswer(id: String, user: String, value: Int, chapter: Int): String

    setStat(setStatInput: SetStatInput): String

}

schema {
    query: RootQuery
    mutation: RootMutation


    
    
}`

);