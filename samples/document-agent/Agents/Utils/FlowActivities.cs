
using System.Text.Json;
using System.Text.Json.Serialization;
using Repositories;
using Services;
using XiansAi.Messaging;
using Microsoft.Extensions.Logging;
using Temporalio.Activities;

namespace Agents.Utils;

public class DocumentRequest
{
    [JsonPropertyName("documentId")]
    public Guid DocumentId { get; set; } = Guid.Empty;
}

public interface IFlowActivities
{
    [Activity]
    Task Handle(MessageThread messageThread);
}

public class FlowActivities : IFlowActivities
{
    
    private readonly ContractRepository _contractRepository = new();
    private readonly ContractValidator _validator = new();
    private readonly ILogger _logger = LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<DocumentRequest>();

    private DocumentRequest FromJson(string json)
    {
        var documentRequest = JsonSerializer.Deserialize<DocumentRequest>(json);
        if (documentRequest == null)
        {
            throw new Exception("Invalid document request JSON: " + json);
        }
        return documentRequest;
    }


    public async Task Handle(MessageThread messageThread)
    {   
            try {
            var data = messageThread.LatestMessage.Data?.ToString();
            _logger.LogInformation("Data: " + data);
            if (data == null)
            {
                throw new Exception("No data sent in message");
            }
            var documentRequest = FromJson(data);
            _logger.LogInformation("Document request: " + documentRequest.DocumentId);
            var contract = await _contractRepository.GetContractByIdAsync(documentRequest.DocumentId);
            _logger.LogInformation($"Contract: " + contract?.Id);
            if (contract == null)
            {
                throw new Exception("Contract not found");
            }

            // Validate the updated contract
            var validationResult = _validator.ValidateContract(contract);
            // Send document update with contract and validations
            await messageThread.SendData(new DocumentUpdate(new ContractWithValidations
            {
                Contract = contract,
                Validations = validationResult.Insights
            }));
        }
        catch (Exception ex)
        {
            await messageThread.SendData(new ErrorMessage(ex.Message));
        }
    }
}