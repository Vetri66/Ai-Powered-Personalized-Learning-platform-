import { Course } from '../mongodb/models'
import { getNvidiaClient } from './nvidia'

async function generateEmbedding(text: string): Promise<number[]> {
  const res = await fetch('https://integrate.api.nvidia.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'nvidia/nv-embedqa-e5-v5',
      input: text,
      input_type: 'passage',
      encoding_format: 'float',
      truncate: 'END'
    })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || data.error || 'Embedding failed')
  return data.data[0].embedding
}

export interface DocumentChunk {
  id: string
  content: string
  embedding: number[]
  metadata: {
    source: string
    page?: number
    section?: string
    type: 'pdf' | 'text' | 'video' | 'code'
  }
}

export interface RAGResult {
  chunks: DocumentChunk[]
  similarity_scores: number[]
  total_chunks: number
}

export class RAGEngine {
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      return await generateEmbedding(text)
    } catch (error) {
      console.error('Embedding generation failed:', error)
      return Array.from({ length: 1024 }, () => 0)
    }
  }

  async retrieveRelevantChunks(
    query: string,
    courseId: string,
    topK: number = 5,
    similarityThreshold: number = 0.7
  ): Promise<RAGResult> {
    try {
      const course = await Course.findById(courseId)
      if (!course) {
        throw new Error('Course not found')
      }

      const queryEmbedding = await this.generateEmbedding(query)
      const relevantChunks: { chunk: DocumentChunk; score: number }[] = []

      // Calculate similarity with all course embeddings
      for (const embedding of course.embeddings) {
        const similarity = this.cosineSimilarity(queryEmbedding, embedding.embedding)
        
        if (similarity >= similarityThreshold) {
          relevantChunks.push({
            chunk: {
              id: embedding.chunkId,
              content: embedding.content,
              embedding: embedding.embedding,
              metadata: embedding.metadata
            },
            score: similarity
          })
        }
      }

      // Sort by similarity and take top K
      relevantChunks.sort((a, b) => b.score - a.score)
      const topChunks = relevantChunks.slice(0, topK)

      return {
        chunks: topChunks.map(item => item.chunk),
        similarity_scores: topChunks.map(item => item.score),
        total_chunks: relevantChunks.length
      }
    } catch (error) {
      console.error('RAG retrieval failed:', error)
      return {
        chunks: [],
        similarity_scores: [],
        total_chunks: 0
      }
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    if (normA === 0 || normB === 0) return 0
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }

  async generateRAGResponse(
    query: string,
    relevantChunks: DocumentChunk[],
    conversationHistory: { role: string; content: string }[] = []
  ): Promise<{ response: string; confidence: number; sources: string[] }> {
    if (relevantChunks.length === 0) {
      return {
        response: "I don't have enough information in the course materials to answer your question.",
        confidence: 0,
        sources: []
      }
    }

    const context = relevantChunks.map(chunk => chunk.content).join('\n\n')
    const sources = [...new Set(relevantChunks.map(chunk => chunk.metadata.source))]
    const conversationContext = conversationHistory.length > 0
      ? `Previous conversation:\n${conversationHistory.slice(-4).map(msg => `${msg.role}: ${msg.content}`).join('\n')}\n\n`
      : ''

    try {
      const completion = await getNvidiaClient().chat.completions.create({
        model: 'meta/llama-3.3-70b-instruct',
        messages: [
          { role: 'system', content: 'You are an AI tutor. Answer using only the provided course content.' },
          { role: 'user', content: `COURSE CONTENT:\n${context}\n\n${conversationContext}QUESTION: ${query}` }
        ],
        temperature: 0.4,
        max_tokens: 1024
      })
      const response = completion.choices[0].message.content || ''
      return { response, confidence: 0.85, sources }
    } catch (error) {
      console.error('RAG response generation failed:', error)
      return { response: "I'm experiencing technical difficulties. Please try again.", confidence: 0, sources: [] }
    }
  }

  private calculateRAGConfidence(
    query: string,
    response: string,
    chunks: DocumentChunk[]
  ): number {
    let confidence = 0.3 // Base confidence

    // Increase confidence based on chunk relevance
    confidence += Math.min(chunks.length * 0.1, 0.4)

    // Increase confidence if response references specific content
    const contentKeywords = chunks.flatMap(chunk => 
      chunk.content.toLowerCase().split(' ').filter(word => word.length > 4)
    )
    const responseWords = response.toLowerCase().split(' ')
    const matches = contentKeywords.filter(keyword => 
      responseWords.some(word => word.includes(keyword))
    ).length

    confidence += Math.min(matches * 0.02, 0.3)

    // Decrease confidence for uncertainty indicators
    const uncertaintyPhrases = ["i don't know", "i'm not sure", "unclear", "uncertain"]
    if (uncertaintyPhrases.some(phrase => response.toLowerCase().includes(phrase))) {
      confidence -= 0.4
    }

    return Math.max(0, Math.min(1, confidence))
  }
}