import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60; // Allow up to 60 seconds for Gemini API response on Vercel

export async function POST(req: NextRequest) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    if (!GEMINI_API_KEY || GEMINI_API_KEY === "your_gemini_api_key_here") {
      return NextResponse.json(
        { error: "Gemini API key is not configured. Please set GEMINI_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { scenario, domain, options, parameters } = body;

    if (!scenario || !domain || !options || options.length < 2) {
      return NextResponse.json(
        { error: "Missing required fields: scenario, domain, and at least 2 options." },
        { status: 400 }
      );
    }

    const parameterContext = parameters
      ?.map((p: { label: string; value: number }) => `${p.label}: ${p.value}/100`)
      .join(", ");

    const optionsList = options
      .map((o: { text: string }, i: number) => `Option ${i + 1}: ${o.text}`)
      .join("\n");

    const prompt = `You are a world-class Decision Scientist and Chief Strategy Officer. Your task is to analyze the following decision scenario and provide a highly rigorous, objective, and data-driven analysis. 

**Domain / Industry Context:** ${domain}
**The Core Scenario:** ${scenario}

**Available Options:**
${optionsList}

**User Parameters (Weight these heavily in your evaluation):** ${parameterContext || "Default values"}

### Analysis Directives:
1. **Rigor & Logic**: Apply established decision-making frameworks (e.g., Cost-Benefit Analysis, Expected Value, Second-Order Effects). Look beyond the obvious.
2. **Trade-offs**: Explicitly evaluate the trade-offs of each option. What are the hidden costs or risks?
3. **Parameter Alignment**: The 'User Parameters' dictate what the user values most. Your final recommendation MUST strongly align with these specific parameters.
4. **Actionable Insights**: Provide a profound, non-obvious insight that shifts how the user thinks about this problem.

Respond ONLY with valid JSON in this exact format (no markdown, no code fences, no extra text):
{
  "recommendation": "A highly confident, decisive 1-2 sentence recommendation of the optimal option.",
  "recommendedOption": "The exact text of the recommended option",
  "insight": "A profound, non-obvious strategic insight about this specific decision (2-3 sentences).",
  "whyThisWorks": "A compelling justification of why this option is superior, explicitly connecting it to the User Parameters and mitigating major risks (2-3 sentences).",
  "options": [
    {
      "option": "Exact text of option 1",
      "successProbability": 75,
      "riskLevel": "Low|Medium|High",
      "rewardLevel": "Low|Medium|High",
      "pros": ["Highly specific pro 1", "Highly specific pro 2", "Highly specific pro 3"],
      "cons": ["Critical con or hidden risk 1", "Critical con or hidden risk 2", "Critical con or hidden risk 3"],
      "detailedAnalysis": "A rigorous 3-4 sentence evaluation of this option. Discuss its feasibility, alignment with parameters, and potential second-order consequences."
    }
  ]
}

### Formatting Rules:
- \`successProbability\` must be an integer between 0 and 100 representing the realistic likelihood of a positive outcome.
- \`riskLevel\` and \`rewardLevel\` must be exactly "Low", "Medium", or "High".
- Each option MUST have exactly 3 pros and 3 cons. Ensure they are specific, not generic filler.
- You MUST provide analysis for EVERY option provided in the prompt.
- Do not output anything outside of the JSON structure.`;

    const geminiResponse = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.90,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error("Gemini API error:", errorData);
      let errorMessage = "Failed to get response from AI.";
      try {
        const parsed = JSON.parse(errorData);
        if (parsed.error && parsed.error.message) {
          errorMessage = parsed.error.message;
        }
      } catch (e) {
        // use raw text if not json
        errorMessage = errorData.substring(0, 100);
      }
      return NextResponse.json(
        { error: `Gemini API Error (${geminiResponse.status}): ${errorMessage}` },
        { status: 502 }
      );
    }

    const geminiData = await geminiResponse.json();

    const textContent =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error("No text in Gemini response:", JSON.stringify(geminiData));
      return NextResponse.json(
        { error: "Received empty response from AI. Please try again." },
        { status: 502 }
      );
    }

    // Clean the response - strip markdown code fences if present
    let cleanedText = textContent.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(cleanedText);
    } catch {
      console.error("Failed to parse Gemini JSON:", cleanedText);
      return NextResponse.json(
        { error: "AI returned an invalid response. Please try again." },
        { status: 502 }
      );
    }

    // Validate structure
    if (!analysisResult.recommendation || !analysisResult.options || !Array.isArray(analysisResult.options)) {
      return NextResponse.json(
        { error: "AI returned incomplete analysis. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
