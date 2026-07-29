import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
  try {
    const nvidia = new OpenAI({
      apiKey: process.env.NVIDIA_API_KEY!,
      baseURL: 'https://integrate.api.nvidia.com/v1'
    })

    const completion = await nvidia.chat.completions.create({
      model: 'meta/llama-3.3-70b-instruct',
      messages: [{ role: 'user', content: 'Say hello in one sentence.' }],
      max_tokens: 50
    })

    return NextResponse.json({
      success: true,
      response: completion.choices[0].message.content,
      model: 'meta/llama-3.3-70b-instruct'
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
