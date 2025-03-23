"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Clock, Trophy, Star, RotateCcw, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type RuleType =
  | "repeat"
  | "square"
  | "double"
  | "isPrime"
  | "fibonacci"
  | "reverse"
  | "squareRoot"
  | "addDigits"
  | "multiplyDigits"
  | "subtract"
  | "divide"
  | "modulo"
  | "power"
  | "factorial"

interface Rule {
  type: RuleType
  generateProblem: () => {
    number: number
    description: string
    expectedAnswer: string | number
    extraData?: any
  }
  difficulty: number
}

export default function NumberGame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [level, setLevel] = useState(1)
  const [userInput, setUserInput] = useState("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [maxTime, setMaxTime] = useState(5)
  const [message, setMessage] = useState("")
  const [highScore, setHighScore] = useState(0)
  const [currentNumber, setCurrentNumber] = useState(0)
  const [currentDescription, setCurrentDescription] = useState("")
  const [currentExpectedAnswer, setCurrentExpectedAnswer] = useState<string | number>("")
  const [currentRule, setCurrentRule] = useState<Rule | null>(null)
  const [streak, setStreak] = useState(0)
  const [showStreak, setShowStreak] = useState(false)
  const [showCorrect, setShowCorrect] = useState(false)
  const [infiniteMode, setInfiniteMode] = useState(false)
  const [lives, setLives] = useState(3)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Helper functions
  const fibonacci = (n: number): number => {
    if (n <= 1) return n
    let a = 0,
      b = 1
    for (let i = 2; i <= n; i++) {
      const c = a + b
      a = b
      b = c
    }
    return b
  }

  const isPrime = (num: number): boolean => {
    if (num <= 1) return false
    if (num <= 3) return true
    if (num % 2 === 0 || num % 3 === 0) return false
    let i = 5
    while (i * i <= num) {
      if (num % i === 0 || num % (i + 2) === 0) return false
      i += 6
    }
    return true
  }

  const factorial = (n: number): number => {
    if (n <= 1) return 1
    let result = 1
    for (let i = 2; i <= n; i++) {
      result *= i
    }
    return result
  }

  const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  const sumDigits = (num: number): number => {
    return num
      .toString()
      .split("")
      .reduce((sum, digit) => sum + Number.parseInt(digit), 0)
  }

  const multiplyDigits = (num: number): number => {
    return num
      .toString()
      .split("")
      .reduce((product, digit) => product * Number.parseInt(digit), 1)
  }

  const reverseNumber = (num: number): number => {
    return Number.parseInt(num.toString().split("").reverse().join(""))
  }

  // Define all possible rules
  const rules: Rule[] = [
    {
      type: "repeat",
      generateProblem: () => {
        const num = getRandomInt(1, 9)
        return {
          number: num,
          description: "Type the number you see",
          expectedAnswer: num,
        }
      },
      difficulty: 1,
    },
    {
      type: "square",
      generateProblem: () => {
        const num = getRandomInt(2, 12)
        return {
          number: num,
          description: "Type the square of the number",
          expectedAnswer: num * num,
        }
      },
      difficulty: 2,
    },
    {
      type: "double",
      generateProblem: () => {
        const num = getRandomInt(5, 20)
        return {
          number: num,
          description: "Type double the number",
          expectedAnswer: num * 2,
        }
      },
      difficulty: 2,
    },
    {
      type: "isPrime",
      generateProblem: () => {
        const num = getRandomInt(2, 50)
        return {
          number: num,
          description: "Is this number prime? (yes/no)",
          expectedAnswer: isPrime(num) ? "yes" : "no",
        }
      },
      difficulty: 3,
    },
    {
      type: "fibonacci",
      generateProblem: () => {
        const index = getRandomInt(3, 10)
        const currentFib = fibonacci(index)
        const nextFib = fibonacci(index + 1)
        return {
          number: currentFib,
          description: `Type the next Fibonacci number after ${currentFib}`,
          expectedAnswer: nextFib,
        }
      },
      difficulty: 4,
    },
    {
      type: "reverse",
      generateProblem: () => {
        const num = getRandomInt(10, 99)
        return {
          number: num,
          description: "Reverse the digits",
          expectedAnswer: reverseNumber(num),
        }
      },
      difficulty: 3,
    },
    {
      type: "squareRoot",
      generateProblem: () => {
        const root = getRandomInt(2, 10)
        const num = root * root
        return {
          number: num,
          description: "What is the square root?",
          expectedAnswer: root,
        }
      },
      difficulty: 4,
    },
    {
      type: "addDigits",
      generateProblem: () => {
        const num = getRandomInt(10, 99)
        return {
          number: num,
          description: "Add the digits together",
          expectedAnswer: sumDigits(num),
        }
      },
      difficulty: 3,
    },
    {
      type: "multiplyDigits",
      generateProblem: () => {
        const num = getRandomInt(10, 99)
        return {
          number: num,
          description: "Multiply the digits",
          expectedAnswer: multiplyDigits(num),
        }
      },
      difficulty: 3,
    },
    {
      type: "subtract",
      generateProblem: () => {
        const num = getRandomInt(10, 50)
        const subtractor = getRandomInt(1, 9)
        return {
          number: num,
          description: `Subtract ${subtractor} from this number`,
          expectedAnswer: num - subtractor,
          extraData: { subtractor },
        }
      },
      difficulty: 2,
    },
    {
      type: "divide",
      generateProblem: () => {
        const divisor = getRandomInt(2, 5)
        const result = getRandomInt(2, 10)
        const num = divisor * result
        return {
          number: num,
          description: `Divide by ${divisor}`,
          expectedAnswer: result,
          extraData: { divisor },
        }
      },
      difficulty: 3,
    },
    {
      type: "modulo",
      generateProblem: () => {
        const num = getRandomInt(10, 50)
        const modulo = getRandomInt(2, 9)
        return {
          number: num,
          description: `What is the remainder when divided by ${modulo}?`,
          expectedAnswer: num % modulo,
          extraData: { modulo },
        }
      },
      difficulty: 4,
    },
    {
      type: "power",
      generateProblem: () => {
        const num = getRandomInt(2, 5)
        const power = getRandomInt(2, 3)
        return {
          number: num,
          description: `Calculate ${num}^${power}`,
          expectedAnswer: Math.pow(num, power),
          extraData: { power },
        }
      },
      difficulty: 4,
    },
    {
      type: "factorial",
      generateProblem: () => {
        const num = getRandomInt(2, 6)
        return {
          number: num,
          description: `Calculate ${num}! (factorial)`,
          expectedAnswer: factorial(num),
        }
      },
      difficulty: 5,
    },
  ]

  // Get a rule based on current level
  const getRule = (currentLevel: number): Rule => {
    // Filter rules by difficulty appropriate for the level
    let availableRules: Rule[]

    if (currentLevel <= 3) {
      availableRules = rules.filter((r) => r.difficulty <= 2)
    } else if (currentLevel <= 6) {
      availableRules = rules.filter((r) => r.difficulty <= 3)
    } else if (currentLevel <= 10) {
      availableRules = rules.filter((r) => r.difficulty <= 4)
    } else {
      availableRules = rules
    }

    return availableRules[Math.floor(Math.random() * availableRules.length)]
  }

  // Generate a new challenge
  const generateChallenge = () => {
    const rule = getRule(level)
    const problem = rule.generateProblem()

    setCurrentRule(rule)
    setCurrentNumber(problem.number)
    setCurrentDescription(problem.description)
    setCurrentExpectedAnswer(problem.expectedAnswer)

    // Adjust time based on level
    const newMaxTime = Math.max(2, 5 - Math.floor(level / 5))
    setMaxTime(newMaxTime)
    setTimeLeft(newMaxTime)
  }

  // Start the game
  const startGame = (infinite = false) => {
    setGameStarted(true)
    setGameOver(false)
    setLevel(1)
    setScore(0)
    setUserInput("")
    setMessage("")
    setStreak(0)
    setInfiniteMode(infinite)
    setLives(infinite ? 3 : 1)

    generateChallenge()

    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Start the timer for current challenge
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setTimeLeft(maxTime)

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          handleWrongAnswer("Time's up!")
          return 0
        }
        return prev - 0.1
      })
    }, 100)
  }

  // End the game
  const endGame = (reason: string) => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setGameOver(true)
    setMessage(reason)

    if (score > highScore) {
      setHighScore(score)
    }
  }

  // Handle wrong answer
  const handleWrongAnswer = (reason: string) => {
    if (infiniteMode) {
      const newLives = lives - 1
      setLives(newLives)

      if (newLives <= 0) {
        endGame(reason)
      } else {
        // Continue with next challenge
        setStreak(0)
        generateChallenge()
      }
    } else {
      endGame(reason)
    }
  }

  // Handle user input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (currentExpectedAnswer === undefined || currentExpectedAnswer === null) return

    if (userInput.toLowerCase() === currentExpectedAnswer.toString().toLowerCase()) {
      // Correct answer
      const timeBonus = Math.ceil(timeLeft * 10)
      const levelBonus = level * 5
      const streakBonus = Math.floor(streak / 3) * 10
      const pointsEarned = 10 + timeBonus + levelBonus + streakBonus

      const newScore = score + pointsEarned
      const newStreak = streak + 1

      setScore(newScore)
      setStreak(newStreak)
      setUserInput("")
      setLevel(level + 1)

      // Show streak notification
      if (newStreak > 0 && newStreak % 3 === 0) {
        setShowStreak(true)
        setTimeout(() => setShowStreak(false), 1500)
      }

      // Show correct notification
      setShowCorrect(true)
      setTimeout(() => setShowCorrect(false), 800)

      // Generate next challenge
      generateChallenge()
    } else {
      // Wrong answer
      handleWrongAnswer("Wrong answer! Try again.")
    }
  }

  // Handle key press for Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  // Update timer when challenge changes
  useEffect(() => {
    if (gameStarted && !gameOver) {
      startTimer()
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [currentNumber, gameStarted, gameOver])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  return (
    <div className="relative w-full max-w-md">
      <AnimatePresence>
        {showStreak && streak % 3 === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-[-60px] left-1/2 transform -translate-x-1/2 z-10"
          >
            <div className="bg-yellow-500 text-white px-4 py-2 rounded-full font-bold flex items-center">
              <Star className="h-5 w-5 mr-1 text-white" />
              {streak} Streak! +{Math.floor(streak / 3) * 10} points
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCorrect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <div className="text-green-500 text-6xl font-bold">✓</div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className="w-full shadow-xl border-2 border-pink-300 backdrop-blur-sm bg-white/80">
        <CardHeader className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Number Challenge</CardTitle>
            {gameStarted && !gameOver && (
              <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                Level {level}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {!gameStarted || gameOver ? (
            <div className="flex flex-col items-center space-y-6">
              {gameOver && (
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-pink-600">Game Over!</h3>
                  <p className="text-gray-600">{message}</p>
                  <div className="flex items-center justify-center space-x-2 mt-4">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="font-bold">Score: {score}</span>
                  </div>
                  <div className="text-gray-500">You reached level {level}</div>
                  {score === highScore && score > 0 && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                      New High Score!
                    </Badge>
                  )}
                </div>
              )}

              <div className="text-center space-y-4">
                <h2 className="text-lg font-medium mb-4">
                  {!gameOver ? "Ready to test your number skills?" : "Try again?"}
                </h2>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => startGame(false)} className="bg-pink-500 hover:bg-pink-600 text-white">
                    {!gameOver ? "Start Game" : "Play Again"}
                  </Button>
                  <Button
                    onClick={() => startGame(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                    variant="outline"
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    Infinite Mode
                  </Button>
                </div>
              </div>

              {highScore > 0 && (
                <div className="text-sm text-gray-500 flex items-center">
                  <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                  High Score: {highScore}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
                  <span className="font-medium">{score}</span>
                </div>

                {infiniteMode && (
                  <div className="flex space-x-1">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className={`w-4 h-4 rounded-full ${i < lives ? "bg-pink-500" : "bg-gray-300"}`} />
                    ))}
                  </div>
                )}

                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  <span className="font-medium">x{streak}</span>
                </div>
              </div>

              <motion.div
                key={`${currentNumber}-${currentDescription}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="text-6xl font-bold mb-2 text-pink-600 drop-shadow-md">{currentNumber}</div>
                  <p className="text-gray-600 font-medium">{currentDescription}</p>
                </div>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter your answer"
                  className="text-center text-lg"
                  autoComplete="off"
                />
                <Button type="submit" className="w-full bg-pink-500 hover:bg-pink-600 text-white">
                  Submit
                </Button>
              </form>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-pink-500" />
                    <span className={cn("font-medium", timeLeft < maxTime * 0.3 ? "text-red-500" : "")}>
                      {Math.ceil(timeLeft)}s
                    </span>
                  </div>
                  <span className="text-gray-500">Time remaining</span>
                </div>
                <Progress value={(timeLeft / maxTime) * 100} className="h-2" />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-pink-50/80 px-6 py-3 text-xs text-gray-500 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {infiniteMode ? "Infinite mode: 3 lives!" : "Answer correctly to level up!"}
            </div>
            {gameStarted && !gameOver && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-gray-500"
                onClick={() => endGame("Game ended by player")}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Restart
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

