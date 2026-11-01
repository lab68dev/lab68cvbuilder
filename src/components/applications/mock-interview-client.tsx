"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Play, Save, CheckCircle, Loader2 } from "lucide-react";
import {
  generateMockInterviewQuestions,
  evaluateMockInterviewAnswer,
} from "@/actions/mock-interview";

type Question = { question: string; expectedContext: string };
type Answer = {
  questionId: number;
  answer: string;
  feedback: string;
  score: number;
};

export default function MockInterviewClient({
  applicationId,
  existingInterviewId,
  initialQuestions,
  initialAnswers,
}: {
  applicationId: string;
  existingInterviewId?: string;
  initialQuestions: Question[];
  initialAnswers: Answer[];
}) {
  const [interviewId, setInterviewId] = useState(existingInterviewId);
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [answers, setAnswers] = useState<Answer[]>(initialAnswers);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentAnswerText, setCurrentAnswerText] = useState("");

  // Basic speech recognition
  const [isRecording, setIsRecording] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if SpeechRecognition is available
    const SpeechRecognition =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).SpeechRecognition ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setCurrentAnswerText((prev) => prev + " " + finalTranscript);
        }
      };

      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const handleStartInterview = async () => {
    setIsGenerating(true);
    try {
      const result = await generateMockInterviewQuestions(applicationId);
      setInterviewId(result.interviewId);
      setQuestions(result.questions);
      setAnswers([]);
      setCurrentQuestionIndex(0);
    } catch (e: unknown) {
      alert("Failed: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleRecord = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        alert(
          "Speech recognition not supported in this browser. Please type your answer.",
        );
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!interviewId || !currentAnswerText.trim()) return;
    setIsEvaluating(true);
    try {
      const evaluated = await evaluateMockInterviewAnswer(
        interviewId,
        currentQuestionIndex,
        currentAnswerText,
      );

      setAnswers((prev) => {
        const next = [...prev];
        const idx = next.findIndex(
          (a) => a.questionId === currentQuestionIndex,
        );
        if (idx >= 0) next[idx] = evaluated;
        else next.push(evaluated);
        return next;
      });

      setCurrentAnswerText("");

      // Move to next question if not done
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((curr) => curr + 1);
      }
    } catch (e: unknown) {
      alert(
        "Failed to submit answer: " +
          (e instanceof Error ? e.message : String(e)),
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  if (!interviewId && questions.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-4">Interactive Mock Interview</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Practice your interview skills with AI. We will generate 5 questions
          based specifically on your resume and the job description.
        </p>
        <button
          onClick={handleStartInterview}
          disabled={isGenerating}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center mx-auto"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Play className="w-5 h-5 mr-2" />
          )}
          {isGenerating ? "Generating Questions..." : "Start Mock Interview"}
        </button>
      </div>
    );
  }

  const isCompleted = answers.length === questions.length;
  const currentQ = questions[currentQuestionIndex];
  const currentA = answers.find((a) => a.questionId === currentQuestionIndex);

  return (
    <div className="max-w-4xl mx-auto rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Mock Interview</h2>
          <p className="text-sm text-gray-500 mt-1">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
        </div>
        <div className="flex space-x-2">
          {questions.map((_, idx) => {
            const hasAnswer = answers.some((a) => a.questionId === idx);
            const isActive = idx === currentQuestionIndex;
            return (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${isActive ? "ring-2 ring-blue-500 ring-offset-2" : ""}
                  ${hasAnswer ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}
                `}
              >
                {hasAnswer ? <CheckCircle className="w-4 h-4" /> : idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Q: {currentQ?.question}
          </h3>
          {currentA && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Your Answer
              </h4>
              <p className="text-gray-900 bg-gray-50 p-4 rounded-lg border border-gray-100">
                &quot;{currentA.answer}&quot;
              </p>

              <div className="mt-6 flex items-start gap-4 p-4 rounded-lg bg-blue-50 border border-blue-100">
                <div className="bg-white p-3 rounded-full shadow-sm text-blue-600 font-bold text-xl flex-shrink-0">
                  {currentA.score}/10
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">
                    AI Feedback
                  </h4>
                  <p className="text-blue-800">{currentA.feedback}</p>

                  <div className="mt-4 pt-4 border-t border-blue-200">
                    <h5 className="text-sm font-medium text-blue-800 mb-1">
                      What the interviewer expected:
                    </h5>
                    <p className="text-sm text-blue-700">
                      {currentQ?.expectedContext}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!currentA && !isCompleted && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                Your Answer
              </h4>
              <div className="relative">
                <textarea
                  value={currentAnswerText}
                  onChange={(e) => setCurrentAnswerText(e.target.value)}
                  placeholder="Type your answer here, or click the mic to speak..."
                  className="w-full min-h-[150px] p-4 pr-12 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                />
                <button
                  onClick={handleToggleRecord}
                  className={`absolute right-3 top-3 p-2 rounded-full transition-colors ${
                    isRecording
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title={isRecording ? "Stop recording" : "Start recording"}
                >
                  {isRecording ? (
                    <Mic className="w-5 h-5 animate-pulse" />
                  ) : (
                    <MicOff className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating || !currentAnswerText.trim()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                  {isEvaluating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Submit Answer
                </button>
              </div>
            </div>
          )}
        </div>

        {isCompleted && currentQuestionIndex === questions.length - 1 && (
          <div className="mt-8 p-6 bg-green-50 border border-green-100 rounded-xl text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-900 mb-2">
              Interview Completed!
            </h3>
            <p className="text-green-800">
              You scored an average of{" "}
              {(
                answers.reduce((acc, a) => acc + a.score, 0) / answers.length
              ).toFixed(1)}
              /10. Review your feedback by clicking the numbers above, and good
              luck with your real interview!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
