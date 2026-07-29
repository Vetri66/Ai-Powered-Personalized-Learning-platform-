import mongoose, { Schema, Document } from 'mongoose'

// User Model
export interface IUser extends Document {
  supabaseId: string
  email: string
  fullName: string
  role: 'student' | 'educator'
  avatar?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  supabaseId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  role: { type: String, enum: ['student', 'educator'], required: true },
  avatar: String,
  bio: String,
}, { timestamps: true })

// Course Model
export interface ICourse extends Document {
  title: string
  description: string
  educatorId: string
  content: {
    type: 'pdf' | 'text' | 'video' | 'code'
    data: string
    metadata?: any
  }[]
  embeddings: {
    chunkId: string
    content: string
    embedding: number[]
    metadata: any
  }[]
  students: string[]
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const CourseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  educatorId: { type: String, required: true },
  content: [{
    type: { type: String, enum: ['pdf', 'text', 'video', 'code'], required: true },
    data: { type: String, required: true },
    metadata: Schema.Types.Mixed
  }],
  embeddings: [{
    chunkId: { type: String, required: true },
    content: { type: String, required: true },
    embedding: [Number],
    metadata: Schema.Types.Mixed
  }],
  students: [String],
  isPublished: { type: Boolean, default: false }
}, { timestamps: true })

// Chat Session Model
export interface IChatSession extends Document {
  studentId: string
  courseId: string
  title: string
  messages: {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    confidence?: number
    sources?: string[]
  }[]
  topic: string
  createdAt: Date
  updatedAt: Date
}

const ChatSessionSchema = new Schema<IChatSession>({
  studentId: { type: String, required: true },
  courseId: { type: String, required: true },
  title: { type: String, required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    confidence: Number,
    sources: [String]
  }],
  topic: { type: String, required: true }
}, { timestamps: true })

// Learning Progress Model
export interface ILearningProgress extends Document {
  studentId: string
  courseId: string
  topicMastery: {
    topic: string
    score: number
    interactions: number
    lastUpdated: Date
  }[]
  weakAreas: string[]
  strongAreas: string[]
  totalStudyTime: number
  averageScore: number
  streakDays: number
  lastActivity: Date
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  preferredExplanationDepth: 'brief' | 'detailed' | 'comprehensive'
  strugglingTopics: {
    topic: string
    attempts: number
    lastAttempt: Date
    severity: 'low' | 'medium' | 'high' | 'critical'
  }[]
  masteredConcepts: string[]
  engagementScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  createdAt: Date
  updatedAt: Date
}

const LearningProgressSchema = new Schema<ILearningProgress>({
  studentId: { type: String, required: true },
  courseId: { type: String, required: true },
  topicMastery: [{
    topic: { type: String, required: true },
    score: { type: Number, required: true },
    interactions: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }],
  weakAreas: [String],
  strongAreas: [String],
  totalStudyTime: { type: Number, default: 0 },
  averageScore: { type: Number, default: 0 },
  streakDays: { type: Number, default: 0 },
  lastActivity: { type: Date, default: Date.now },
  learningStyle: { type: String, enum: ['visual', 'auditory', 'kinesthetic', 'reading'], default: 'reading' },
  preferredExplanationDepth: { type: String, enum: ['brief', 'detailed', 'comprehensive'], default: 'detailed' },
  strugglingTopics: [{
    topic: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    lastAttempt: { type: Date, default: Date.now },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' }
  }],
  masteredConcepts: [String],
  engagementScore: { type: Number, default: 0.5 },
  riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' }
}, { timestamps: true })

// AI Interaction Model
export interface IAIInteraction extends Document {
  studentId: string
  courseId: string
  sessionId: string
  query: string
  response: string
  confidence: number
  sources: string[]
  feedback?: 'helpful' | 'not_helpful'
  topic: string
  responseType: 'explanation' | 'hint' | 'question' | 'warning' | 'escalation'
  difficultyAdjustment: 'easier' | 'same' | 'harder'
  ethicalFlags: string[]
  requiresHumanReview: boolean
  processingTime: number
  ragChunksUsed: number
  createdAt: Date
}

const AIInteractionSchema = new Schema<IAIInteraction>({
  studentId: { type: String, required: true },
  courseId: { type: String, required: true },
  sessionId: { type: String, required: true },
  query: { type: String, required: true },
  response: { type: String, required: true },
  confidence: { type: Number, required: true },
  sources: [String],
  feedback: { type: String, enum: ['helpful', 'not_helpful'] },
  topic: { type: String, required: true },
  responseType: { type: String, enum: ['explanation', 'hint', 'question', 'warning', 'escalation'], default: 'explanation' },
  difficultyAdjustment: { type: String, enum: ['easier', 'same', 'harder'], default: 'same' },
  ethicalFlags: [String],
  requiresHumanReview: { type: Boolean, default: false },
  processingTime: { type: Number, default: 0 },
  ragChunksUsed: { type: Number, default: 0 }
}, { timestamps: true })

// Instructor Alert Model
export interface IInstructorAlert extends Document {
  courseId: string
  educatorId: string
  type: 'student_at_risk' | 'content_gap' | 'engagement_drop' | 'cheating_attempt' | 'technical_issue'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  affectedStudents: string[]
  recommendedActions: string[]
  resolved: boolean
  resolvedAt?: Date
  resolvedBy?: string
  metadata: any
  createdAt: Date
  updatedAt: Date
}

const InstructorAlertSchema = new Schema<IInstructorAlert>({
  courseId: { type: String, required: true },
  educatorId: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['student_at_risk', 'content_gap', 'engagement_drop', 'cheating_attempt', 'technical_issue'], 
    required: true 
  },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  affectedStudents: [String],
  recommendedActions: [String],
  resolved: { type: Boolean, default: false },
  resolvedAt: Date,
  resolvedBy: String,
  metadata: Schema.Types.Mixed
}, { timestamps: true })

// Learning Gap Model
export interface ILearningGap extends Document {
  studentId: string
  courseId: string
  topic: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  indicators: string[]
  recommendedActions: string[]
  detectedAt: Date
  attempts: number
  resolved: boolean
  resolvedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const LearningGapSchema = new Schema<ILearningGap>({
  studentId: { type: String, required: true },
  courseId: { type: String, required: true },
  topic: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
  indicators: [String],
  recommendedActions: [String],
  detectedAt: { type: Date, required: true },
  attempts: { type: Number, default: 0 },
  resolved: { type: Boolean, default: false },
  resolvedAt: Date
}, { timestamps: true })

// Export models
export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
export const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)
export const ChatSession = mongoose.models.ChatSession || mongoose.model<IChatSession>('ChatSession', ChatSessionSchema)
export const LearningProgress = mongoose.models.LearningProgress || mongoose.model<ILearningProgress>('LearningProgress', LearningProgressSchema)
export const AIInteraction = mongoose.models.AIInteraction || mongoose.model<IAIInteraction>('AIInteraction', AIInteractionSchema)
export const InstructorAlert = mongoose.models.InstructorAlert || mongoose.model<IInstructorAlert>('InstructorAlert', InstructorAlertSchema)
export const LearningGap = mongoose.models.LearningGap || mongoose.model<ILearningGap>('LearningGap', LearningGapSchema)