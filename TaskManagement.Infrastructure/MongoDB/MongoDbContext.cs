using Microsoft.Extensions.Options;
using MongoDB.Driver;
using TaskManagement.Infrastructure.MongoDB.Models;

namespace TaskManagement.Infrastructure.MongoDB;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(
        IOptions<MongoDbSettings> settings)
    {
        var client = new MongoClient(
            settings.Value.ConnectionString);

        _database = client.GetDatabase(
            settings.Value.DatabaseName);
    }

    public IMongoCollection<CommentDocument> Comments =>
        _database.GetCollection<CommentDocument>("Comments");
}