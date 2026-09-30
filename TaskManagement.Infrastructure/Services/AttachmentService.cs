using Microsoft.EntityFrameworkCore;
using TaskManagement.Application.DTOs.Attachments;
using TaskManagement.Application.Interfaces;
using TaskManagement.Domain.Entities;
using TaskManagement.Infrastructure.Data;

namespace TaskManagement.Infrastructure.Services;

public class AttachmentService : IAttachmentService
{
    private readonly ApplicationDbContext _context;
    private readonly IBlobStorageService _blobStorageService;

    public AttachmentService(
        ApplicationDbContext context,
        IBlobStorageService blobStorageService)
    {
        _context = context;
        _blobStorageService = blobStorageService;
    }

    public async Task<AttachmentResponse> UploadAsync(
        int taskId,
        Stream fileStream,
        string fileName,
        string contentType,
        long fileSize,
        int userId)
    {
        // 1. Find the task in SQL Server
        var task = await _context.Tasks
            .Include(x => x.Project)
            .FirstOrDefaultAsync(x => x.Id == taskId);

        if (task == null)
        {
            throw new InvalidOperationException(
                "Task does not exist.");
        }

        // 2. Check team membership
        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == task.Project.TeamId &&
                x.UserId == userId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this project's team.");
        }

        // 3. Validate file
        if (fileSize <= 0)
        {
            throw new InvalidOperationException(
                "File cannot be empty.");
        }

        if (string.IsNullOrWhiteSpace(fileName))
        {
            throw new InvalidOperationException(
                "File name is required.");
        }

        // 4. Upload actual file to Azure Blob Storage
        var blobName = await _blobStorageService.UploadAsync(
            fileStream,
            fileName,
            contentType);

        // 5. Save file metadata in SQL Server
        var attachment = new Attachment
        {
            TaskItemId = taskId,
            FileName = Path.GetFileName(fileName),
            BlobName = blobName,
            FileUrl = null,
            ContentType = contentType,
            FileSize = fileSize,
            UploadedBy = userId,
            UploadedAt = DateTime.UtcNow
        };

        _context.Attachments.Add(attachment);
        await _context.SaveChangesAsync();

        return MapToResponse(attachment);
    }

    public async Task<List<AttachmentResponse>>
        GetTaskAttachmentsAsync(
            int taskId,
            int userId)
    {
        // 1. Find task
        var task = await _context.Tasks
            .Include(x => x.Project)
            .FirstOrDefaultAsync(x => x.Id == taskId);

        if (task == null)
        {
            throw new InvalidOperationException(
                "Task does not exist.");
        }

        // 2. Check membership
        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == task.Project.TeamId &&
                x.UserId == userId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this project's team.");
        }

        // 3. Get metadata from SQL Server
        return await _context.Attachments
            .Where(x => x.TaskItemId == taskId)
            .OrderByDescending(x => x.UploadedAt)
            .Select(x => new AttachmentResponse
            {
                Id = x.Id,
                TaskItemId = x.TaskItemId,
                FileName = x.FileName,
                BlobName = x.BlobName,
                FileUrl = x.FileUrl,
                ContentType = x.ContentType,
                FileSize = x.FileSize,
                UploadedBy = x.UploadedBy,
                UploadedAt = x.UploadedAt
            })
            .ToListAsync();
    }

    public async Task<(Stream FileStream, string FileName, string? ContentType)?>
        DownloadAsync(
            int attachmentId,
            int userId)
    {
        // 1. Find attachment and task
        var attachment = await _context.Attachments
            .Include(x => x.TaskItem)
                .ThenInclude(x => x.Project)
            .FirstOrDefaultAsync(x => x.Id == attachmentId);

        if (attachment == null)
        {
            return null;
        }

        // 2. Check membership
        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == attachment.TaskItem.Project.TeamId &&
                x.UserId == userId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this project's team.");
        }

        // 3. Download actual file from Azure Blob
        var fileStream = await _blobStorageService
            .DownloadAsync(attachment.BlobName);

        if (fileStream == null)
        {
            throw new InvalidOperationException(
                "File was not found in Blob Storage.");
        }

        return (
            fileStream,
            attachment.FileName,
            attachment.ContentType
        );
    }

    public async Task DeleteAsync(
        int attachmentId,
        int userId)
    {
        // 1. Find attachment and task
        var attachment = await _context.Attachments
            .Include(x => x.TaskItem)
                .ThenInclude(x => x.Project)
            .FirstOrDefaultAsync(x => x.Id == attachmentId);

        if (attachment == null)
        {
            throw new InvalidOperationException(
                "Attachment does not exist.");
        }

        // 2. Check membership
        var isMember = await _context.TeamMembers
            .AnyAsync(x =>
                x.TeamId == attachment.TaskItem.Project.TeamId &&
                x.UserId == userId);

        if (!isMember)
        {
            throw new UnauthorizedAccessException(
                "You are not a member of this project's team.");
        }

        // 3. Delete actual file from Azure Blob
        await _blobStorageService.DeleteAsync(
            attachment.BlobName);

        // 4. Delete metadata from SQL Server
        _context.Attachments.Remove(attachment);
        await _context.SaveChangesAsync();
    }

    private static AttachmentResponse MapToResponse(
        Attachment attachment)
    {
        return new AttachmentResponse
        {
            Id = attachment.Id,
            TaskItemId = attachment.TaskItemId,
            FileName = attachment.FileName,
            BlobName = attachment.BlobName,
            FileUrl = attachment.FileUrl,
            ContentType = attachment.ContentType,
            FileSize = attachment.FileSize,
            UploadedBy = attachment.UploadedBy,
            UploadedAt = attachment.UploadedAt
        };
    }
}