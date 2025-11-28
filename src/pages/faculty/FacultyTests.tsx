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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  FileText,
  CheckCircle,
  Users,
  Clock,
  Edit,
  Trash2,
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

interface TestStats {
  totalTests: number;
  activeTests: number;
  totalAttempts: number;
  averageScore: number;
}

const FacultyTests = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [stats, setStats] = useState<TestStats>({
    totalTests: 0,
    activeTests: 0,
    totalAttempts: 0,
    averageScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    course: "",
    duration: "60",
    totalQuestions: "1",
    isActive: false,
  });

  const [questions, setQuestions] = useState<Question[]>([
    {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    },
  ]);

  // Fetch tests
  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/tests");
      setTests(response.data);
      fetchStats();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to fetch tests");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/tests/stats/summary");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle question change
  const handleQuestionChange = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  // Handle option change
  const handleOptionChange = (
    qIndex: number,
    oIndex: number,
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = value;
    setQuestions(newQuestions);
  };

  // Handle correct answer change
  const handleCorrectAnswerChange = (qIndex: number, aIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = aIndex;
    setQuestions(newQuestions);
  };

  // Add new question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  // Remove question
  const removeQuestion = (index: number) => {
    if (questions.length === 1) {
      toast.error("Test must have at least one question");
      return;
    }
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
  };

  // Handle create test
  const handleCreateTest = async () => {
    if (!formData.title || !formData.course) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        toast.error(`Question ${i + 1} is empty`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) {
          toast.error(`Question ${i + 1}, Option ${String.fromCharCode(65 + j)} is empty`);
          return;
        }
      }
    }

    try {
      const testData = {
        title: formData.title,
        course: formData.course,
        duration: parseInt(formData.duration),
        totalQuestions: questions.length,
        questions: questions,
        isActive: formData.isActive,
      };

      const response = await apiClient.post("/tests", testData);
      toast.success("Test created successfully!");
      setIsAddDialogOpen(false);
      resetForm();
      fetchTests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create test");
    }
  };

  // Handle toggle active
  const handleToggleActive = async (id: string) => {
    try {
      const response = await apiClient.patch(`/tests/${id}/toggle`);
      toast.success(response.data.message);
      fetchTests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to toggle test");
    }
  };

  // Handle delete test
  const handleDeleteTest = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;

    try {
      await apiClient.delete(`/tests/${id}`);
      toast.success("Test deleted successfully!");
      fetchTests();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete test");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      course: "",
      duration: "60",
      totalQuestions: "1",
      isActive: false,
    });
    setQuestions([
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  // Filter tests
  const filteredTests = tests.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="faculty">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-cyan-glow to-accent bg-clip-text text-transparent">
              Test Management
            </h1>
            <p className="text-muted-foreground mt-2">Create and manage tests</p>
          </div>

          {/* Create Test Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-cyan-glow hover:shadow-neon">
                <Plus className="w-4 h-4 mr-2" />
                Create Test
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Create New Test</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Test Title</label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Midterm Exam..."
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Course</label>
                    <Input
                      name="course"
                      value={formData.course}
                      onChange={handleInputChange}
                      placeholder="CS 201"
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
                    <Input
                      name="duration"
                      type="number"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Total Questions</label>
                    <Input
                      value={questions.length}
                      disabled
                      className="bg-secondary/50 border-border"
                    />
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-6">
                  <h3 className="text-lg font-bold">Add Questions</h3>
                  {questions.map((q, qIndex) => (
                    <Card key={qIndex} className="p-4 border-border/50 bg-secondary/20">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-md font-semibold">Question {qIndex + 1}</h4>
                        {questions.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeQuestion(qIndex)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        value={q.question}
                        onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                        placeholder="What is a data structure?"
                        className="mb-3 bg-secondary/50 border-border"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={q.correctAnswer === oIndex}
                              onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                              className="w-4 h-4"
                            />
                            <Input
                              value={opt}
                              onChange={(e) =>
                                handleOptionChange(qIndex, oIndex, e.target.value)
                              }
                              placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                              className="bg-secondary/50 border-border"
                            />
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                  <Button
                    onClick={addQuestion}
                    variant="outline"
                    className="w-full border-primary/50 hover:bg-primary/10"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Question
                  </Button>
                </div>

                {/* Activate Toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                  <label className="text-sm font-medium">
                    Activate Test (Make test available to students)
                  </label>
                </div>

                <Button
                  onClick={handleCreateTest}
                  className="w-full bg-gradient-to-r from-primary to-cyan-glow"
                >
                  Create Test
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-glow flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalTests}</p>
                <p className="text-sm text-muted-foreground">Total Tests</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeTests}</p>
                <p className="text-sm text-muted-foreground">Active Tests</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalAttempts}</p>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-glow to-accent flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.averageScore}%</p>
                <p className="text-sm text-muted-foreground">Avg Score</p>
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
          <h2 className="text-2xl font-bold">All Tests</h2>
          {loading ? (
            <Card className="p-12 text-center border-border/50 bg-card/50">
              <p className="text-muted-foreground">Loading tests...</p>
            </Card>
          ) : filteredTests.length === 0 ? (
            <Card className="p-12 text-center border-border/50 bg-card/50">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No tests found matching your search"
                  : "No tests yet. Create one to get started!"}
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
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          test.isActive
                            ? "bg-green-500/10 text-green-500"
                            : "bg-gray-500/10 text-gray-500"
                        }`}
                      >
                        {test.isActive ? "active" : "inactive"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="px-2 py-1 rounded bg-primary/10 text-primary">
                        {test.course}
                      </span>
                      <span>📋 {test.totalQuestions} questions</span>
                      <span>⏱️ {test.duration} min</span>
                      <span>👥 {test.attempts} attempts</span>
                      <span>📊 Avg: {test.averageScore}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(test._id)}
                      className={`border-border ${
                        test.isActive
                          ? "hover:bg-gray-500/10"
                          : "hover:bg-green-500/10"
                      }`}
                    >
                      {test.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteTest(test._id)}
                      className="border-border hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyTests;
