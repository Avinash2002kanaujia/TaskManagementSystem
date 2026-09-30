using System.Net.Http.Json;
using System.Text.Json;
using TaskManagement.Application.DTOs.AI;
using TaskManagement.Application.DTOs.SubTasks;
using TaskManagement.Application.DTOs.Tasks;
using TaskManagement.Application.Interfaces;

namespace TaskManagement.Infrastructure.Services;

public class OllamaAiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly ITaskService _taskService;
    private readonly ISubTaskService _subTaskService;

    public OllamaAiService(
        HttpClient httpClient,
        ITaskService taskService,
        ISubTaskService subTaskService)
    {
        _httpClient = httpClient;
        _taskService = taskService;
        _subTaskService = subTaskService;
    }

    public async Task<GenerateTaskResponse> GenerateTaskAsync(
        GenerateTaskRequest request)
    {
        var prompt =
            "You are an AI assistant for a task management system.\n\n" +
            "Generate details for the following task:\n\n" +
            "Task Title:\n" +
            request.Title +
            "\n\n" +
            "Return ONLY valid JSON with these properties:\n" +
            "description: a detailed task description\n" +
            "acceptanceCriteria: exactly 3 acceptance criteria as an array\n" +
            "subtasks: 3 to 5 subtasks as an array\n\n" +
            "Do not include markdown.\n" +
            "Do not include ```json.\n" +
            "Do not add any text outside the JSON.";

        var requestBody = new
        {
            model = "qwen2.5:7b",
            prompt,
            stream = false,
            format = "json"
        };

        HttpResponseMessage response;

try
{
    response = await _httpClient.PostAsJsonAsync(
        "/api/generate",
        requestBody);
}
catch (HttpRequestException)
{
    throw new InvalidOperationException(
        "AI service is unavailable. Make sure Ollama is running.");
}
catch (TaskCanceledException)
{
    throw new InvalidOperationException(
        "AI request timed out. Please try again.");
}

if (!response.IsSuccessStatusCode)
{
    throw new InvalidOperationException(
        $"AI service returned HTTP {(int)response.StatusCode}.");
}

        var ollamaResponse =
            await response.Content.ReadFromJsonAsync<OllamaResponse>();

        if (ollamaResponse == null ||
            string.IsNullOrWhiteSpace(ollamaResponse.Response))
        {
            throw new InvalidOperationException(
                "Ollama returned an empty response.");
        }

        var result =
            JsonSerializer.Deserialize<GenerateTaskResponse>(
                ollamaResponse.Response,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

        if (result == null)
{
    throw new InvalidOperationException(
        "Unable to parse Ollama response.");
}

if (string.IsNullOrWhiteSpace(result.Description))
{
    throw new InvalidOperationException(
        "AI did not generate a task description.");
}

if (result.AcceptanceCriteria == null ||
    result.AcceptanceCriteria.Count == 0)
{
    throw new InvalidOperationException(
        "AI did not generate acceptance criteria.");
}

if (result.Subtasks == null ||
    result.Subtasks.Count == 0)
{
    throw new InvalidOperationException(
        "AI did not generate any subtasks.");
}

result.AcceptanceCriteria = result.AcceptanceCriteria
    .Where(x => !string.IsNullOrWhiteSpace(x))
    .Take(5)
    .ToList();

result.Subtasks = result.Subtasks
    .Where(x => !string.IsNullOrWhiteSpace(x))
    .Take(10)
    .ToList();

return result;


    }

    public async Task<AiTaskResponse> CreateTaskWithAiAsync(
        CreateAiTaskRequest request,
        int userId)
    {
        // Step 1: Generate task details using AI.
        var aiRequest = new GenerateTaskRequest
        {
            Title = request.Title
        };

        var aiResult = await GenerateTaskAsync(aiRequest);

        // Step 2: Create the actual task using existing TaskService.
        var createTaskRequest = new CreateTaskRequest
        {
            Title = request.Title,
            Description = aiResult.Description,
            AcceptanceCriteria =
                string.Join(
                    "\n",
                    aiResult.AcceptanceCriteria),
            Priority = request.Priority,
            DueDate = request.DueDate,
            SprintId = request.SprintId,
            AssigneeId = request.AssigneeId
        };

        var task = await _taskService.CreateTaskAsync(
            request.ProjectId,
            createTaskRequest,
            userId);

        // Step 3: Create AI-generated subtasks.
        var subtasks = new List<SubTaskResponse>();

        foreach (var subtaskTitle in aiResult.Subtasks)
        {
            if (string.IsNullOrWhiteSpace(subtaskTitle))
            {
                continue;
            }

            var subtaskRequest = new CreateSubTaskRequest
            {
                Title = subtaskTitle
            };

            var subtask =
                await _subTaskService.CreateSubTaskAsync(
                    task.Id,
                    subtaskRequest,
                    userId);

            subtasks.Add(subtask);
        }

        // Step 4: Return the created task and subtasks.
        return new AiTaskResponse
        {
            Task = task,
            Subtasks = subtasks
        };
    }

    private class OllamaResponse
    {
        public string Response { get; set; } = string.Empty;
    }
}