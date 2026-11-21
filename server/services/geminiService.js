import fs from 'fs';
import { getGeminiClients } from '../config/gemini.js';
import { getDepartmentForCategory } from '../utils/constants.js';

export const analyzeCivicImage = async (filePath, mimeType, language = 'en') => {
  const { googleGenAI, genAIClient, apiKey, modelName } = getGeminiClients();

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured in server/.env. Please configure a valid Google Gemini API key.');
  }

  // Read image bytes and encode to base64
  const imageBuffer = fs.readFileSync(filePath);
  const base64Data = imageBuffer.toString('base64');

  const languagePrompt = language === 'te'
    ? 'Provide description, recommendation, and reason in fluent, natural Telugu (తెలుగు) script. The issueType, severity, and department values should be standard English categories so systems can route them properly, but description, recommendation and reason must be in Telugu.'
    : 'Provide all text in clear, professional English.';

  const prompt = `You are CivicEye AI, a computer vision and public infrastructure triage expert for smart cities and public governance.
Analyze this civic photograph carefully and objectively.

GOAL:
Determine whether the photograph shows a public civic infrastructure problem, classify it, estimate severity, recommend the municipal department, and suggest corrective actions.

SUPPORTED CIVIC CATEGORIES:
- Potholes and damaged roads
- Garbage accumulation
- Water leakage
- Drainage overflow
- Broken streetlights
- Public infrastructure damage
- Pollution
- Other civic issues

SEVERITY RULES:
- Critical: Immediate potential danger to human life or severe risk (e.g. massive open sinkhole, exposed live high-voltage electrical wires, flooded main thoroughfare).
- High: Significant public infrastructure problem requiring priority attention (e.g. large pothole on busy street, overflowing contaminated sewage, burst water main).
- Medium: Standard problem requiring timely maintenance (e.g. moderate road wear, unattended garbage pile, broken curb).
- Low: Minor issue or routine cosmetic maintenance (e.g. minor litter, fading road markings).

IMPORTANT CONSTRAINTS:
1. If the image is unclear, blurry, or does NOT contain any recognizable civic infrastructure issue (e.g., a selfie, indoor pet, food, random object, wallpaper), set "isCivicIssue": false, and explain in the reason.
2. Never invent or hallucinate issues.
3. Do NOT attempt to guess the geographic location from the photo.
4. Output MUST be strictly valid JSON with no markdown backticks, no markdown wrapping, and no additional commentary.

${languagePrompt}

JSON Schema to follow strictly:
{
  "isCivicIssue": boolean,
  "issueType": "Potholes and damaged roads" | "Garbage accumulation" | "Water leakage" | "Drainage overflow" | "Broken streetlights" | "Public infrastructure damage" | "Pollution" | "Other civic issues",
  "description": string,
  "severity": "Critical" | "High" | "Medium" | "Low",
  "confidence": "High" | "Medium" | "Low",
  "department": "Roads and Infrastructure Department" | "Sanitation Department" | "Water Supply Department" | "Drainage Department" | "Electrical Department" | "Environmental Department" | "Public Works Department" | "General Administration",
  "recommendation": string,
  "reason": string
}`;

  // Candidate models with smart fallback in case a model is deprecated or busy
  const candidateModels = Array.from(new Set([
    'gemini-3.5-flash-lite',
    modelName,
    'gemini-3.8-flash',
    'gemini-3.6-flash'
  ])).filter(Boolean);

  let rawText = '';
  let lastError = null;

  for (const currentModel of candidateModels) {
    try {
      if (googleGenAI) {
        // Use @google/genai SDK
        const response = await googleGenAI.models.generateContent({
          model: currentModel,
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType || 'image/jpeg',
                    data: base64Data
                  }
                }
              ]
            }
          ]
        });

        rawText = response.text || (response.candidates?.[0]?.content?.parts?.[0]?.text) || '';
      } else if (genAIClient) {
        // Use @google/generative-ai SDK
        const model = genAIClient.getGenerativeModel({ model: currentModel });
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType || 'image/jpeg'
            }
          }
        ]);
        const res = await result.response;
        rawText = res.text();
      }

      if (rawText) {
        console.log(`✓ Successful Gemini analysis using model: ${currentModel}`);
        break;
      }
    } catch (err) {
      console.warn(`Model ${currentModel} encountered error:`, err.message);
      lastError = err;
      // If error indicates model is not found, deprecated, unavailable, or high demand, try next model
      const isRecoverableError =
        err.message?.includes('404') ||
        err.message?.includes('503') ||
        err.message?.includes('not found') ||
        err.message?.includes('NOT_FOUND') ||
        err.message?.includes('UNAVAILABLE') ||
        err.message?.includes('high demand') ||
        err.message?.includes('no longer available') ||
        err.message?.includes('overloaded');

      if (isRecoverableError) {
        continue;
      } else {
        throw err;
      }
    }
  }

  if (!rawText) {
    throw lastError || new Error('No response from Gemini API models.');
  }

  try {
    // Clean JSON response
    let cleanJson = rawText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(cleanJson);

    // Validate and sanitize parsed output
    const validated = {
      isCivicIssue: Boolean(parsed.isCivicIssue),
      issueType: parsed.issueType || 'Other civic issues',
      description: parsed.description || 'No description provided.',
      severity: ['Critical', 'High', 'Medium', 'Low'].includes(parsed.severity)
        ? parsed.severity
        : 'Medium',
      confidence: ['High', 'Medium', 'Low'].includes(parsed.confidence)
        ? parsed.confidence
        : 'Medium',
      department: parsed.department || getDepartmentForCategory(parsed.issueType),
      recommendation: parsed.recommendation || 'Forward to relevant municipal authority for inspection.',
      reason: parsed.reason || 'AI assessment based on visual inspection.'
    };

    return validated;
  } catch (parseError) {
    console.error('JSON parsing error on Gemini response:', parseError, rawText);
    throw new Error('Could not parse structured analysis from Gemini response.');
  }
};
