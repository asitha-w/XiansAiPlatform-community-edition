using System.Text.RegularExpressions;

namespace LegalContract.Services;

// Insight models for validation results
public enum InsightSeverity
{
    Critical,
    Warning,
    Suggestion
}

public enum InsightSection
{
    Scope,
    Parties,
    Terms,
    Signatures,
    General
}

public class ValidationInsight
{
    public InsightSeverity Severity { get; set; }
    public InsightSection Section { get; set; }
    public string Rule { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string? FieldPath { get; set; }
    public object? CurrentValue { get; set; }
    public string? SuggestedAction { get; set; }
}

public class ValidationResult
{
    public List<ValidationInsight> Insights { get; set; } = new();
    public bool IsValid => !Insights.Any(i => i.Severity == InsightSeverity.Critical);
    public bool HasWarnings => Insights.Any(i => i.Severity == InsightSeverity.Warning);
    public bool HasSuggestions => Insights.Any(i => i.Severity == InsightSeverity.Suggestion);

    public void AddInsight(InsightSeverity severity, InsightSection section, string rule, string message, 
        string details = "", string? fieldPath = null, object? currentValue = null, string? suggestedAction = null)
    {
        Insights.Add(new ValidationInsight
        {
            Severity = severity,
            Section = section,
            Rule = rule,
            Message = message,
            Details = details,
            FieldPath = fieldPath,
            CurrentValue = currentValue,
            SuggestedAction = suggestedAction
        });
    }
}

// Base validator interface
public interface IContractSectionValidator
{
    ValidationResult Validate(Contract contract);
}

// Scope validation
public class ScopeValidator : IContractSectionValidator
{
    public ValidationResult Validate(Contract contract)
    {
        var result = new ValidationResult();
        var scope = contract.Scope;

        // Critical validations
        if (string.IsNullOrWhiteSpace(scope.Title))
        {
            result.AddInsight(InsightSeverity.Critical, InsightSection.Scope, "SCOPE_TITLE_REQUIRED",
                "Contract title is required", "A clear contract title is essential for legal identification",
                "Scope.Title", scope.Title, "Add a descriptive contract title");
        }

        if (scope.EffectiveDate == null)
        {
            result.AddInsight(InsightSeverity.Critical, InsightSection.Scope, "EFFECTIVE_DATE_REQUIRED",
                "Effective date is required", "All contracts must have a clear start date",
                "Scope.EffectiveDate", scope.EffectiveDate, "Specify when the contract becomes effective");
        }

        if (string.IsNullOrWhiteSpace(scope.Description))
        {
            result.AddInsight(InsightSeverity.Critical, InsightSection.Scope, "DESCRIPTION_REQUIRED",
                "Contract description is required", "A description clarifies the contract's purpose",
                "Scope.Description", scope.Description, "Add a clear description of the contract purpose");
        }

        // Warning validations
        if (scope.EffectiveDate != null && scope.ExpirationDate != null && scope.EffectiveDate >= scope.ExpirationDate)
        {
            result.AddInsight(InsightSeverity.Warning, InsightSection.Scope, "INVALID_DATE_RANGE",
                "Effective date must be before expiration date", "The contract timeline is logically inconsistent",
                "Scope.EffectiveDate, Scope.ExpirationDate", $"{scope.EffectiveDate} >= {scope.ExpirationDate}",
                "Ensure effective date is before expiration date");
        }

        if (scope.EffectiveDate != null && scope.EffectiveDate < DateTime.UtcNow.Date.AddDays(-30))
        {
            result.AddInsight(InsightSeverity.Warning, InsightSection.Scope, "BACKDATED_CONTRACT",
                "Contract effective date is significantly in the past", "Backdated contracts may have legal implications",
                "Scope.EffectiveDate", scope.EffectiveDate, "Review if backdating is intentional and legally compliant");
        }

        if (string.IsNullOrWhiteSpace(scope.ScopeOfWork))
        {
            result.AddInsight(InsightSeverity.Warning, InsightSection.Scope, "SCOPE_OF_WORK_MISSING",
                "Scope of work should be defined", "Clear scope prevents disputes about deliverables",
                "Scope.ScopeOfWork", scope.ScopeOfWork, "Define specific work to be performed");
        }

        // Suggestion validations
        if (scope.Deliverables.Count == 0)
        {
            result.AddInsight(InsightSeverity.Suggestion, InsightSection.Scope, "NO_DELIVERABLES",
                "Consider specifying deliverables", "Clear deliverables help manage expectations",
                "Scope.Deliverables", scope.Deliverables.Count, "List specific deliverables expected");
        }

        if (string.IsNullOrWhiteSpace(scope.RenewalTerms) && scope.ExpirationDate != null)
        {
            result.AddInsight(InsightSeverity.Suggestion, InsightSection.Scope, "NO_RENEWAL_TERMS",
                "Consider adding renewal terms", "Renewal terms clarify contract continuation options",
                "Scope.RenewalTerms", scope.RenewalTerms, "Specify if and how the contract can be renewed");
        }

        return result;
    }
}

// Parties validation
public class PartiesValidator : IContractSectionValidator
{
    private readonly Regex _emailRegex = new(@"^[^\s@]+@[^\s@]+\.[^\s@]+$", RegexOptions.Compiled);
    private readonly Regex _phoneRegex = new(@"^[\+]?[1-9][\d]{0,15}$", RegexOptions.Compiled);

    public ValidationResult Validate(Contract contract)
    {
        var result = new ValidationResult();
        var parties = contract.Parties;

        // Critical validations
        if (parties.Count < 2)
        {
            result.AddInsight(InsightSeverity.Critical, InsightSection.Parties, "INSUFFICIENT_PARTIES",
                "Contract must have at least two parties", "Legal contracts require minimum two parties",
                "Parties", parties.Count, "Add all parties involved in the contract");
        }

        var roles = parties.Select(p => p.Role?.ToLower()).ToList();
        if (roles.Distinct().Count() != roles.Count)
        {
            result.AddInsight(InsightSeverity.Critical, InsightSection.Parties, "DUPLICATE_ROLES",
                "Parties cannot have duplicate roles", "Each party should have a unique role",
                "Parties.Role", string.Join(", ", roles), "Ensure each party has a unique role");
        }

        for (int i = 0; i < parties.Count; i++)
        {
            var party = parties[i];
            var partyPrefix = $"Parties[{i}]";

            // Critical party validations
            if (string.IsNullOrWhiteSpace(party.Name))
            {
                result.AddInsight(InsightSeverity.Critical, InsightSection.Parties, "PARTY_NAME_REQUIRED",
                    $"Party name is required", "All parties must be clearly identified",
                    $"{partyPrefix}.Name", party.Name, "Provide the full legal name of the party");
            }

            if (string.IsNullOrWhiteSpace(party.Role))
            {
                result.AddInsight(InsightSeverity.Critical, InsightSection.Parties, "PARTY_ROLE_REQUIRED",
                    $"Party role is required", "Each party's role must be defined",
                    $"{partyPrefix}.Role", party.Role, "Specify the party's role (e.g., client, provider, vendor)");
            }

            // Warning validations
            if (string.IsNullOrWhiteSpace(party.Contact.Email))
            {
                result.AddInsight(InsightSeverity.Warning, InsightSection.Parties, "NO_EMAIL_CONTACT",
                    $"Party '{party.Name}' has no email contact", "Email contact facilitates communication",
                    $"{partyPrefix}.Contact.Email", party.Contact.Email, "Add a valid email address");
            }
            else if (!_emailRegex.IsMatch(party.Contact.Email))
            {
                result.AddInsight(InsightSeverity.Warning, InsightSection.Parties, "INVALID_EMAIL_FORMAT",
                    $"Party '{party.Name}' has invalid email format", "Invalid email may cause communication issues",
                    $"{partyPrefix}.Contact.Email", party.Contact.Email, "Provide a valid email address");
            }

            if (string.IsNullOrWhiteSpace(party.Representative.Name))
            {
                result.AddInsight(InsightSeverity.Warning, InsightSection.Parties, "NO_REPRESENTATIVE",
                    $"Party '{party.Name}' has no designated representative", "Representative clarifies who can act for the party",
                    $"{partyPrefix}.Representative.Name", party.Representative.Name, "Designate an authorized representative");
            }

            // Address validation
            ValidateAddress(result, party, partyPrefix);

            // Suggestions
            if (string.IsNullOrWhiteSpace(party.Contact.Phone))
            {
                result.AddInsight(InsightSeverity.Suggestion, InsightSection.Parties, "NO_PHONE_CONTACT",
                    $"Consider adding phone contact for '{party.Name}'", "Phone contact provides alternative communication",
                    $"{partyPrefix}.Contact.Phone", party.Contact.Phone, "Add a phone number for direct contact");
            }

            if (string.IsNullOrWhiteSpace(party.Representative.Title))
            {
                result.AddInsight(InsightSeverity.Suggestion, InsightSection.Parties, "NO_REPRESENTATIVE_TITLE",
                    $"Consider adding title for representative of '{party.Name}'", "Title clarifies authority level",
                    $"{partyPrefix}.Representative.Title", party.Representative.Title, "Add the representative's title");
            }
        }

        return result;
    }

    private void ValidateAddress(ValidationResult result, Party party, string partyPrefix)
    {
        var address = party.Address;
        
        if (string.IsNullOrWhiteSpace(address.Street) && 
            string.IsNullOrWhiteSpace(address.City) && 
            string.IsNullOrWhiteSpace(address.State) && 
            string.IsNullOrWhiteSpace(address.Country))
        {
            result.AddInsight(InsightSeverity.Warning, InsightSection.Parties, "NO_ADDRESS",
                $"Party '{party.Name}' has no address information", "Address is important for legal notices",
                $"{partyPrefix}.Address", "Empty", "Provide complete address information");
        }
        else
        {
            // Check individual address components if address is partially provided
            if (string.IsNullOrWhiteSpace(address.Street))
            {
                result.AddInsight(InsightSeverity.Suggestion, InsightSection.Parties, "INCOMPLETE_ADDRESS",
                    $"Street address missing for '{party.Name}'", "Complete address improves legal clarity",
                    $"{partyPrefix}.Address.Street", address.Street, "Add street address");
            }

            if (string.IsNullOrWhiteSpace(address.City))
            {
                result.AddInsight(InsightSeverity.Suggestion, InsightSection.Parties, "INCOMPLETE_ADDRESS",
                    $"City missing for '{party.Name}'", "Complete address improves legal clarity",
                    $"{partyPrefix}.Address.City", address.City, "Add city information");
            }

            if (string.IsNullOrWhiteSpace(address.Country))
            {
                result.AddInsight(InsightSeverity.Warning, InsightSection.Parties, "NO_COUNTRY",
                    $"Country missing for '{party.Name}'", "Country is important for jurisdiction",
                    $"{partyPrefix}.Address.Country", address.Country, "Specify the country");
            }
        }
    }
}

// Terms validation
public class TermsValidator : IContractSectionValidator
{
    private readonly HashSet<string> _essentialFinancialTerms = new()
    {
        "totalAmount", "currency", "paymentSchedule"
    };

    private readonly HashSet<string> _essentialLegalTerms = new()
    {
        "governingLaw", "jurisdiction"
    };

    public ValidationResult Validate(Contract contract)
    {
        var result = new ValidationResult();
        var terms = contract.Terms;

        // Critical validations
        if (terms.Count == 0)
        {
            result.AddInsight(InsightSeverity.Critical, InsightSection.Terms, "NO_TERMS",
                "Contract must have terms and conditions", "Terms define the contract obligations",
                "Terms", terms.Count, "Add contract terms and conditions");
            return result;
        }

        // Check for required terms
        var requiredTermsMissing = terms.Where(t => t.Required && (t.Value == null || 
            (t.Value is string str && string.IsNullOrWhiteSpace(str)))).ToList();

        foreach (var term in requiredTermsMissing)
        {
            result.AddInsight(InsightSeverity.Critical, InsightSection.Terms, "REQUIRED_TERM_MISSING",
                $"Required term '{term.Label}' is missing or empty", "Required terms must have values",
                $"Terms[{term.Id}].Value", term.Value, $"Provide a value for {term.Label}");
        }

        // Validate financial terms
        ValidateFinancialTerms(result, terms);

        // Validate legal terms
        ValidateLegalTerms(result, terms);

        // Validate individual terms
        for (int i = 0; i < terms.Count; i++)
        {
            ValidateIndividualTerm(result, terms[i], i);
        }

        return result;
    }

    private void ValidateFinancialTerms(ValidationResult result, List<ContractTerm> terms)
    {
        var financialTerms = terms.Where(t => t.Category?.ToLower() == "financial").ToList();
        
        if (financialTerms.Count == 0)
        {
            result.AddInsight(InsightSeverity.Warning, InsightSection.Terms, "NO_FINANCIAL_TERMS",
                "No financial terms specified", "Financial terms clarify monetary obligations",
                "Terms.Financial", 0, "Add financial terms such as amount, currency, payment schedule");
            return;
        }

        var financialTermTypes = financialTerms.Select(t => t.Type?.ToLower()).ToHashSet();

        foreach (var essentialTerm in _essentialFinancialTerms)
        {
            if (!financialTermTypes.Contains(essentialTerm))
            {
                result.AddInsight(InsightSeverity.Warning, InsightSection.Terms, "MISSING_ESSENTIAL_FINANCIAL_TERM",
                    $"Essential financial term '{essentialTerm}' is missing", "Key financial terms should be specified",
                    $"Terms.Financial.{essentialTerm}", null, $"Add {essentialTerm} term");
            }
        }

        // Validate monetary amounts
        var amountTerms = financialTerms.Where(t => t.DataType?.ToLower() == "number" && t.Value != null).ToList();
        foreach (var term in amountTerms)
        {
            if (term.Value is double amount && amount <= 0)
            {
                result.AddInsight(InsightSeverity.Warning, InsightSection.Terms, "INVALID_AMOUNT",
                    $"Financial term '{term.Label}' has non-positive amount", "Monetary amounts should be positive",
                    $"Terms[{term.Id}].Value", term.Value, "Ensure amount is greater than zero");
            }
        }
    }

    private void ValidateLegalTerms(ValidationResult result, List<ContractTerm> terms)
    {
        var legalTerms = terms.Where(t => t.Category?.ToLower() == "legal").ToList();
        
        if (legalTerms.Count == 0)
        {
            result.AddInsight(InsightSeverity.Warning, InsightSection.Terms, "NO_LEGAL_TERMS",
                "No legal terms specified", "Legal terms provide important protections",
                "Terms.Legal", 0, "Add legal terms such as governing law, jurisdiction, dispute resolution");
            return;
        }

        var legalTermTypes = legalTerms.Select(t => t.Type?.ToLower()).ToHashSet();

        foreach (var essentialTerm in _essentialLegalTerms)
        {
            if (!legalTermTypes.Contains(essentialTerm))
            {
                result.AddInsight(InsightSeverity.Warning, InsightSection.Terms, "MISSING_ESSENTIAL_LEGAL_TERM",
                    $"Essential legal term '{essentialTerm}' is missing", "Key legal terms provide important protections",
                    $"Terms.Legal.{essentialTerm}", null, $"Add {essentialTerm} term");
            }
        }

        // Suggest additional legal protections
        var recommendedLegalTerms = new[] { "terminationClause", "confidentialityClause", "disputeResolution", "forceMatuere" };
        var missingRecommended = recommendedLegalTerms.Where(t => !legalTermTypes.Contains(t)).ToList();
        
        foreach (var term in missingRecommended)
        {
            result.AddInsight(InsightSeverity.Suggestion, InsightSection.Terms, "RECOMMENDED_LEGAL_TERM",
                $"Consider adding '{term}' clause", "Additional legal protections strengthen the contract",
                $"Terms.Legal.{term}", null, $"Add {term} for better legal protection");
        }
    }

    private void ValidateIndividualTerm(ValidationResult result, ContractTerm term, int index)
    {
        if (string.IsNullOrWhiteSpace(term.Label))
        {
            result.AddInsight(InsightSeverity.Warning, InsightSection.Terms, "TERM_NO_LABEL",
                $"Term at index {index} has no label", "Terms should have descriptive labels",
                $"Terms[{index}].Label", term.Label, "Add a descriptive label for the term");
        }

        if (string.IsNullOrWhiteSpace(term.Type))
        {
            result.AddInsight(InsightSeverity.Suggestion, InsightSection.Terms, "TERM_NO_TYPE",
                $"Term '{term.Label}' has no type", "Term types help categorize contract elements",
                $"Terms[{term.Id}].Type", term.Type, "Specify the term type");
        }

        if (string.IsNullOrWhiteSpace(term.Category))
        {
            result.AddInsight(InsightSeverity.Suggestion, InsightSection.Terms, "TERM_NO_CATEGORY",
                $"Term '{term.Label}' has no category", "Categories help organize contract terms",
                $"Terms[{term.Id}].Category", term.Category, "Assign a category (financial, legal, obligation, etc.)");
        }
    }
}

// Signatures validation
public class SignaturesValidator : IContractSectionValidator
{
    public ValidationResult Validate(Contract contract)
    {
        var result = new ValidationResult();
        var signatures = contract.Signatures;
        var parties = contract.Parties;

        // Critical validations
        if (signatures.Count == 0)
        {
            result.AddInsight(InsightSeverity.Critical, InsightSection.Signatures, "NO_SIGNATURES",
                "Contract has no signatures", "Signatures are required for contract validity",
                "Signatures", signatures.Count, "Obtain signatures from all parties");
            return result;
        }

        var partyRoles = parties.Select(p => p.Role?.ToLower()).ToHashSet();
        var signedParties = signatures.Select(s => s.Party?.ToLower()).ToHashSet();

        // Check if all parties have signed
        var unsignedParties = partyRoles.Where(role => !signedParties.Contains(role)).ToList();
        foreach (var party in unsignedParties)
        {
            result.AddInsight(InsightSeverity.Critical, InsightSection.Signatures, "PARTY_NOT_SIGNED",
                $"Party with role '{party}' has not signed the contract", "All parties must sign for contract validity",
                "Signatures", null, $"Obtain signature from party with role '{party}'");
        }

        // Check for signatures from unknown parties
        var unknownSignatures = signedParties.Where(party => !partyRoles.Contains(party)).ToList();
        foreach (var party in unknownSignatures)
        {
            result.AddInsight(InsightSeverity.Warning, InsightSection.Signatures, "UNKNOWN_SIGNER",
                $"Signature from unknown party '{party}'", "Only contract parties should sign",
                "Signatures", null, $"Verify that '{party}' is an authorized party");
        }

        // Validate individual signatures
        for (int i = 0; i < signatures.Count; i++)
        {
            ValidateIndividualSignature(result, signatures[i], i, parties);
        }

        return result;
    }

    private void ValidateIndividualSignature(ValidationResult result, Signature signature, int index, List<Party> parties)
    {
        var signaturePrefix = $"Signatures[{index}]";

        // Critical validations
        if (string.IsNullOrWhiteSpace(signature.SignedBy))
        {
            result.AddInsight(InsightSeverity.Critical, InsightSection.Signatures, "NO_SIGNER_NAME",
                "Signature is missing signer name", "Signer name is required for signature validity",
                $"{signaturePrefix}.SignedBy", signature.SignedBy, "Provide the name of the person who signed");
        }

        if (signature.SignedDate == null)
        {
            result.AddInsight(InsightSeverity.Critical, InsightSection.Signatures, "NO_SIGNATURE_DATE",
                "Signature is missing date", "Signature date is required for legal validity",
                $"{signaturePrefix}.SignedDate", signature.SignedDate, "Provide the date when the signature was made");
        }

        // Warning validations
        if (signature.SignedDate != null && signature.SignedDate > DateTime.UtcNow)
        {
            result.AddInsight(InsightSeverity.Warning, InsightSection.Signatures, "FUTURE_SIGNATURE_DATE",
                "Signature date is in the future", "Signature dates should not be in the future",
                $"{signaturePrefix}.SignedDate", signature.SignedDate, "Correct the signature date");
        }

        if (string.IsNullOrWhiteSpace(signature.SignatureType))
        {
            result.AddInsight(InsightSeverity.Warning, InsightSection.Signatures, "NO_SIGNATURE_TYPE",
                "Signature type is not specified", "Signature type clarifies the signing method",
                $"{signaturePrefix}.SignatureType", signature.SignatureType, "Specify signature type (electronic, wet, digital)");
        }

        // Verify signer authority
        if (!string.IsNullOrWhiteSpace(signature.Party) && !string.IsNullOrWhiteSpace(signature.SignedBy))
        {
            var party = parties.FirstOrDefault(p => p.Role?.ToLower() == signature.Party?.ToLower());
            if (party != null && !string.IsNullOrWhiteSpace(party.Representative.Name))
            {
                if (!signature.SignedBy.Equals(party.Representative.Name, StringComparison.OrdinalIgnoreCase))
                {
                    result.AddInsight(InsightSeverity.Warning, InsightSection.Signatures, "UNAUTHORIZED_SIGNER",
                        $"Signer '{signature.SignedBy}' may not be the authorized representative for '{signature.Party}'",
                        $"Expected representative: {party.Representative.Name}",
                        $"{signaturePrefix}.SignedBy", signature.SignedBy,
                        "Verify signer authority or update representative information");
                }
            }
        }
    }
}

// Main contract validator
public class ContractValidator
{
    private readonly List<IContractSectionValidator> _validators;

    public ContractValidator()
    {
        _validators = new List<IContractSectionValidator>
        {
            new ScopeValidator(),
            new PartiesValidator(),
            new TermsValidator(),
            new SignaturesValidator()
        };
    }

    public ValidationResult ValidateContract(Contract contract)
    {
        var result = new ValidationResult();

        if (contract == null)
        {
            result.AddInsight(InsightSeverity.Critical, InsightSection.General, "NULL_CONTRACT",
                "Contract object is null", "Cannot validate a null contract",
                null, null, "Provide a valid contract object");
            return result;
        }

        // Basic contract validations
        if (string.IsNullOrWhiteSpace(contract.ContractId))
        {
            result.AddInsight(InsightSeverity.Warning, InsightSection.General, "NO_CONTRACT_ID",
                "Contract ID is missing", "Contract ID helps with tracking and reference",
                "ContractId", contract.ContractId, "Assign a unique contract identifier");
        }

        // Run all section validators
        foreach (var validator in _validators)
        {
            var sectionResult = validator.Validate(contract);
            result.Insights.AddRange(sectionResult.Insights);
        }

        return result;
    }

    public ValidationResult ValidateContract(Contract contract, params Type[] validatorTypes)
    {
        var result = new ValidationResult();

        if (contract == null)
        {
            result.AddInsight(InsightSeverity.Critical, InsightSection.General, "NULL_CONTRACT",
                "Contract object is null", "Cannot validate a null contract",
                null, null, "Provide a valid contract object");
            return result;
        }

        // Run only specified validators
        foreach (var validatorType in validatorTypes)
        {
            if (typeof(IContractSectionValidator).IsAssignableFrom(validatorType))
            {
                var validator = (IContractSectionValidator?)Activator.CreateInstance(validatorType);
                if (validator != null)
                {
                    var sectionResult = validator.Validate(contract);
                    result.Insights.AddRange(sectionResult.Insights);
                }
            }
        }

        return result;
    }

    public ValidationResult GetInsightsBySection(Contract contract, InsightSection section)
    {
        var fullResult = ValidateContract(contract);
        var filteredResult = new ValidationResult();
        filteredResult.Insights.AddRange(fullResult.Insights.Where(i => i.Section == section));
        return filteredResult;
    }

    public ValidationResult GetInsightsBySeverity(Contract contract, InsightSeverity severity)
    {
        var fullResult = ValidateContract(contract);
        var filteredResult = new ValidationResult();
        filteredResult.Insights.AddRange(fullResult.Insights.Where(i => i.Severity == severity));
        return filteredResult;
    }
}




