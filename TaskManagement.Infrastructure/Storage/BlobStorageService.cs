using Azure.Storage.Blobs;
using Microsoft.Extensions.Options;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.Infrastructure.Storage;

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobContainerClient _containerClient;

    public BlobStorageService(
        IOptions<BlobStorageSettings> settings)
    {
        var blobServiceClient = new BlobServiceClient(
            settings.Value.ConnectionString);

        _containerClient = blobServiceClient
            .GetBlobContainerClient(
                settings.Value.ContainerName);
    }

    public async Task<string> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType)
    {
        await _containerClient.CreateIfNotExistsAsync();

        var blobName =
            $"{Guid.NewGuid():N}_{Path.GetFileName(fileName)}";

        var blobClient =
            _containerClient.GetBlobClient(blobName);

        await blobClient.UploadAsync(
            fileStream,
            overwrite: false);

        return blobName;
    }

    public async Task<Stream?> DownloadAsync(
        string blobName)
    {
        var blobClient =
            _containerClient.GetBlobClient(blobName);

        if (!await blobClient.ExistsAsync())
        {
            return null;
        }

        var response =
            await blobClient.DownloadStreamingAsync();

        return response.Value.Content;
    }

    public async Task DeleteAsync(
        string blobName)
    {
        var blobClient =
            _containerClient.GetBlobClient(blobName);

        await blobClient.DeleteIfExistsAsync();
    }
}