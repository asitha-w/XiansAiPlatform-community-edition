using System.Text.Json;
using LegalContract.Services;
using XiansAi.Flow.Router.Plugins;
using XiansAi.Logging;
using XiansAi.Messaging;
using Agents.Utils;

namespace Agents.LegalContract;

public class GeneralCapabilities
{
    private readonly MessageThread _thread;

    private readonly DocumentContext _documentContext;
    private readonly ContractRepository _contractRepository;
    private static readonly Logger<GeneralCapabilities> _logger =
        Logger<GeneralCapabilities>.For();

    public GeneralCapabilities(MessageThread thread)
    {
        _thread = thread;
        _documentContext = new DocumentContext(_thread);
        _contractRepository = new ContractRepository();
    }

    [Capability("Create a new legal contract document from scratch - Use when user wants to start a new contract or has no existing contract ID")]
    [Parameter("title", "Descriptive title for the new contract (e.g., 'Software Development Agreement', 'Service Contract')")]
    [Returns("Unique GUID identifier for the newly created contract document with basic structure initialized")]
    public async Task<Guid> CreateDocument(string title)
    {
        await _thread.SendData(new WorkLog($"Starting CreateDocument with title: {title}"));

        try
        {
            if (string.IsNullOrWhiteSpace(title))
            {
                throw new ArgumentException("Contract title cannot be empty or null.", nameof(title));
            }

            var contractId = Guid.NewGuid();

            var contract = _contractRepository.CreateNewContract(title, contractId);
            var saveResult = await _contractRepository.SaveContractAsync(contract);
            if (!saveResult)
            {
                throw new InvalidOperationException("Failed to save the new contract document.");
            }
            await _thread.SendData(new WorkLog($"Contract created with ID `{contractId}`"));
            await _thread.SendData(new UIComponent("ContractLink", new Dictionary<string, object> { { "id", contractId } }));
            
            return contractId;
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

    [Capability("Retrieve the currently active contract document from session context - Use when working with a contract already set in the current session")]
    [Returns("Complete contract object with all sections (scope, parties, terms, signatures) from the current document context")]
    public async Task<Contract> GetCurrentContract()
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

    [Capability("List all available legal contract documents in the system - Use to show user all contracts or help them find a specific contract by browsing")]
    [Returns("Complete list of contract objects ordered by creation date (newest first), each containing ID, title, status, and basic metadata")]
    public async Task<List<Contract>> ListAllContracts()
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

    [Capability("Validate the currently active contract document for legal compliance and completeness - Use when user asks to check or validate the contract they're currently working on")]
    [Returns("Comprehensive validation report with critical issues, warnings, and suggestions organized by contract sections (scope, parties, terms, signatures)")]
    public async Task<ValidationResult> ValidateCurrentContract()
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

    [Capability("Validate any specific contract document by its ID - Use when user provides a contract ID or wants to validate a contract different from the current session")]
    [Parameter("contractId", "The unique GUID identifier of the contract to validate (must be a valid existing contract ID)")]
    [Returns("Detailed validation report with legal compliance insights, categorized by severity (Critical/Warning/Suggestion) and contract sections")]
    public async Task<ValidationResult> ValidateContractById(Guid contractId)
    {
        if (contractId == Guid.Empty)
        {
            throw new ArgumentException("Contract ID cannot be empty.", nameof(contractId));
        }

        await _thread.SendData(new WorkLog($"Starting to Validate Contract with ID: {contractId}"));

        try
        {
            // Fetch the contract
            var contract = await _contractRepository.GetContractAsync(contractId);
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

    [Capability("Retrieve any specific contract document by its unique ID - Use when user provides a contract ID or wants to access a contract different from the current session")]
    [Parameter("contractId", "The unique GUID identifier of the contract to retrieve (must be a valid existing contract ID)")]
    [Returns("Complete contract object with all sections populated (scope, parties, terms, signatures) or throws exception if contract not found")]
    public async Task<Contract> GetContractById(Guid contractId)
    {
        if (contractId == Guid.Empty)
        {
            throw new ArgumentException("Contract ID cannot be empty.", nameof(contractId));
        }

        await _thread.SendData(new WorkLog($"Starting to Fetch Contract with ID: {contractId}"));

        try
        {
            var contract = await _contractRepository.GetContractAsync(contractId);
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

    [Capability("Update an existing contract document with new information - Use when user wants to modify an existing contract's content, terms, parties, or other details")]
    [Parameter("contract", "The complete contract object with updated information including all sections (scope, parties, terms, signatures)")]
    [Returns("True if the contract was successfully updated, false if the contract doesn't exist or update failed")]
    public async Task<bool> UpdateContract(Contract contract)
    {
        if (contract == null)
        {
            throw new ArgumentException("Contract cannot be null.", nameof(contract));
        }

        if (contract.Id == Guid.Empty)
        {
            throw new ArgumentException("Contract ID cannot be empty.", nameof(contract));
        }

        await _thread.SendData(new WorkLog($"Starting to update contract with ID: {contract.Id}"));

        try
        {
            var updateResult = await _contractRepository.UpdateContractAsync(contract);
            
            if (!updateResult)
            {
                await _thread.SendData(new WorkLog($"Failed to update contract with ID: {contract.Id} - Contract may not exist"));
                return false;
            }

            await _thread.SendData(new WorkLog($"Successfully updated contract with ID: {contract.Id}"));
            
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error occurred while updating contract document: {ex.Message}");
            throw new InvalidOperationException(
                $"Error updating contract document: {ex.Message}",
                ex
            );
        }
    }
}
