using EducationalPlatform.Application.DTOs;
using EducationalPlatform.Application.Interfaces;
using EducationalPlatform.Domain;
using EducationalPlatform.Infrastructure.Services;
using EducationalPlatform.Application.DTOs.FawaterkDTO;
using Microsoft.Extensions.Options;
using OpenQA.Selenium;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using EducationalPlatform.Application.DTOs.Enrollments;
using EducationalPlatform.Application.Interfaces.Repositories;
using EducationalPlatform.Application.Interfaces.Services;
using EducationalPlatform.Infrastructure.Services.FawaterkServices;
using EducationalPlatform.Domain.Entities;
using EducationalPlatform.Domain.Entities.Course;

namespace EducationalPlatform.Infrastructure.Services
{
    public class EnrollmentService(
        IEnrollmentRepository enrollmentRepository, 
        ICourseRepository courseRepository, 
        IUserRepository userRepository, 
        IEmailService emailService,
        IFawaterakPaymentService paymentService,
        IOptions<FawaterakOptions> fawaterakOptions) : IEnrollmentService
    {
        private readonly IEnrollmentRepository _enrollmentRepository = enrollmentRepository;
        private readonly ICourseRepository _courseRepository = courseRepository;
        private readonly IUserRepository _userRepository = userRepository;
        private readonly IEmailService _emailService = emailService;
        private readonly IFawaterakPaymentService _paymentService = paymentService;
        private readonly FawaterakOptions _fawaterakOptions = fawaterakOptions.Value;

        public async Task<EnrollmentDto> CreateAsync(Guid studentId, Guid courseId, EInvoiceRequestModel invoiceRequest)
        {
            var course = await _courseRepository.GetByIdAsync(courseId);
            if(course == null)
                throw new NotFoundException($"Course with ID {courseId} not found.");

            var user = await _userRepository.GetByIdAsync(studentId);
            if (user == null)
                throw new NotFoundException($"User with ID {studentId} not found.");

            var exist = await _enrollmentRepository.GetByStudentAndCourseAsync(studentId, courseId);
            if (exist != null)
            {
                if (exist.IsActive || string.Equals(exist.PaymentStatus, "Paid", StringComparison.OrdinalIgnoreCase))
                    throw new InvalidOperationException("The student is already enrolled in this course.");

                // Pending/unpaid enrollment exists -> retry generating payment url
                var retryDto = await CreateOrRetryInvoiceAsync(exist, user, course, invoiceRequest, isNewEnrollment: false);
                return retryDto;
            }
            if(course.Price <= 0)
            {
                // Free course -> directly enroll without payment
                var freeEnrollment = new Enrollment(studentId, courseId)
                {
                    IsActive = true,
                    PaymentStatus = "Free"
                };
                await _enrollmentRepository.AddAsync(freeEnrollment);
                return new EnrollmentDto(freeEnrollment);
            }

            var enrollment = new Enrollment(studentId, courseId)
            {
                IsActive = false, // Set to inactive until payment is confirmed
                PaymentStatus = "Pending"
            };

            return await CreateOrRetryInvoiceAsync(enrollment, user, course, invoiceRequest, isNewEnrollment: true);
        }

        private async Task<EnrollmentDto> CreateOrRetryInvoiceAsync(
            Enrollment enrollment,
            User user,
            Course course,
            EInvoiceRequestModel invoiceRequest,
            bool isNewEnrollment)
        {
            // Initialize Fawaterak Invoice request with values from DB
            invoiceRequest.Customer = new EInvoiceRequestModel.CustomerModel
            {
                FirstName = user.UserName ?? "Student",
                LastName = "User",
                Email = user.Email,
                Phone = "0123456789" // Default or get from user if available
            };
            invoiceRequest.CartItems = new List<EInvoiceRequestModel.CartItemModel>
            {
                new EInvoiceRequestModel.CartItemModel
                {
                    Name = course.Title,
                    Price = course.Price,
                    Quantity = 1
                }
            };
            invoiceRequest.Currency = "EGP";
            invoiceRequest.PaymentMethodId ??= 1;
            invoiceRequest.ExternalId = enrollment.Id.ToString(); // Link enrollment ID to invoice
            invoiceRequest.PayLoad = new EInvoiceRequestModel.InvoicePayload
            {
                OrderId = enrollment.Id.ToString()
            };

            // Set redirection URLs from config
            invoiceRequest.RedirectionUrls = new EInvoiceRequestModel.RedirectionUrlsModel
            {
                OnSuccess = _fawaterakOptions.SuccessUrl,
                OnFailure = _fawaterakOptions.FailureUrl,
                OnPending = _fawaterakOptions.SuccessUrl // Using success for pending as well
            };

            var invoiceResponse = await _paymentService.CreateEInvoiceAsync(invoiceRequest);
            if (invoiceResponse != null && invoiceResponse.InvoiceId != null)
            {
                enrollment.InvoiceId = invoiceResponse.InvoiceId.ToString();
            }

            if (isNewEnrollment)
                await _enrollmentRepository.AddAsync(enrollment);
            else
                await _enrollmentRepository.UpdateAsync(enrollment);

            var dto = new EnrollmentDto(enrollment);
            if (invoiceResponse != null && invoiceResponse.Url != null)
            {
                dto.PaymentUrl = invoiceResponse.Url;
            }

            return dto;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var enrollment = await _enrollmentRepository.GetByIdAsync(id);
            if (enrollment == null)
                throw new NotFoundException($"Enrollment with ID {id} not found.");

            await _enrollmentRepository.DeleteAsync(enrollment);
            return true;
        }

        public async Task<IEnumerable<EnrollmentDto>> GetAllAsync()
        {
            var enrollments = await _enrollmentRepository.GetAllAsync();
            if (enrollments == null || !enrollments.Any())
                return Enumerable.Empty<EnrollmentDto>();

            return enrollments.Select(e => new EnrollmentDto(e));
        }

        public async Task<EnrollmentDto> GetByIdAsync(Guid id)
        {
            var enrollment = await _enrollmentRepository.GetByIdAsync(id);
            if (enrollment == null)
                throw new NotFoundException($"Enrollment with ID {id} not found.");

            return new EnrollmentDto(enrollment);
        }

        public async Task<EnrollmentDto> UpdateAsync(Guid id, UpdateEnrollmentDto request)
        {
            var enrollment = await _enrollmentRepository.GetByIdAsync(id);
            if (enrollment == null)
                throw new NotFoundException($"Enrollment with ID {id} not found.");

            request.ApplyTo(enrollment);
            await _enrollmentRepository.UpdateAsync(enrollment);

            return new EnrollmentDto(enrollment);
        }
    }
}
