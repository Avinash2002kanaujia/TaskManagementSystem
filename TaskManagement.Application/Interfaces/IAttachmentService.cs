using TaskManagement.Application.DTOs.Attachments;

namespace TaskManagement.Application.Interfaces;

public interface IAttachmentService
{
    Task<AttachmentResponse> UploadAsync(
        int taskId,
        Stream fileStream,
        string fileName,
        string contentType,
        long fileSize,
        int userId);

    Task<List<AttachmentResponse>> GetTaskAttachmentsAsync(
        int taskId,
        int userId);

    Task<(Stream FileStream, string FileName, string? ContentType)?>
        DownloadAsync(
            int attachmentId,
            int userId);

    Task DeleteAsync(
        int attachmentId,
        int userId);
}