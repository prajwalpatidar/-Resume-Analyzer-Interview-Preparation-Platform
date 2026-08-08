const { GoogleGenAI } = require("@google/genai")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

// Native Google Gen AI schema definitions (uppercase types)
const interviewReportSchema = {
    type: "OBJECT",
    properties: {
        matchScore: {
            type: "INTEGER",
            description: "A score between 0 and 100 indicating how well the candidate's profile matches the job description"
        },
        technicalQuestions: {
            type: "ARRAY",
            description: "Technical questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: "OBJECT",
                properties: {
                    question: { type: "STRING", description: "The technical question can be asked in the interview" },
                    intention: { type: "STRING", description: "The intention of interviewer behind asking this question" },
                    answer: { type: "STRING", description: "How to answer this question, what points to cover, what approach to take etc." }
                },
                required: ["question", "intention", "answer"]
            }
        },
        behavioralQuestions: {
            type: "ARRAY",
            description: "Behavioral questions that can be asked in the interview along with their intention and how to answer them",
            items: {
                type: "OBJECT",
                properties: {
                    question: { type: "STRING", description: "The behavioral question can be asked in the interview" },
                    intention: { type: "STRING", description: "The intention of interviewer behind asking this question" },
                    answer: { type: "STRING", description: "How to answer this question, what points to cover, what approach to take etc." }
                },
                required: ["question", "intention", "answer"]
            }
        },
        skillGaps: {
            type: "ARRAY",
            description: "List of skill gaps in the candidate's profile along with their severity",
            items: {
                type: "OBJECT",
                properties: {
                    skill: { type: "STRING", description: "The skill which the candidate is lacking" },
                    severity: { 
                        type: "STRING", 
                        enum: ["low", "medium", "high"],
                        description: "The severity of this skill gap"
                    }
                },
                required: ["skill", "severity"]
            }
        },
        preparationPlan: {
            type: "ARRAY",
            description: "A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively",
            items: {
                type: "OBJECT",
                properties: {
                    day: { type: "INTEGER", description: "The day number in the preparation plan, starting from 1" },
                    focus: { type: "STRING", description: "The main focus of this day in the preparation plan" },
                    tasks: {
                        type: "ARRAY",
                        items: { type: "STRING" },
                        description: "List of tasks to be done on this day"
                    }
                },
                required: ["day", "focus", "tasks"]
            }
        },
        title: {
            type: "STRING",
            description: "The title of the job for which the interview report is generated"
        }
    },
    required: ["matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan", "title"]
}

const resumePdfSchema = {
    type: "OBJECT",
    properties: {
        html: {
            type: "STRING",
            description: "The HTML content of the resume which can be converted to PDF using any library like puppeteer"
        }
    },
    required: ["html"]
}

async function callGemini({ contents, config }) {
    // List of candidate models in preference order.
    // gemini-3.5-flash is currently highly active, available, and has quota.
    const models = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-2.0-flash"];
    let lastError = null;

    for (const model of models) {
        let retries = 2;
        while (retries >= 0) {
            try {
                console.log(`[GenAI] Attempting generation with model: ${model}`);
                const response = await ai.models.generateContent({
                    model,
                    contents,
                    config
                });
                console.log(`[GenAI] Successful response with model: ${model}`);
                return response;
            } catch (error) {
                lastError = error;
                console.warn(`[GenAI] Warning: Model ${model} failed:`, error.message);

                // If model is not found (404), do not retry; try the next model immediately
                if (error.status === 404 || error.message.includes("not found")) {
                    break;
                }

                // If rate limited (429) or temporary server error (503), retry with backoff
                if ((error.status === 429 || error.status === 503) && retries > 0) {
                    const delay = (3 - retries) * 2000; // 2000ms, then 4000ms
                    console.log(`[GenAI] Rate limit or high demand. Retrying ${model} in ${delay}ms... (${retries} retries left)`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    retries--;
                } else {
                    // Move to the next model
                    break;
                }
            }
        }
    }
    throw new Error(`Failed to generate content after trying all models. Last error: ${lastError.message}`);
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `You are an expert interview coach and career advisor. Analyze the candidate's profile and generate a comprehensive interview report.

Candidate Resume:
${resume}

Candidate Self Description:
${selfDescription}

Job Description:
${jobDescription}

Please generate a detailed interview report with:
1. A matchScore (0-100) indicating how well the candidate matches the job
2. At least 5-7 technical questions specific to the job role with intentions and detailed answers
3. At least 3-5 behavioral questions with intentions and detailed answers  
4. A list of skill gaps (if any) with severity levels (low/medium/high)
5. A 7-14 day preparation plan with specific daily focus areas and actionable tasks
6. The job title extracted from the job description

Ensure all fields are populated with meaningful, specific, and actionable content.`

    try {
        const response = await callGemini({
            contents: [{
                role: "user",
                parts: [{
                    text: prompt
                }]
            }],
            config: {
                responseMimeType: "application/json",
                responseSchema: interviewReportSchema,
            }
        });

        return JSON.parse(response.text || response.response.text());
    } catch (error) {
        console.error("GenAI generateInterviewReport Error:", error.message);
        throw error;
    }
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    try {
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: "networkidle0" })

        const pdfBuffer = await page.pdf({
            format: "A4", margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        })
        return pdfBuffer
    } finally {
        await browser.close()
    }
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate resume for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}

                        the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
                        The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
                        The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
                        you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
                        The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
                        The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
                    `

    try {
        const response = await callGemini({
            contents: [{
                role: "user",
                parts: [{
                    text: prompt
                }]
            }],
            config: {
                responseMimeType: "application/json",
                responseSchema: resumePdfSchema,
            }
        });

        const jsonContent = JSON.parse(response.text || response.response.text());
        const pdfBuffer = await generatePdfFromHtml(jsonContent.html);
        return pdfBuffer;
    } catch (error) {
        console.error("GenAI generateResumePdf Error:", error.message);
        throw error;
    }
}

module.exports = { generateInterviewReport, generateResumePdf }