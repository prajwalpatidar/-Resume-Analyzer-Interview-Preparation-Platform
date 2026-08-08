const mongoose = require('mongoose');


/**
 * - job description schema
 * - resume text
 * - self description : string
 * 
 * - matchScore : Number
 * 
 * Technical questions : [{
 *          question : "",
 *          intention : "",
 *         answer : "",
 *       feedback : ""}]
 * Behavioral questions : [{
 *         question : "",
 *          intention : "",
 *          answer : "",
 * }]
 * skill gaps : [{
 *      skill : "",
 *      severity : {
 *      type : string,
 *      enum : ["low", "medium", "high"]
 * }
 *    
 * }]
 * preparation plans : [{
 *          day : Number,
 *          focus : string,
 *          task:[string]
 * }]
 */

const technicalQuestionSchema = new mongoose.Schema({
question: {
      type: String,
      required: [ true, "technical question is required" ]
    },
    intention: {
      type: String,
      required: [ true, "intention is required" ]
    },
    answer: {
      type: String,
      required: [ true, "answer is required" ]
    }
    
}, {
    _id: false
})

const behavioralQuestionSchema = new mongoose.Schema({
    question: {
      type: String,
      required: [ true, "technical question is required" ]
    },
    intention: {
      type: String,
      required: [ true, "intention is required" ]
    },
    answer: {
      type: String,
      required: [ true, "answer is required" ]
    }
}, {
    _id: false
})

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [ true, "skills is required" ]
    },
    severity: {
        type: String,
        enum: [ "low", "medium", "high"],
        required: [ true, "severity is required"]
    }
}, {
    _id: false
})

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [ true, "Day is required"]
    },
    focus: {
        type: String,
        required: [ true, "focus is required"]
    },
    tasks: [ {
            type: String,
            required: [ true, "task is required"]
        } ]
})


const interviewReportSchema = new mongoose.Schema({
  jobDescription: {
    type: String,
    required: [ true, "job description is required" ]
  },
  resume: {
    type: String,

  },
  selfDescription: {
    type: String,
  },

  matchScore: {
    type: Number,
    min: 0,
    max: 100,
  },
    technicalQuestions: [ technicalQuestionSchema ],
    behavioralQuestions: [ behavioralQuestionSchema ],
    skillGaps: [ skillGapSchema ],
    preparationPlan: [ preparationPlanSchema ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    title: {
        type: String,
        required: [ true, "Job title is required" ]
    }
}, {
    timestamps: true
})


 const interviewReportModel = mongoose.model("interviewReports", interviewReportSchema);

 module.exports = interviewReportModel;