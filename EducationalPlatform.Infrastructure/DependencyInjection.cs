using EducationalPlatform.Application.DTOs.Courses;
using EducationalPlatform.Application.Interfaces.External_services;
using EducationalPlatform.Application.Interfaces.Repositories;
using EducationalPlatform.Application.Interfaces.Services;
using EducationalPlatform.Application.Interfaces.Security;
using EducationalPlatform.Domain.Entities.Course;
using EducationalPlatform.Infrastructure.Repositories;
using EducationalPlatform.Infrastructure.Security;
using EducationalPlatform.Infrastructure.Services;
using EducationalPlatform.Infrastructure.Services.External_services;
using huzcodes.Persistence.Interfaces.Repositories;
using Microsoft.Extensions.DependencyInjection;
using NuGet.Protocol.Core.Types;
using EducationalPlatform.Infrastructure.Services.FawaterkServices;

namespace EducationalPlatform.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, Microsoft.Extensions.Configuration.IConfiguration configuration)
        {
            services.AddSingleton<ICacheService, MemoryCacheService>();
            services.AddScoped<IJwtTokenService, JwtTokenService>();
            services.AddScoped<ICourseService, CourseService>();
            services.AddScoped<ICourseRepository, CourseRepository>();
            services.AddScoped<IImageService, ImageService>();
            services.AddScoped<ILessonService, LessonService>();
            services.AddScoped<ILessonRepository, LessonRepository>();
            services.AddScoped<IEnrollmentRepository, EnrollmentRepository>();
            services.AddScoped<IEnrollmentService, EnrollmentService>();
            services.AddScoped<ILessonProgressRepository, ProgressRepository>();
            services.AddScoped<IProgressService, ProgressServices>();
            services.AddScoped<ICourseFileService, CourseFileService>();
            services.AddScoped<ICourseFileRepository, CourseFileRepository>();
            services.AddScoped<IFileStorageService, FileStorageService>();
            services.AddScoped<IQuizService, QuizService>();
            services.AddScoped<IQuestionService, QuestionService>();
            services.AddScoped<IQuizAttemptService, QuizAttemptService>();
            services.AddScoped<IQuizRepository, QuizRepository>();
            services.AddScoped<IQuestionRepository, QuestionRepository>();
            services.AddScoped<IQuizAttemptRepository, QuizAttemptRepository>();
            services.AddScoped<IQuestionOptionRepository, QuestionOptionRepository>();
            services.AddScoped<IQuestionOptionService, QuestionOptionService>();
            services.AddScoped<IAnswerRepository, AnswerRepository>();
            services.AddScoped<IAnswerService, AnswerService>();
            services.AddScoped<ICertificateService, CertificateService>();
            services.AddScoped<IMatterHubCertificateGenerator, MatterHubCertificateGenerator>();
            services.AddScoped<ICertificateRepository, CertificateRepository>();
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IReviewRepository, ReviewRepository>();
            services.AddScoped<IReviewService, ReviewService>();
            services.AddScoped<IEmailService, EmailService>();
            services.AddScoped<IAnalyticsService, AnalyticsService>();


            services.AddScoped<IForumPostRepository, ForumPostRepository>();
            services.AddScoped<IForumPostService, ForumPostService>();
            services.AddScoped<IForumSubscriptionRepository, ForumSubscriptionRepository>();
            services.AddScoped<IForumSubscriptionService, ForumSubscriptionService>();
            services.AddScoped<IForumThreadRepository, ForumThreadRepository>();
            services.AddScoped<IForumThreadService, ForumThreadService>();

            services.AddScoped<IForumPostVoteRepository, ForumPostVoteRepository>();
            services.AddScoped<IForumVotingService, ForumVotingService>();

            services.AddHttpClient();
            services.Configure<FawaterakOptions>(configuration.GetSection("Fawaterak"));
            services.AddScoped<IFawaterakPaymentService, FawaterakPaymentService>();

            services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
           

            return services;
        }
    }
}
