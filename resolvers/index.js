const User = require('../models/user.js');
const Answer = require('../models/answer.js');
const Stats = require('../models/stats.js');
const Question = require('../models/question.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');




module.exports = {         

    createUser: async (args) => {
        User.findOne({name: args.userInput.name}, function(err, user) {
            if (err) throw err;
            if (user) {
                console.log("already exists");
                return new User(
                {
                    name: user.name,
                    pw: null
                });
            } else {
                bcrypt
                        .hash(args.userInput.pw, 12)
                        .then(hashedPW => {
                            const newUser = new User(
                                {
                                name: args.userInput.name,
                                pw: hashedPW
                                });
                            return newUser.save();
                        })
                        .then(result => {
                            initializeStats(result._doc._id);
                            return {...result._doc,  pw: null };
                        })
                        .catch(err => {
                            throw err;
                        })  
            }
        });  
    },

    login: async ({name, pw}) => {
        const user = await User.findOne({name: name});
        if(!user){
            throw new Error("user doesnt exist");
        }
        const isEqual = await bcrypt.compare(pw, user.pw);
        if(!isEqual){
            throw new Error("pw not correct");
        }
        const token = await jwt.sign({name: name}, "secret", {expiresIn: "1h"});
        return {
            id: user._id,
            token: token,
            exp: 1
        };
    },



    questions: async (args) => {
        if(args.chapter && args.user){
            const questions = await Question.find({chapter: args.chapter});
            if(!questions){
                throw new Error("questions error");
            }
            return questions.map(async  quest => {
                const answer = await Answer.findOne({questionID: quest._id, userID: args.user});
                //console.log(answer);
                if(answer){
                    return  {...quest._doc,  id: quest._id, value: answer.value };
                } else {
                    return  {...quest._doc,  id: quest._id, value: 0 };
                }
            });
        }
    },



    
    createQuestion: async (args) => {
        const newQuestion = new Question({
            left: args.questionInput.left,
            right: args.questionInput.right,
            chapter: args.questionInput.chapter
        });
        newQuestion.save(function (err, result) {
            if (err){
                throw err;
            } else {
                return result;
            }
          });
    },


    

getStatsTotal: async (args) => {  
    const rawStat =  await  Stats.findOne({user: args.user});
        if (rawStat) {
            const chapterAVGs = rawStat._doc.chapter.map(chap => {
                return parseFloat(chap.chapterScore);
            });

            const result = {
                totalAVG: rawStat._doc.totalAVG,
                answerProg: rawStat._doc.answerProg,
                chapterAVGs: chapterAVGs
            }
            return result;
            
        }
},

getStatsChapter: async (args) => {  
    const stat = await Stats.findOne({user: args.user});

    if(stat){
        return {
            chapterScore: stat.chapter[args.chapter].chapterScore,
            valueCounts: stat.chapter[args.chapter].valueCounts
        }
    } else {
        throw new Error("stat not found");
    }
                 
    


},


saveAnswer: async (args) => {
    const filter = {
        questionID: args.id,
        userID: args.user,
    };
    Answer.findOne(filter, async function(err, answer) {
        if (err) throw err;
        if (answer) {
            await Answer.findOneAndUpdate(filter, {value: args.value});
            await updateStats(args.user);
        } else {
            const newAnswer = new Answer({
                questionID: args.id,
                userID: args.user,
                value: args.value,
                chapter: args.chapter
            });
            newAnswer.save(function (err, result) {
                if (err){
                    throw err;
                } else {
                    if(result) {
                        return "ok";
                    } 
                }
              });
        }
    }
    );
},


}



//------------------------------------------------------------------
// aux functions

updateStats = async (user) => {
    const chapterPromises = [...Array(6)].map(async (_, i) => {
        const count = await Answer.countDocuments({ userID: user, chapter: i + 1},  (err, res) => {
            if(res){
                return res;
            }
            if(err){
                throw err;
            }
        });
        const zeros =  await Answer.countDocuments({ userID: user, chapter: i + 1, value: 0},  (err, zeros) => {
            if(zeros){
                return zeros;
            } if(err){throw err;}});
        const ones =  await Answer.countDocuments({ userID: user, chapter: i + 1, value: 1},  (err, ones) => {
            if(ones){
                return ones;
            } if(err){throw err;}});
        const twos =  await Answer.countDocuments({ userID: user, chapter: i + 1, value: 2},  (err, twos) => {
            if(twos){
                return twos;
            } if(err){throw err;}});
        const threes =  await Answer.countDocuments({ userID: user, chapter: i + 1, value: 3},  (err, threes) => {
            if(threes){
                return threes;
            } if(err){throw err;}});
        const fours =  await Answer.countDocuments({ userID: user, chapter: i + 1, value: 4},  (err, fours) => {
            if(fours){
                return fours;
            } if(err){throw err;}});
            
        const sum = await Answer.find({userID: user, chapter: i + 1})
        .then(answers => {
            if(answers){
                answers.map(answer => {
                    return answer.value
                });
                let acc=0;
                for (var i=answers.length; i--;) {
                    acc+=answers[i].value;
                }
                return acc;
            } if(err){
                throw err;
            }
        })
        .catch(err => {
            throw err;
        });
        
        return {
            chapter: i + 1,
            count: count,
            zeros: zeros,
            ones: ones,
            twos: twos,
            threes: threes,
            fours: fours,
            sum: sum
        };
    });
    const results = Promise.all(chapterPromises); // pass array of promises
    results.then(data => {
        
        let chapterStats = data.map((entry, index) => {
           // const sum = entry.ones + entry.twos + entry.threes + entry.fours;
            /*
            let avg;
            if(entry.sum === 0 || entry.count === 0){
                avg = 0;
            } else {
                avg = parseFloat((entry.sum / entry.count).toFixed(3));
            } 
            const progress = entry.count - entry.zeros;
            return {
                //nr: index + 1,
                chapterScore: avg,
                chapterProgress: [progress, entry.count],
                valueCounts: [0,0,0,0,0]
            }
            */
           const valueCounts = [entry.zeros, entry.ones, entry.twos, entry.threes, entry.fours];
           let numberOfQuestions = 0;
           for(let i = 0; i < valueCounts.length; i++){
            numberOfQuestions += valueCounts[i];
           }
           let avg;
            if(entry.count - valueCounts[0] === 0 || entry.count === 0){
                avg = 0;
            } else {
                avg = parseFloat((entry.sum / entry.count).toFixed(3));
            }
            return {
                chapterScore: avg,
                chapterProgress: [entry.count - valueCounts[0], entry.count],
                valueCounts: valueCounts
            }
           

        });
        let totalAVG = 0;
        let totalProgress = [0,0];
        for(let i = 0; i < chapterStats.length; i++){
            totalAVG += chapterStats[i].chapterScore;
            totalProgress[0] += chapterStats[i].chapterProgress[0];     ///
            totalProgress[1] += chapterStats[i].chapterProgress[1];
        }
        totalAVG = parseFloat((totalAVG / chapterStats.length).toFixed(2)); 

        Stats.findOne({user: user}, async function(err, stat) {
            if (err) throw err;
            if (stat) {
                const update = {
                    user: user,
                    totalAVG: totalAVG,
                    answerProg: totalProgress,
                    chapter: chapterStats
                }
                await Stats.findOneAndUpdate(user, update);
            } else {

            }
        });
    });
}








initializeStats = async (user) =>  {
    const initStatZeros = [...Array(6)].map((_, i) => {
        return {
            nr: i,
            chapterScore: 0,
            valueCounts: [0, 0, 0, 0, 0]
        }
    });
    const newStat = new Stats({
        user: user,
        totalAVG: 0,
        answerProg: [0, 0],
        chapter: initStatZeros 
    });
    newStat.save(function (err, result) {
        if (err){
            console.log(err);
            throw err;
        } else {
            if(result){
                console.log(result);
                //return "saved";
            }else {
                //return "not saved";
            }
        }
    }); 
}
