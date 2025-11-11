export default async function handler(req, res) {
  try {
    const { userProfile } = await req.json()

    const prompt = `
You are a certified health and wellness coach. Create a personalized plan based on:
${JSON.stringify(userProfile, null, 2)}

Return ONLY valid JSON (no markdown, no backticks) with this structure:
{
  "weeklyGoal": "One clear, achievable goal for this week",
  "fitnessRecommendations": [
    {"activity": "name", "duration": "time", "frequency": "times per week", "why": "benefit"}
  ],
  "nutritionRecommendations": [
    {"suggestion": "specific advice", "example": "practical example", "benefit": "why this helps"}
  ],
  "sleepRecommendations": [
    {"tip": "actionable advice", "impact": "expected benefit"}
  ],
  "mindfulnessRecommendations": [
    {"practice": "activity", "duration": "time", "benefit": "how it helps"}
  ],
  "quickWins": ["Easy action to start today"],
  "motivation": "Personalized encouraging message"
}
    `

    const response = await fetch("https://api.anthropic.com/v1/complete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4",
        prompt: prompt,
        max_tokens_to_sample: 2000,
        stop_sequences: ["\n\n"],
      }),
    })

    const data = await response.json()

    // Anthropic returns text in 'completion' field
    const completionText = data.completion || ""

    // Attempt to parse JSON from completion (since you asked for JSON only)
    let parsedPlan = null
    try {
      parsedPlan = JSON.parse(completionText)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      return res.status(500).json({ error: "Failed to parse plan JSON from API response" })
    }

    return res.status(200).json(parsedPlan)
  } catch (error) {
    console.error("API error:", error)
    return res.status(500).json({ error: "Failed to generate plan" })
  }
}
