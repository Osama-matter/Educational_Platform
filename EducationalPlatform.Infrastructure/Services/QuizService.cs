using EducationalPlatform.Application.DTOs.Question;
using EducationalPlatform.Application.DTOs.QuestionOption;
using EducationalPlatform.Application.DTOs.Quiz;
using EducationalPlatform.Application.Interfaces.Repositories;
using EducationalPlatform.Application.Interfaces.Services;
using EducationalPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Services
{
    public class QuizService : IQuizService
    {
        private readonly IQuizRepository _quizRepository;
        private readonly ILessonRepository _lessonRepository;

        public QuizService(IQuizRepository quizRepository, ILessonRepository lessonRepository)
        {
            _quizRepository = quizRepository;
            _lessonRepository = lessonRepository;
        }

        public async Task<Guid> CreateQuizAsync(CreateQuizDto createQuizDto)
        {
            var lesson = await _lessonRepository.GetByIdAsync(createQuizDto.LessonId);
            if (lesson == null)
            {
                throw new ArgumentException("Lesson not found");
            }

            var quiz = new Quiz
            {
                Title = createQuizDto.Title,
                Description = createQuizDto.Description,
                AvailableFrom = createQuizDto.AvailableFrom,
                AvailableTo = createQuizDto.AvailableTo,
                DurationMinutes = createQuizDto.DurationMinutes,
                TotalScore = createQuizDto.TotalScore,
                PassingScore = createQuizDto.PassingScore,
                IsPublished = createQuizDto.IsPublished,
                LessonId = createQuizDto.LessonId
            };

            await _quizRepository.AddAsync(quiz);
            return quiz.Id;
        }

        public async Task DeleteQuizAsync(Guid id)
        {
            var quiz = await _quizRepository.GetByIdAsync(id);
            if (quiz != null)
            {
                await _quizRepository.DeleteAsync(quiz);
            }
        }

        public async Task<QuizDto> GetQuizByIdAsync(Guid id)
        {
            var quiz = await _quizRepository.GetByIdAsync(id);
            if (quiz == null) return null;
            return new QuizDto
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Description = quiz.Description,
                AvailableFrom = quiz.AvailableFrom,
                AvailableTo = quiz.AvailableTo,
                DurationMinutes = quiz.DurationMinutes,
                TotalScore = quiz.TotalScore,
                PassingScore = quiz.PassingScore,
                TotalTimeMinutes = quiz.DurationMinutes,
                IsPublished = quiz.IsPublished,
                LessonId = quiz.LessonId,
                Questions = quiz.Questions?.Select(q => new QuestionDto
                {
                    Id = q.Id,
                    Content = q.Content,
                    QuestionType = q.QuestionType,
                    Score = q.Score,
                    QuizId = q.QuizId,
                    Options = q.Options?.Select(opt => new QuestionOptionDto
                    {
                        Id = opt.Id,
                        Text = opt.Text,
                        IsCorrect = opt.IsCorrect
                    }).ToList() ?? new List<QuestionOptionDto>()
                }).ToList() ?? new List<QuestionDto>()
            };
        }

        public async Task<List<QuizDto>> GetAllQuizzesAsync()
        {
            var quizzes = await _quizRepository.GetAllAsync();
            return quizzes.Select(quiz => new QuizDto
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Description = quiz.Description,
                DurationMinutes = quiz.DurationMinutes,
                TotalScore = quiz.TotalScore,
                PassingScore = quiz.PassingScore,
                TotalTimeMinutes = quiz.DurationMinutes,
                IsPublished = quiz.IsPublished,
                LessonId = quiz.LessonId
            }).ToList();
        }

        public async Task UpdateQuizAsync(Guid id, UpdateQuizDto updateQuizDto)
        {
            var quiz = await _quizRepository.GetByIdAsync(id);
            if (quiz != null)
            {
                quiz.Title = updateQuizDto.Title ?? quiz.Title;
                quiz.Description = updateQuizDto.Description ?? quiz.Description;
                quiz.AvailableFrom = updateQuizDto.AvailableFrom ?? quiz.AvailableFrom;
                quiz.AvailableTo = updateQuizDto.AvailableTo ?? quiz.AvailableTo;
                quiz.DurationMinutes = updateQuizDto.DurationMinutes ?? quiz.DurationMinutes;
                quiz.TotalScore = updateQuizDto.TotalScore ?? quiz.TotalScore;
                quiz.PassingScore = updateQuizDto.PassingScore ?? quiz.PassingScore;
                quiz.IsPublished = updateQuizDto.IsPublished ?? quiz.IsPublished;
                if (updateQuizDto.LessonId.HasValue && updateQuizDto.LessonId.Value != Guid.Empty)
                {
                    quiz.LessonId = updateQuizDto.LessonId.Value;
                }

                await _quizRepository.UpdateAsync(quiz);
            }
        }

        public async Task<QuizDetailsDto> GetQuizDetailsForAdminAsync(Guid id)
        {
            var quiz = await _quizRepository.GetByIdAsync(id);
            if (quiz == null)
            {
                return null;
            }

            return new QuizDetailsDto
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Description = quiz.Description,
                DurationMinutes = quiz.DurationMinutes,
                IsPublished = quiz.IsPublished,
                Questions = quiz.Questions.Select(question => new QuestionDto
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

        public async Task<IEnumerable<QuizDto>> GetQuizzesAsync()
        {
            var quizzes = await _quizRepository.GetAllAsync();
            return quizzes.Select(quiz => new QuizDto
            {
                Id = quiz.Id,
                Title = quiz.Title,
                Description = quiz.Description,
                DurationMinutes = quiz.DurationMinutes,
                TotalScore = quiz.TotalScore,
                PassingScore = quiz.PassingScore,
                TotalTimeMinutes = quiz.DurationMinutes,
                IsPublished = quiz.IsPublished,
                LessonId = quiz.LessonId
            }).ToList();
        }
    }
}