using EducationalPlatform.Application.DTOs.Answer;
using EducationalPlatform.Application.Interfaces.Repositories;
using EducationalPlatform.Application.Interfaces.Services;
using EducationalPlatform.Domain.Entities;
using EducationalPlatform.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Services
{
    public class AnswerService : IAnswerService
    {
        private readonly IAnswerRepository _answerRepository;
        private readonly IQuizAttemptRepository _quizAttemptRepository;
        private readonly IQuestionRepository _questionRepository;

        public AnswerService(IAnswerRepository answerRepository, IQuizAttemptRepository quizAttemptRepository, IQuestionRepository questionRepository)
        {
            _answerRepository = answerRepository;
            _quizAttemptRepository = quizAttemptRepository;
            _questionRepository = questionRepository;
        }

        public async Task SubmitAnswersAsync(Guid quizAttemptId, SubmitAnswersRequest request)
        {
            var quizAttempt = await _quizAttemptRepository.GetByIdAsync(quizAttemptId);
            if (quizAttempt == null)
            {
                throw new InvalidOperationException("Quiz attempt not found.");
            }

            var answers = new List<Answer>();
            int totalScore = 0;

            // Load questions with options for this quiz
            var questions = (await _questionRepository.GetByQuizIdAsync(quizAttempt.QuizId)).ToList();
            if (!questions.Any())
            {
                var questionIds = request.Answers.Select(a => a.QuestionId).ToList();
                questions = (await _questionRepository.GetAllAsync()).Where(q => questionIds.Contains(q.Id)).ToList();
            }

            foreach (var answerDto in request.Answers)
            {
                var question = questions.FirstOrDefault(q => q.Id == answerDto.QuestionId);
                if (question != null && question.Options != null)
                {
                    var correctAnswer = question.Options.FirstOrDefault(o => o.IsCorrect);
                    if (correctAnswer != null && correctAnswer.Id == answerDto.SelectedOptionId)
                    {
                        totalScore += question.Score;
                    }
                }

                answers.Add(new Answer
                {
                    QuizAttemptId = quizAttemptId,
                    QuestionId = answerDto.QuestionId,
                    SelectedOptionId = answerDto.SelectedOptionId
                });
            }

            await _answerRepository.AddRangeAsync(answers);

            quizAttempt.TotalScore = totalScore;
            quizAttempt.SubmittedAt = DateTime.UtcNow;
            quizAttempt.Status = QuizAttemptStatus.Graded;

            await _quizAttemptRepository.UpdateAsync(quizAttempt);
        }
    }
}
