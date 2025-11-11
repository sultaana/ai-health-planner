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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
      }),
    })

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Failed to generate plan" })
  }
}
