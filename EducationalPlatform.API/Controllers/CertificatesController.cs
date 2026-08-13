using EducationalPlatform.Application.DTOs.Certificate;
using EducationalPlatform.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace EducationalPlatform.API.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class CertificatesController : ControllerBase
    {
        private readonly ICertificateService _certificateService;

        public CertificatesController(ICertificateService certificateService)
        {
            _certificateService = certificateService;
        }

   
        /// <summary>
        /// Issue a new certificate for a user who completed a course.
        /// </summary>
        [HttpPost(Routes.Routes.Certificates.IssueCertificate)]
       
        public async Task<ActionResult<CertificateDto>> IssueCertificate([FromBody] CreateCertificateDto dto)
        {
            try
            {
                // Get User ID from JWT token
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

                if (userId == null)
                    return Unauthorized();

                // Assign the userId as InstructorId
                dto.UserId = Guid.Parse(userId);
                var certificate = await _certificateService.IssueCertificateAsync(dto);
                return Ok(certificate);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get all certificates for a specific user.
        /// </summary>
        [HttpGet(Routes.Routes.Certificates.GetUserCertificates)]
        public async Task<ActionResult<List<CertificateDto>>> GetUserCertificates(Guid userId)
        {
            try
            {
                var certificates = await _certificateService.GetUserCertificatesAsync(userId);
                return Ok(certificates);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get certificate details by certificate ID.
        /// </summary>
        [HttpGet(Routes.Routes.Certificates.GetCertificateDetails)]
        public async Task<ActionResult<CertificateDetailsDto>> GetCertificateDetails(Guid certificateId)
        {
            try
            {
                var certificate = await _certificateService.GetCertificateDetailsAsync(certificateId);
                return Ok(certificate);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Revoke a certificate by ID.
        /// </summary>
        [HttpPost(Routes.Routes.Certificates.RevokeCertificate)]
        public async Task<ActionResult> RevokeCertificate(Guid certificateId, [FromQuery] string reason = null)
        {
            try
            {
                await _certificateService.RevokeCertificateAsync(certificateId, reason);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Verify a certificate using its verification code.
        /// </summary>
        [HttpGet(Routes.Routes.Certificates.VerifyCertificate)]
        [AllowAnonymous]
        public async Task<ActionResult<VerifyCertificateDto>> VerifyCertificate(string verificationCode)
        {
            try
            {
                var result = await _certificateService.VerifyCertificateAsync(verificationCode);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Check if a certificate exists for a user and course.
        /// </summary>
        [AllowAnonymous]
        [HttpGet("{certificateId}/download")]
        public async Task<IActionResult> DownloadCertificate(Guid certificateId)
        {
            try
            {
                var (fileContents, fileName) = await _certificateService.DownloadCertificateAsync(certificateId);
                return File(fileContents, "application/pdf", fileName);
            }
            catch (Exception ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        [HttpGet(Routes.Routes.Certificates.CertificateExists)]
        public async Task<ActionResult<bool>> CertificateExists(Guid userId, Guid courseId)
        {
            try
            {
                var exists = await _certificateService.CertificateExistsAsync(userId, courseId);
                return Ok(exists);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
