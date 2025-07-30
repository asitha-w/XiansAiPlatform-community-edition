
namespace LegalContract.Services;

// Model classes for Contract structure
public class Contract
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ContractId { get; set; } = string.Empty;
    public string Status { get; set; } = "draft";
    public ContractScope Scope { get; set; } = new();
    public List<Party> Parties { get; set; } = new();
    public List<ContractTerm> Terms { get; set; } = new();
    public List<Signature> Signatures { get; set; } = new();
}

public class Party
{
    public string Role { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Address Address { get; set; } = new();
    public Contact Contact { get; set; } = new();
    public Representative Representative { get; set; } = new();
}

public class Address
{
    public string Street { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string State { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
}

public class Contact
{
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
}

public class Representative
{
    public string Name { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
}

public class ContractScope
{
    public string Title { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? EffectiveDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public string ScopeOfWork { get; set; } = string.Empty;
    public List<string> Deliverables { get; set; } = new();
    public string Duration { get; set; } = string.Empty;
    public string RenewalTerms { get; set; } = string.Empty;
}

public class ContractTerm
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // financial, obligation, legal, general
    public string Label { get; set; } = string.Empty;
    public object? Value { get; set; }
    public string DataType { get; set; } = string.Empty;
    public bool Required { get; set; }
}

public class Signature
{
    public string Party { get; set; } = string.Empty;
    public string SignedBy { get; set; } = string.Empty;
    public DateTime? SignedDate { get; set; }
    public string SignatureType { get; set; } = string.Empty;
}
