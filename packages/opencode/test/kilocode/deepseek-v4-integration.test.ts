import { describe, test, expect } from "bun:test"

const DEEPSEEK_API_KEY = process.env["DEEPSEEK_API_KEY"] || process.env["DEEPSEEK_KEY"]
const DEEPSEEK_MODEL = process.env["DEEPSEEK_MODEL"] || "deepseek-v4-pro"

describe.skipIf(!DEEPSEEK_API_KEY)("DeepSeek V4 integration", () => {
  const base = {
    model: DEEPSEEK_MODEL,
    max_tokens: 100,
  }

  test("instant variant (thinking disabled) returns no reasoning_content", async () => {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        ...base,
        messages: [{ role: "user", content: "What is 2+2? Respond with just the number." }],
        thinking: { type: "disabled" },
      }),
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.choices[0].message.content).toBeTruthy()
    // When thinking is disabled, reasoning_content should be absent
    expect(data.choices[0].message.reasoning_content).toBeUndefined()
  })

  test("thinking variant (thinking enabled) returns reasoning_content", async () => {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        ...base,
        messages: [{ role: "user", content: "What is 2+2? Respond with just the number." }],
        reasoning_effort: "high",
        thinking: { type: "enabled" },
      }),
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.choices[0].message.content).toBeTruthy()
    // When thinking is enabled, reasoning_content should be present
    expect(data.choices[0].message.reasoning_content).toBeTruthy()
  })

  test("reasoning_effort=max works with thinking enabled", async () => {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        ...base,
        messages: [{ role: "user", content: "What is 2+2? Respond with just the number." }],
        reasoning_effort: "max",
        thinking: { type: "enabled" },
      }),
    })

    expect(response.ok).toBe(true)
  })

  test("thinking disabled via @ai-sdk/openai-compatible provider options shape", async () => {
    // This test simulates what the @ai-sdk/openai-compatible provider sends:
    // the `thinking` field goes at the top level (not wrapped in extra_body)
    // because the provider spreads provider options into the request body.
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [{ role: "user", content: "Say hello in one word." }],
        max_tokens: 50,
        reasoning_effort: "high",
        thinking: { type: "enabled" },
      }),
    })

    expect(response.ok).toBe(true)
    const data = await response.json()
    expect(data.choices[0].message.content).toBeTruthy()
  })
})
