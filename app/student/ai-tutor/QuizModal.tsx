"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Brain, CheckCircle, XCircle, Trophy, Loader2, AlertCircle, PlayCircle, Settings2, Target } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface QuizQuestion {
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
}

interface QuizModalProps {
    isOpen: boolean
    onClose: () => void
    courseContext: any
    conversationHistory: any[]
}

const LOADING_MESSAGES = [
    "Analyzing chat history...",
    "Reviewing course material...",
    "Identifying key topics...",
    "Drafting challenging questions...",
    "Double-checking answers...",
    "Finalizing your custom quiz..."
]

export function QuizModal({ isOpen, onClose, courseContext, conversationHistory }: QuizModalProps) {
    const [step, setStep] = useState<'setup' | 'loading' | 'quiz' | 'result'>('setup')
    const [questions, setQuestions] = useState<QuizQuestion[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [showExplanation, setShowExplanation] = useState(false)
    const [score, setScore] = useState(0)
    const [error, setError] = useState("")

    // Setup Options
    const [questionCount, setQuestionCount] = useState<string>("5")
    const [topic, setTopic] = useState<string>("")
    const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0])

    useEffect(() => {
        if (step === 'loading') {
            let i = 0;
            const interval = setInterval(() => {
                i = (i + 1) % LOADING_MESSAGES.length;
                setLoadingMsg(LOADING_MESSAGES[i]);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [step]);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setStep('setup')
            setError("")
            setTopic("") // Default to empty (Auto)
            setQuestionCount("5")
        }
    }, [isOpen])

    const startQuiz = async () => {
        setStep('loading')
        setError("")

        try {
            const response = await fetch('/api/ai-tutor/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseContext,
                    conversationHistory,
                    questionCount: parseInt(questionCount),
                    topic: topic.trim() || undefined // Send undefined if empty to let AI decide
                })
            })

            if (!response.ok) throw new Error("Failed to generate quiz")

            const data = await response.json()
            if (data.quiz && Array.isArray(data.quiz)) {
                setQuestions(data.quiz)
                setStep('quiz')
                setCurrentQuestionIndex(0)
                setScore(0)
                setSelectedAnswer(null)
                setShowExplanation(false)
            } else {
                throw new Error("Invalid quiz format received")
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong")
            setStep('setup')
        }
    }

    const handleAnswer = (value: string) => {
        if (showExplanation) return
        setSelectedAnswer(parseInt(value))
    }

    const checkAnswer = () => {
        if (selectedAnswer === null) return
        setShowExplanation(true)
        if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
            setScore(prev => prev + 1)
        }
    }

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
            setSelectedAnswer(null)
            setShowExplanation(false)
        } else {
            setStep('result')
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] transition-all duration-300">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        AI Knowledge Check
                    </DialogTitle>
                </DialogHeader>

                {step === 'setup' && (
                    <div className="space-y-6 py-4">
                        <div className="bg-primary/5 p-4 rounded-lg flex gap-4 items-start">
                            <Settings2 className="w-6 h-6 text-primary mt-1" />
                            <div className="space-y-1">
                                <h3 className="font-semibold text-primary">Customize Your Quiz</h3>
                                <p className="text-sm text-muted-foreground">Select your preferences to generate a targeted query.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Number of Questions</Label>
                                <div className="space-y-1">
                                    <Input
                                        type="number"
                                        min="1"
                                        max="20"
                                        placeholder="e.g. 5, 10, or type your own"
                                        value={questionCount}
                                        onChange={(e) => setQuestionCount(e.target.value)}
                                        className="w-full"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Enter the number of questions you want (Max 20 recommended).
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Topic Focus (Optional)</Label>
                                <div className="relative">
                                    <Target className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="e.g. React Hooks, Thermodynamics (Leave empty for Auto)"
                                        className="pl-9"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    If empty, we'll test you on everything discussed in the chat recently.
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <DialogFooter className="pt-4">
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button onClick={startQuiz} className="w-full sm:w-auto gap-2">
                                Start Quiz <PlayCircle className="w-4 h-4" />
                            </Button>
                        </DialogFooter>
                    </div>
                )}

                {step === 'loading' && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                            <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
                        </div>

                        <div className="space-y-2 max-w-xs mx-auto">
                            <h3 className="font-semibold text-lg">{loadingMsg}</h3>
                            <p className="text-sm text-muted-foreground">This creates a unique quiz just for you.</p>
                        </div>
                    </div>
                )}

                {step === 'quiz' && questions.length > 0 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground uppercase tracking-wider">
                                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                                <span>Score: {score}</span>
                            </div>
                            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2" />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium leading-relaxed">
                                {questions[currentQuestionIndex].question}
                            </h3>

                            <RadioGroup value={selectedAnswer?.toString()} onValueChange={handleAnswer} className="space-y-3">
                                {questions[currentQuestionIndex].options.map((option, index) => {
                                    let itemClass = "flex items-center space-x-3 space-y-0 rounded-md border p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all duration-200"

                                    if (showExplanation) {
                                        if (index === questions[currentQuestionIndex].correctAnswer) {
                                            itemClass = "flex items-center space-x-3 space-y-0 rounded-md border border-green-500 bg-green-50 dark:bg-green-900/20 p-4 shadow-sm"
                                        } else if (selectedAnswer === index) {
                                            itemClass = "flex items-center space-x-3 space-y-0 rounded-md border border-red-500 bg-red-50 dark:bg-red-900/20 p-4 opacity-80"
                                        } else {
                                            itemClass = "flex items-center space-x-3 space-y-0 rounded-md border p-4 opacity-50 grayscale"
                                        }
                                    } else if (selectedAnswer === index) {
                                        itemClass = "flex items-center space-x-3 space-y-0 rounded-md border border-primary bg-primary/5 p-4 ring-1 ring-primary"
                                    }

                                    return (
                                        <div key={index} className={itemClass} onClick={() => !showExplanation && handleAnswer(index.toString())}>
                                            <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={showExplanation} />
                                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-normal">
                                                {option}
                                            </Label>
                                            {showExplanation && index === questions[currentQuestionIndex].correctAnswer && <CheckCircle className="w-5 h-5 text-green-500 animate-in zoom-in" />}
                                            {showExplanation && selectedAnswer === index && index !== questions[currentQuestionIndex].correctAnswer && <XCircle className="w-5 h-5 text-red-500 animate-in zoom-in" />}
                                        </div>
                                    )
                                })}
                            </RadioGroup>
                        </div>

                        {showExplanation && (
                            <div className="bg-muted p-4 rounded-md text-sm animate-in fade-in slide-in-from-bottom-2">
                                <p className="font-bold mb-1 flex items-center gap-2 text-foreground">
                                    <Lightbulb className="w-4 h-4 text-yellow-500" /> Explanation:
                                </p>
                                <p className="text-muted-foreground leading-relaxed">{questions[currentQuestionIndex].explanation}</p>
                            </div>
                        )}

                        <DialogFooter className="pt-2">
                            {!showExplanation ? (
                                <Button onClick={checkAnswer} disabled={selectedAnswer === null} className="w-full sm:w-auto">
                                    Check Answer
                                </Button>
                            ) : (
                                <Button onClick={nextQuestion} className="w-full sm:w-auto">
                                    {currentQuestionIndex < questions.length - 1 ? "Next Question" : "See Results"}
                                </Button>
                            )}
                        </DialogFooter>
                    </div>
                )}

                {step === 'result' && (
                    <div className="py-8 text-center space-y-6 animate-in zoom-in-95">
                        <div className="relative inline-block">
                            <Trophy className="w-20 h-20 text-yellow-500 mx-auto drop-shadow-lg" />
                            <Badge className="absolute -top-2 -right-2 text-lg px-2 py-1 shadow-md">{Math.round((score / questions.length) * 100)}%</Badge>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold">Quiz Completed!</h3>
                            <p className="text-muted-foreground">
                                You scored {score} out of {questions.length} correct.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                            <Card className="p-4 bg-green-50 dark:bg-green-900/10 border-green-200">
                                <div className="text-2xl font-bold text-green-600">{score}</div>
                                <div className="text-xs text-green-600/80">Correct</div>
                            </Card>
                            <Card className="p-4 bg-red-50 dark:bg-red-900/10 border-red-200">
                                <div className="text-2xl font-bold text-red-600">{questions.length - score}</div>
                                <div className="text-xs text-red-600/80">Incorrect</div>
                            </Card>
                        </div>

                        <DialogFooter className="justify-center sm:justify-center gap-2">
                            <Button variant="outline" onClick={onClose}>Close</Button>
                            <Button onClick={() => setStep('setup')}>Try Another Quiz</Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

function Lightbulb(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
        </svg>
    )
}
