using EducationalPlatform.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace EducationalPlatform.Application.Interfaces.Security
{
    public class UserSession
    {
        public string SessionId { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    public interface IUserSessionManager
    {
        Task<UserSession> CreateSessionAsync(User user, IList<string> roles, TimeSpan? lifetime = null);
        Task<UserSession?> GetSessionAsync(string sessionId);
        Task InvalidateSessionAsync(string sessionId);
        Task InvalidateUserSessionsAsync(Guid userId);
    }
}
