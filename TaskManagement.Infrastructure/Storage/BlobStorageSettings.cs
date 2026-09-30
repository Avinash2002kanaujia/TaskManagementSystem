namespace TaskManagement.Infrastructure.Storage;

public class BlobStorageSettings
{
    public string ConnectionString { get; set; } = string.Empty;

    public string ContainerName { get; set; } = "task-attachments";
}