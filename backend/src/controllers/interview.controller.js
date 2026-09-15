const mammoth = require("mammoth")
const { generateInterviewReport, generateResumePdf } = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReport.model")

async function parsePdfBuffer(buffer) {
    const pdfParse = require("pdf-parse")
    if (typeof pdfParse === "function") {
        const parsed = await pdfParse(buffer)
        return parsed.text || ""
    } else if (pdfParse && typeof pdfParse.PDFParse === "function") {
        const parser = new pdfParse.PDFParse({ data: buffer })
        const parsed = await parser.getText()
        return parsed.text || ""
    } else if (pdfParse && typeof pdfParse.default === "function") {
        const parsed = await pdfParse.default(buffer)
        return parsed.text || ""
    } else if (pdfParse && typeof pdfParse.default?.PDFParse === "function") {
        const parser = new pdfParse.default.PDFParse({ data: buffer })
        const parsed = await parser.getText()
        return parsed.text || ""
    }
    throw new Error("Unsupported pdf-parse module format")
}

async function generateInterViewReportController(req, res){
    const { selfDescription, jobDescription } = req.body

    if (!jobDescription || !jobDescription.trim()) {
        return res.status(400).json({
            message: "Job description is required."
        })
    }

    let resumeText = ""
    if (req.file) {
        const originalName = req.file.originalname?.toLowerCase() || ""
        const mimeType = req.file.mimetype || ""

        try {
            if (originalName.endsWith(".docx") || mimeType.includes("wordprocessingml")) {
                const result = await mammoth.extractRawText({ buffer: req.file.buffer })
                resumeText = result.value || ""
            } else if (originalName.endsWith(".pdf") || mimeType.includes("pdf")) {
                resumeText = await parsePdfBuffer(req.file.buffer)
            } else if (originalName.endsWith(".txt") || mimeType.includes("text")) {
                resumeText = req.file.buffer.toString("utf-8")
            } else {
                // Fallback attempt with pdfParse
                try {
                    resumeText = await parsePdfBuffer(req.file.buffer)
                } catch (e) {
                    resumeText = req.file.buffer.toString("utf-8")
                }
            }
        } catch (err) {
            console.error("Error parsing resume file:", err)
            return res.status(400).json({
                message: "Failed to parse resume file. Please upload a valid PDF or DOCX file."
            })
        }
    }

    if (!resumeText && !selfDescription) {
        return res.status(400).json({
            message: "Either a resume or a self-description is required."
        })
    }

    const interViewReportByAi = await generateInterviewReport({
        resume: resumeText,
        selfDescription: selfDescription || "",
        jobDescription 
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user.id,
        resume: resumeText,
        selfDescription: selfDescription || "",
        jobDescription,
        title: interViewReportByAi.title || jobDescription.split('\n')[0].substring(0, 100),
        ...interViewReportByAi
    })

    res.status(201).json({
        message: "Interview report generated successfully.",
        interviewReport
    })
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {

    const { interviewId } = req.params

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    })
}


/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    })
}


/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params

    const interviewReport = await interviewReportModel.findById(interviewReportId)

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        })
    }

    const { resume, jobDescription, selfDescription } = interviewReport

    const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

    res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
    })

    res.send(pdfBuffer)
}




module.exports ={ generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }