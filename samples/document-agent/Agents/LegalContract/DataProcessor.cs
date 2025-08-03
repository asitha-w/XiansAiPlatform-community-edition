using Agents.Utils;
using Repositories;
using Services;
using XiansAi.Messaging;

namespace Agents.LegalContract;

public class DataProcessor {

    private readonly MessageThread _messageThread;
    private readonly ContractRepository _contractRepository = new();
    private readonly ContractValidator _validator = new();

    public DataProcessor(MessageThread messageThread) {
        _messageThread = messageThread;
    }

    public async Task<ContractWithValidations> ProcessDocumentRequest(DocumentRequest documentRequest) {
        var contract = await _contractRepository.GetContractByIdAsync(documentRequest.DocumentId);
        if (contract == null) {
            throw new Exception("Contract not found");
        }

        // Validate the updated contract
        var validationResult = _validator.ValidateContract(contract);
        return new ContractWithValidations {
            Contract = contract,
            Validations = validationResult.Insights
        };
    }

}