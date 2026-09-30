using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AttachmentController : ControllerBase
{
    private readonly IAttachmentService _attachmentService;

    public AttachmentController(
        IAttachmentService attachmentService)
    {
        _attachmentService = attachmentService;
    }

    [HttpPost("task/{taskId:int}")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> Upload(
        int taskId,
        IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new
                {
                    message = "A file is required."
                });
            }

            var userId = GetUserId();

            await using var stream = file.OpenReadStream();

            var attachment = await _attachmentService.UploadAsync(
                taskId,
                stream,
                file.FileName,
                file.ContentType,
                file.Length,
                userId);

            return Ok(attachment);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("task/{taskId:int}")]
    public async Task<IActionResult> GetTaskAttachments(
        int taskId)
    {
        try
        {
            var userId = GetUserId();

            var attachments =
                await _attachmentService
                    .GetTaskAttachmentsAsync(
                        taskId,
                        userId);

            return Ok(attachments);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }

    [HttpGet("{id:int}/download")]
    public async Task<IActionResult> Download(int id)
    {
        try
        {
            var userId = GetUserId();

            var result =
                await _attachmentService
                    .DownloadAsync(id, userId);

            if (result == null)
            {
                return NotFound(new
                {
                    message = "Attachment not found."
                });
            }

            return File(
                result.Value.FileStream,
                result.Value.ContentType
                    ?? "application/octet-stream",
                result.Value.FileName);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var userId = GetUserId();

            await _attachmentService.DeleteAsync(
                id,
                userId);

            return Ok(new
            {
                message = "Attachment deleted successfully."
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new
            {
                message = ex.Message
            });
        }
    }

    private int GetUserId()
    {
        var userId = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (!int.TryParse(userId, out var id))
        {
            throw new UnauthorizedAccessException(
                "Invalid user identity.");
        }

        return id;
    }
}