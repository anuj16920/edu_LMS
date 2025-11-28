import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  FileText,
  Clock,
  CheckCircle,
  Play,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/integrations/supabase/client";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Test {
  _id: string;
  title: string;
  course: string;
  duration: number;
  totalQuestions: number;
  questions: Question[];
  isActive: boolean;
  attempts: number;
  averageScore: number;
  createdByName: string;
  createdAt: string;
}

const StudentTests = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);

  // Test state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Fetch tests
  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/tests");
      console.log("✅ Tests fetched:", response.data);
      // Show only active tests to students
      setTests(response.data.filter((t: Test) => t.isActive));
    } catch (error: any) {
      console.error("❌ Error fetching tests:", error);
      toast.error(error.response?.data?.error || "Failed to fetch tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  // Timer effect
  useEffect(() => {
    if (testStarted && !testSubmitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [testStarted, testSubmitted, timeLeft]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle start test
  const handleStartTest = (test: Test) => {
    setSelectedTest(test);
    setAnswers(new Array(test.totalQuestions).fill(-1));
    setTimeLeft(test.duration * 60);
    setCurrentQuestionIndex(0);
    setTestStarted(true);
    setTestSubmitted(false);
    setIsTestDialogOpen(true);
  };

  // Handle answer selection
  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  // Handle next question
  const handleNextQuestion = () => {
    if (selectedTest && currentQuestionIndex < selectedTest.totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Handle previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Handle submit test
  const handleSubmitTest = () => {
    if (!selectedTest) return;

    // Calculate score
    let correctCount = 0;
    selectedTest.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / selectedTest.totalQuestions) * 100);
    setScore(percentage);
    setTestSubmitted(true);
    setIsTestDialogOpen(false);
    setIsResultDialogOpen(true);

    toast.success("Test submitted successfully!");
  };

  // Handle close test
  const handleCloseTest = () => {
    setIsTestDialogOpen(false);
    setTestStarted(false);
    setSelectedTest(null);
    setAnswers([]);
    setCurrentQuestionIndex(0);
  };

  // Filter tests
  const filteredTests = tests.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current question
  const currentQuestion = selectedTest?.questions[currentQuestionIndex];

  return (
    <DashboardLayout role="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
            Tests
          </h1>
          <p className="text-muted-foreground mt-2">Take tests and view your scores</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-glow flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tests.length}</p>
                <p className="text-sm text-muted-foreground">Available Tests</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Tests Completed</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">0%</p>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="p-4 border-border/50 bg-card/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search tests by title or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-border"
            />
          </div>
        </Card>

        {/* Tests List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Available Tests</h2>
          {loading ? (
            <Card className="p-12 text-center border-border/50 bg-card/50">
              <p className="text-muted-foreground">Loading tests...</p>
            </Card>
          ) : filteredTests.length === 0 ? (
            <Card className="p-12 text-center border-border/50 bg-card/50">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No tests found matching your search"
                  : "No active tests available right now"}
              </p>
            </Card>
          ) : (
            filteredTests.map((test) => (
              <Card
                key={test._id}
                className="p-6 border-border/50 bg-card/50 hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{test.title}</h3>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-500">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                        {test.course}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {test.totalQuestions} questions
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {test.duration} minutes
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created by {test.createdByName || "Faculty"}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleStartTest(test)}
                    className="bg-gradient-to-r from-primary to-cyan-glow hover:shadow-neon"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Test
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Test Taking Dialog */}
        <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
          <DialogContent className="bg-card border-border max-w-4xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-bold">
                  {selectedTest?.title}
                </DialogTitle>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-lg font-bold">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className={timeLeft < 60 ? "text-red-500" : "text-primary"}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {selectedTest && currentQuestion && (
              <div className="space-y-6 mt-4">
                {/* Question Progress */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    Question {currentQuestionIndex + 1} of {selectedTest.totalQuestions}
                  </span>
                  <span>
                    {answers.filter((a) => a !== -1).length} answered
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-cyan-glow transition-all"
                    style={{
                      width: `${((currentQuestionIndex + 1) / selectedTest.totalQuestions) * 100}%`,
                    }}
                  />
                </div>

                {/* Question */}
                <Card className="p-6 border-border/50 bg-secondary/20">
                  <h3 className="text-xl font-semibold mb-4">{currentQuestion.question}</h3>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                          answers[currentQuestionIndex] === index
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50 bg-secondary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              answers[currentQuestionIndex] === index
                                ? "border-primary bg-primary"
                                : "border-border"
                            }`}
                          >
                            {answers[currentQuestionIndex] === index && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                          <span className="font-medium">
                            {String.fromCharCode(65 + index)}. {option}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between">
                  <Button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    variant="outline"
                    className="border-border"
                  >
                    Previous
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCloseTest}
                      variant="outline"
                      className="border-border"
                    >
                      Exit Test
                    </Button>
                    {currentQuestionIndex === selectedTest.totalQuestions - 1 ? (
                      <Button
                        onClick={handleSubmitTest}
                        className="bg-gradient-to-r from-green-500 to-emerald-500"
                      >
                        Submit Test
                      </Button>
                    ) : (
                      <Button
                        onClick={handleNextQuestion}
                        className="bg-gradient-to-r from-primary to-cyan-glow"
                      >
                        Next
                      </Button>
                    )}
                  </div>
                </div>

                {/* Question Navigator */}
                <Card className="p-4 border-border/50 bg-secondary/20">
                  <p className="text-sm font-medium mb-3">Question Navigator:</p>
                  <div className="grid grid-cols-10 gap-2">
                    {selectedTest.questions.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-10 h-10 rounded-lg border-2 font-semibold transition-all ${
                          index === currentQuestionIndex
                            ? "border-primary bg-primary text-white"
                            : answers[index] !== -1
                            ? "border-green-500 bg-green-500/20 text-green-500"
                            : "border-border bg-secondary/50"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Result Dialog */}
        <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
          <DialogContent className="bg-card border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Test Results</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {/* Score Display */}
              <div className="flex flex-col items-center justify-center p-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-cyan-glow flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-white">{score}%</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  {score >= 80
                    ? "Excellent! 🎉"
                    : score >= 60
                    ? "Good Job! 👍"
                    : score >= 40
                    ? "Keep Practicing 📚"
                    : "Need Improvement 💪"}
                </h3>
                <p className="text-muted-foreground">
                  You scored {score}% on {selectedTest?.title}
                </p>
              </div>

              {/* Test Details */}
              <Card className="p-6 border-border/50 bg-secondary/20">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Questions</p>
                    <p className="text-xl font-bold">{selectedTest?.totalQuestions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Correct Answers</p>
                    <p className="text-xl font-bold text-green-500">
                      {selectedTest
                        ? Math.round((score / 100) * selectedTest.totalQuestions)
                        : 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Wrong Answers</p>
                    <p className="text-xl font-bold text-red-500">
                      {selectedTest
                        ? selectedTest.totalQuestions -
                          Math.round((score / 100) * selectedTest.totalQuestions)
                        : 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Percentage</p>
                    <p className="text-xl font-bold">{score}%</p>
                  </div>
                </div>
              </Card>

              <Button
                onClick={() => {
                  setIsResultDialogOpen(false);
                  setSelectedTest(null);
                }}
                className="w-full bg-gradient-to-r from-primary to-cyan-glow"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default StudentTests;
