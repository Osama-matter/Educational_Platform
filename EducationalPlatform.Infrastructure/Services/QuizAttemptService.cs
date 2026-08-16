using EducationalPlatform.Application.DTOs.Question;
using EducationalPlatform.Application.DTOs.QuestionOption;
using EducationalPlatform.Application.DTOs.QuizAttempt;
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
    public class QuizAttemptService : IQuizAttemptService
    {
        private readonly IQuizAttemptRepository _quizAttemptRepository;
        private readonly IQuizRepository _quizRepository;
        private readonly IQuestionRepository _questionRepository;

        public QuizAttemptService(IQuizAttemptRepository quizAttemptRepository, IQuizRepository quizRepository, IQuestionRepository questionRepository)
        {
            _quizAttemptRepository = quizAttemptRepository;
            _quizRepository = quizRepository;
            _questionRepository = questionRepository;
        }

        public async Task<Guid> CreateQuizAttemptAsync(CreateQuizAttemptDto createQuizAttemptDto)
        {
            if (!createQuizAttemptDto.UserId.HasValue)
            {
                throw new InvalidOperationException("UserId is required.");
            }

            var quiz = await _quizRepository.GetByIdAsync(createQuizAttemptDto.QuizId);
            if (quiz == null)
            {
                throw new ArgumentException("Quiz not found");
            }

            // Only validate dates if they are real calendar dates
            if (quiz.AvailableFrom.Year > 1900 && quiz.AvailableFrom > DateTime.UtcNow)
            {
                throw new InvalidOperationException("Quiz is not yet available.");
            }
            if (quiz.AvailableTo.Year > 1900 && quiz.AvailableTo < DateTime.UtcNow)
            {
                throw new InvalidOperationException("Quiz has expired.");
            }

            var existingAttempts = (await _quizAttemptRepository.GetByUserIdAndQuizIdAsync(createQuizAttemptDto.UserId.Value, createQuizAttemptDto.QuizId)).ToList();
            
            // Check if there is an in-progress attempt to resume
            var inProgress = existingAttempts.FirstOrDefault(a => a.Status == QuizAttemptStatus.InProgress);
            if (inProgress != null)
            {
                return inProgress.Id;
            }

            var quizAttempt = new QuizAttempt
            {
                UserId = createQuizAttemptDto.UserId.Value,
                QuizId = createQuizAttemptDto.QuizId,
                StartedAt = DateTime.UtcNow,
                Status = QuizAttemptStatus.InProgress,
                TotalScore = 0
            };

            await _quizAttemptRepository.AddAsync(quizAttempt);
            return quizAttempt.Id;
        }

        public async Task DeleteQuizAttemptAsync(Guid id)
        {
            var quizAttempt = await _quizAttemptRepository.GetByIdAsync(id);
            if (quizAttempt != null)
            {
                await _quizAttemptRepository.DeleteAsync(quizAttempt);
            }
        }

        public async Task<QuizAttemptDto> GetQuizAttemptByIdAsync(Guid id)
        {
            var quizAttempt = await _quizAttemptRepository.GetByIdAsync(id);
            if (quizAttempt == null)
            {
                return null;
            }

            var quiz = await _quizRepository.GetByIdAsync(quizAttempt.QuizId);
            var questions = await _questionRepository.GetByQuizIdAsync(quizAttempt.QuizId);

            return new QuizAttemptDto
            {
                Id = quizAttempt.Id,
                UserId = quizAttempt.UserId,
                QuizId = quizAttempt.QuizId,
                QuizTitle = quiz?.Title,
                StartedAt = quizAttempt.StartedAt,
                SubmittedAt = quizAttempt.SubmittedAt,
                TotalScore = quizAttempt.TotalScore,
                Status = quizAttempt.Status,
                TotalTimeMinutes = quiz?.DurationMinutes ?? 0,
                Questions = questions.Select(question => new QuestionDto
                {
                    Id = question.Id,
                    Content = question.Content,
                    QuestionType = question.QuestionType,
                    Score = question.Score,
                    QuizId = question.QuizId,
                    Options = question.Options.Select(option => new QuestionOptionDto
                    {
                        Id = option.Id,
                        Text = option.Text,
                        IsCorrect = option.IsCorrect
                    }).ToList()
                }).ToList()
            };
        }

        public async Task<IEnumerable<QuizAttemptDto>> GetQuizAttemptsAsync()
        {
            var quizAttempts = await _quizAttemptRepository.GetAllAsync();
            var quizzes = (await _quizRepository.GetAllAsync()).ToDictionary(q => q.Id, q => q);
            return quizAttempts.Select(quizAttempt =>
            {
                quizzes.TryGetValue(quizAttempt.QuizId, out var quiz);
                return new QuizAttemptDto
                {
                    Id = quizAttempt.Id,
                    UserId = quizAttempt.UserId,
                    QuizId = quizAttempt.QuizId,
                    QuizTitle = quiz?.Title ?? "اختبار تقييمي",
                    StartedAt = quizAttempt.StartedAt,
                    SubmittedAt = quizAttempt.SubmittedAt,
                    TotalScore = quizAttempt.TotalScore,
                    Status = quizAttempt.Status,
                    TotalTimeMinutes = quiz?.DurationMinutes ?? 0
                };
            }).ToList();
        }

        public async Task UpdateQuizAttemptAsync(Guid id, UpdateQuizAttemptDto updateQuizAttemptDto)
        {
            var quizAttempt = await _quizAttemptRepository.GetByIdAsync(id);
            if (quizAttempt != null)
            {
                quizAttempt.TotalScore = updateQuizAttemptDto.TotalScore;
                quizAttempt.Status = updateQuizAttemptDto.Status;
                quizAttempt.SubmittedAt = DateTime.UtcNow;

                await _quizAttemptRepository.UpdateAsync(quizAttempt);
            }
        }
    }
}