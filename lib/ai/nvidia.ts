import OpenAI from 'openai'

export function getNvidiaClient() {
  const apiKey = process.env.NVIDIA_API_KEY

  if (!apiKey) {
    throw new Error('NVIDIA_API_KEY is not configured')
  }

  return new OpenAI({
    apiKey,
    baseURL: 'https://integrate.api.nvidia.com/v1'
  })
}