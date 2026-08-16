using EducationalPlatform.Domain.Entities;
using EducationalPlatform.Domain.Entities.Course;
using EducationalPlatform.Domain.Entities.Leeson;
using EducationalPlatform.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Data
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
            var logger = scope.ServiceProvider.GetService<ILoggerFactory>()?.CreateLogger("DatabaseSeeder");

            try
            {
                // Ensure Database migrations are applied
                await context.Database.MigrateAsync();

                // 1. Seed Roles
                string[] roles = { UserRole.Admin.ToString(), UserRole.Instructor.ToString(), UserRole.Student.ToString() };
                foreach (var role in roles)
                {
                    if (!await roleManager.RoleExistsAsync(role))
                    {
                        await roleManager.CreateAsync(new IdentityRole<Guid>(role));
                    }
                }

                // 2. Seed Admin User
                var adminEmail = "admin@matterhub.com";
                var adminUser = await userManager.FindByEmailAsync(adminEmail);
                if (adminUser == null)
                {
                    adminUser = new User
                    {
                        UserName = "Admin",
                        Email = adminEmail,
                        FirstName = "Admin",
                        LastName = "System",
                        Role = UserRole.Admin,
                        EmailConfirmed = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    var result = await userManager.CreateAsync(adminUser, "Admin@123456");
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(adminUser, UserRole.Admin.ToString());
                    }
                }

                // 3. Seed Instructor User
                var instructorEmail = "instructor@matterhub.com";
                var instructorUser = await userManager.FindByEmailAsync(instructorEmail);
                if (instructorUser == null)
                {
                    instructorUser = new User
                    {
                        UserName = "Instructor",
                        Email = instructorEmail,
                        FirstName = "م. أحمد",
                        LastName = "محمود",
                        Role = UserRole.Instructor,
                        EmailConfirmed = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    var result = await userManager.CreateAsync(instructorUser, "Instructor@123456");
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(instructorUser, UserRole.Instructor.ToString());
                    }
                }

                // 4. Seed Student User
                var studentEmail = "student@matterhub.com";
                var studentUser = await userManager.FindByEmailAsync(studentEmail);
                if (studentUser == null)
                {
                    studentUser = new User
                    {
                        UserName = "Student",
                        Email = studentEmail,
                        FirstName = "عمر",
                        LastName = "خالد",
                        Role = UserRole.Student,
                        EmailConfirmed = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    var result = await userManager.CreateAsync(studentUser, "Student@123456");
                    if (result.Succeeded)
                    {
                        await userManager.AddToRoleAsync(studentUser, UserRole.Student.ToString());
                    }
                }

                // 5. Seed Courses if none exist
                if (!await context.Courses.AnyAsync())
                {
                    var instructorId = instructorUser?.Id ?? adminUser!.Id;

                    // Course 1: Node.js Web API
                    var nodeCourse = new Course(
                        "Node.js Web API Masterclass",
                        "دورة شاملة وتطبيقية لبناء واجهات برمجية متقدمة باستخدام Node.js و Express مع تطبيق أفضل المعايير الأمنية وقواعد البيانات.",
                        instructorId,
                        15,
                        true,
                        "",
                        0,
                        4
                    );
                    await context.Courses.AddAsync(nodeCourse);
                    await context.SaveChangesAsync();

                    var nodeLesson1 = new Lesson(
                        nodeCourse.Id,
                        "مقدمة في بيئة عمل Node.js و Express",
                        "في هذا الدرس سنتعرف على بنية Node.js وكيفية تثبيت Express وإعداد بيئة التطوير الأساسية للمشروع.",
                        1,
                        25
                    );
                    var nodeLesson2 = new Lesson(
                        nodeCourse.Id,
                        "بناء مسارات RESTful APIs ومعالجة الطلبات",
                        "شرح شامل لكيفية تصميم الـ Endpoints واستقبال المعاملات ومعالجة أخطاء الـ HTTP والـ Middlewares.",
                        2,
                        35
                    );
                    var nodeLesson3 = new Lesson(
                        nodeCourse.Id,
                        "الاتصال بقواعد البيانات وإدارة الـ Models",
                        "ربط الخادم مع قاعدة البيانات والتعامل مع العمليات الأساسية CRUD وتأمين استعلامات البيانات.",
                        3,
                        40
                    );
                    await context.Lessons.AddRangeAsync(nodeLesson1, nodeLesson2, nodeLesson3);
                    await context.SaveChangesAsync();

                    // Quiz for Node Lesson 2
                    var nodeQuiz = new Quiz
                    {
                        Id = Guid.NewGuid(),
                        Title = "اختبار تقييمي: أساسيات Node.js & APIs",
                        Description = "اختبار لقياس فهمك للمفاهيم الأساسية في Express والـ Middlewares",
                        LessonId = nodeLesson2.Id,
                        DurationMinutes = 15,
                        TotalScore = 100,
                        PassingScore = 70,
                        IsPublished = true,
                        AvailableFrom = DateTime.UtcNow.AddDays(-1),
                        AvailableTo = DateTime.UtcNow.AddYears(2)
                    };
                    await context.Quizzes.AddAsync(nodeQuiz);
                    await context.SaveChangesAsync();

                    var q1 = new Question
                    {
                        Id = Guid.NewGuid(),
                        QuizId = nodeQuiz.Id,
                        Content = "ما هي وظيفة الـ Middleware في Express.js؟",
                        QuestionType = QuestionType.MultipleChoice,
                        Score = 50
                    };
                    await context.Questions.AddAsync(q1);
                    await context.SaveChangesAsync();

                    await context.QuestionOptions.AddRangeAsync(
                        new QuestionOption { Id = Guid.NewGuid(), QuestionId = q1.Id, Text = "معالجة وفحص الطلب قبل وصوله للـ Route Handler", IsCorrect = true },
                        new QuestionOption { Id = Guid.NewGuid(), QuestionId = q1.Id, Text = "تصميم صفحات HTML فقط", IsCorrect = false },
                        new QuestionOption { Id = Guid.NewGuid(), QuestionId = q1.Id, Text = "حذف قواعد البيانات تلقائياً", IsCorrect = false }
                    );

                    var q2 = new Question
                    {
                        Id = Guid.NewGuid(),
                        QuizId = nodeQuiz.Id,
                        Content = "ما هو كود الحالة المناسب عند نجاح إنشاء عنصر جديد في REST API؟",
                        QuestionType = QuestionType.MultipleChoice,
                        Score = 50
                    };
                    await context.Questions.AddAsync(q2);
                    await context.SaveChangesAsync();

                    await context.QuestionOptions.AddRangeAsync(
                        new QuestionOption { Id = Guid.NewGuid(), QuestionId = q2.Id, Text = "201 Created", IsCorrect = true },
                        new QuestionOption { Id = Guid.NewGuid(), QuestionId = q2.Id, Text = "404 Not Found", IsCorrect = false },
                        new QuestionOption { Id = Guid.NewGuid(), QuestionId = q2.Id, Text = "500 Server Error", IsCorrect = false }
                    );

                    // Course 2: ASP.NET Core Clean Architecture
                    var dotnetCourse = new Course(
                        "ASP.NET Core .NET 8 & Clean Architecture",
                        "تعلم بناء أنظمة Enterprise قابلة للتوسع والصيانة باستخدام .NET 8, Clean Architecture, Entity Framework Core و Session Auth.",
                        instructorId,
                        25,
                        true,
                        "",
                        250,
                        5
                    );
                    await context.Courses.AddAsync(dotnetCourse);
                    await context.SaveChangesAsync();

                    var dotnetLesson1 = new Lesson(
                        dotnetCourse.Id,
                        "مبادئ Clean Architecture وهيكلة المشروع",
                        "شرح طبقات Domain, Application, Infrastructure و API وكيفية فصل المسؤوليات.",
                        1,
                        30
                    );
                    var dotnetLesson2 = new Lesson(
                        dotnetCourse.Id,
                        "تطبيق Entity Framework Core و Migrations",
                        "بناء الـ Repositories واستخدام LINQ والـ Migrations مع SQL Server.",
                        2,
                        45
                    );
                    await context.Lessons.AddRangeAsync(dotnetLesson1, dotnetLesson2);
                    await context.SaveChangesAsync();

                    // Course 3: Angular 19 Masterclass
                    var angularCourse = new Course(
                        "Angular 19 & Signals Modern Web Development",
                        "احترف بناء واجهات المستخدم الحديثة والتفاعلية باستخدام Angular 19, Signals, Standalone Components و TailwindCSS.",
                        instructorId,
                        20,
                        true,
                        "",
                        180,
                        4
                    );
                    await context.Courses.AddAsync(angularCourse);
                    await context.SaveChangesAsync();

                    var ngLesson1 = new Lesson(
                        angularCourse.Id,
                        "التحول إلى Angular Signals و State Management",
                        "فهم آلية عمل Signals و computed و effects لإدارة حالة التطبيق بأعلى أداء.",
                        1,
                        35
                    );
                    await context.Lessons.AddAsync(ngLesson1);
                    await context.SaveChangesAsync();
                }

                logger?.LogInformation("[DatabaseSeeder] Initial data seeded successfully.");
            }
            catch (Exception ex)
            {
                logger?.LogError(ex, "[DatabaseSeeder] An error occurred while seeding the database.");
            }
        }
    }
}
