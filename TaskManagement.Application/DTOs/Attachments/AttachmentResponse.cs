namespace TaskManagement.Application.DTOs.Attachments;

public class AttachmentResponse
{
    public int Id { get; set; }

    public int TaskItemId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string BlobName { get; set; } = string.Empty;

    public string? FileUrl { get; set; }

    public string? ContentType { get; set; }

    public long FileSize { get; set; }

    public int UploadedBy { get; set; }

    public DateTime UploadedAt { get; set; }
}