using EducationalPlatform.Application.Interfaces.Repositories;
using EducationalPlatform.Domain.Entities;
using EducationalPlatform.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Repositories
{
    public class QuestionRepository : IQuestionRepository
    {
        private readonly ApplicationDbContext _context;

        public QuestionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Question> GetByIdAsync(Guid id)
        {
            return await _context.Questions.FirstOrDefaultAsync(e=>e.Id == id);
        }

        public async Task<IEnumerable<Question>> GetByQuizIdAsync(Guid quizId)
        {
            return await _context.Questions
                .Include(q => q.Options)
                .Where(q => q.QuizId == quizId)
                .ToListAsync();
        }

        public async Task<IEnumerable<Question>> GetAllAsync()
        {
            return await _context.Questions
                .Include(q => q.Options)
                .ToListAsync();
        }

        public async Task AddAsync(Question question)
        {
            await _context.Questions.AddAsync(question);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Question question)
        {
            _context.Questions.Update(question);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Question question )
        {
            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();
            
        }
    }
}

