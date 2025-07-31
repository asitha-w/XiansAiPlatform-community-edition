using System.Text.Json;
using LegalContract.Services;
using XiansAi.Flow.Router.Plugins;
using XiansAi.Logging;
using XiansAi.Messaging;
using Agents.Utils;

namespace Agents.LegalContract;

public class ContractCapabilities
{
    private readonly MessageThread _thread;

    private readonly DocumentContext _documentContext;
    private readonly ContractRepository _contractRepository;
    private static readonly Logger<ContractCapabilities> _logger =
        Logger<ContractCapabilities>.For();

    public ContractCapabilities(MessageThread thread)
    {
        _thread = thread;
        _documentContext = new DocumentContext(_thread);
        _contractRepository = new ContractRepository();
    }

    [Capability("Create a new legal contract document with specified title")]
    [Parameter("title", "The title of the contract document")]
    [Returns("A new contract document with generated ID and basic structure")]
    public async Task<Guid> CreateDocument(string title)
    {
        await _thread.SendData(new WorkLog($"Starting CreateDocument with title: {title}"));

        try
        {
            if (string.IsNullOrWhiteSpace(title))
            {
                throw new ArgumentException("Contract title cannot be empty or null.", nameof(title));
            }

            var contract = _contractRepository.CreateNewContract(title);

            await _thread.SendData(new WorkLog($"Created contract with ID: {contract.Id}"));

            // Save the new contract to ensure it persists
            var saveResult = await _contractRepository.SaveContractAsync(contract);
            if (!saveResult)
            {
                throw new InvalidOperationException("Failed to save the new contract document.");
            }

            _logger.LogInformation($"Successfully created contract with ID: {contract.Id}");

            await _thread.SendData(new NewContractCreated(contract));
            
            return contract.Id;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error occurred while creating contract document: {ex.Message}");
            throw new InvalidOperationException(
                $"Error creating contract document: {ex.Message}",
                ex
            );
        }
    }

    [Capability("Retrieve an existing legal contract document by its unique identifier")]
    [Returns("The contract document if found, otherwise throws an exception")]
    public async Task<Contract> FetchDocument()
    {

        var contractId = _documentContext.DocumentId;

        if (contractId is null || contractId == Guid.Empty)
        {
            throw new ArgumentException("Contract ID cannot be empty. Do you like to create a new document?");
        }

        await _thread.SendData(new WorkLog($"Starting to Fetch Contract with ID: {contractId}"));

        try
        {
            var contract = await _contractRepository.GetContractAsync(contractId.Value);
            if (contract == null)
            {
                throw new InvalidOperationException($"No contract found with ID: {contractId}");
            }

            await _thread.SendData(new WorkLog($"Successfully retrieved contract with ID: {contractId}"));
            
            return contract;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error occurred while fetching contract document: {ex.Message}");
            throw new InvalidOperationException(
                $"Error retrieving contract document: {ex.Message}",
                ex
            );
        }
    }

    [Capability("List all legal contract documents")]
    [Returns("A list of all contract documents ordered by creation date")]
    public async Task<List<Contract>> ListAllDocuments()
    {
        await _thread.SendData(new WorkLog("Starting ListAllDocuments"));

        try
        {
            var contracts = await _contractRepository.GetAllContractsAsync();
            
            await _thread.SendData(new WorkLog($"Successfully retrieved {contracts.Count} contract documents"));
            
            return contracts;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error occurred while listing contract documents: {ex.Message}");
            throw new InvalidOperationException(
                $"Error retrieving contract documents: {ex.Message}",
                ex
            );
        }
    }

    [Capability("Validate a legal contract document by its unique identifier")]
    [Parameter("contractId", "The unique identifier of the contract document to validate")]
    [Returns("Validation result containing insights about contract compliance and issues")]
    public async Task<ValidationResult> ValidateDocument()
    {
        var contractId = _documentContext.DocumentId;

        if (contractId is null || contractId == Guid.Empty)
        {
            throw new ArgumentException("Contract ID cannot be empty. Do you like to create a new document?");
        }

        await _thread.SendData(new WorkLog($"Starting to Validate Contract with ID: {contractId}"));

        try
        {
            // Fetch the contract
            var contract = await _contractRepository.GetContractAsync(contractId.Value);
            if (contract == null)
            {
                throw new InvalidOperationException($"No contract found with ID: {contractId}");
            }

            // Validate the contract using ContractValidator
            var validator = new ContractValidator();
            var validationResult = validator.ValidateContract(contract);

            await _thread.SendData(new WorkLog($"Successfully validated contract with ID: {contractId}. " +
                                 $"Valid: {validationResult.IsValid}, " +
                                 $"Issues: {validationResult.Insights.Count}, " +
                                 $"Critical: {validationResult.Insights.Count(i => i.Severity == InsightSeverity.Critical)}, "));

            return validationResult;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error occurred while validating contract document: {ex.Message}");
            throw new InvalidOperationException(
                $"Error validating contract document: {ex.Message}",
                ex
            );
        }
    }
}
