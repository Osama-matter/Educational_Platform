using System;

namespace EducationalPlatform.Application.DTOs.FawaterkDTO;

public class InitiatePaymentDto
{
    public Guid CourseId { get; set; }
    public string PaymentMethod { get; set; } = "fawaterak";
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
}
