using EducationalPlatform.Application.Interfaces.Security;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Security
{
    public class SessionAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public const string SchemeName = "SessionAuth";
        public const string CookieName = "AuthSession";

        private readonly IUserSessionManager _sessionManager;

        public SessionAuthenticationHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder,
            IUserSessionManager sessionManager)
            : base(options, logger, encoder)
        {
            _sessionManager = sessionManager;
        }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            // 1. Extract session identifier strictly from HttpOnly cookie
            if (!Request.Cookies.TryGetValue(CookieName, out var sessionId) || string.IsNullOrWhiteSpace(sessionId))
            {
                return AuthenticateResult.NoResult();
            }

            // 2. Validate and load server-side session
            var session = await _sessionManager.GetSessionAsync(sessionId);
            if (session == null)
            {
                return AuthenticateResult.Fail("Session not found or expired.");
            }

            // 3. Construct authenticated ClaimsPrincipal
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, session.UserId.ToString()),
                new(ClaimTypes.Name, session.Username),
                new(ClaimTypes.Email, session.Email)
            };

            if (!string.IsNullOrWhiteSpace(session.FirstName))
            {
                claims.Add(new(ClaimTypes.GivenName, session.FirstName));
            }

            if (!string.IsNullOrWhiteSpace(session.LastName))
            {
                claims.Add(new(ClaimTypes.Surname, session.LastName));
            }

            foreach (var role in session.Roles)
            {
                claims.Add(new(ClaimTypes.Role, role));
            }

            var identity = new ClaimsIdentity(claims, SchemeName, ClaimTypes.Name, ClaimTypes.Role);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, SchemeName);

            return AuthenticateResult.Success(ticket);
        }
    }
}
