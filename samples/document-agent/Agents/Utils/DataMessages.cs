using LegalContract.Services;
using System.Text.Json.Serialization;

public interface IDataMessage
{
    string MessageSubject { get; } 
}

public interface IDataMessage<T> : IDataMessage
{
    T Data { get; }
}

public class NewContractCreated : IDataMessage<Contract>
{
    public string MessageSubject => typeof(NewContractCreated).Name;
    public Contract Data { get; set; }

    public NewContractCreated(Contract contract)
    {
        Data = contract;
    }
}

public class WorkLog : IDataMessage<string>
{
    public string MessageSubject => typeof(WorkLog).Name;
    public string Data { get; set; }

    public WorkLog(string workLog)
    {
        Data = workLog;
    }
}

public class ShowContract : IDataMessage<Guid> {

    public string MessageSubject => typeof(ShowContract).Name;
    public Guid Data { get; set; }

    public ShowContract(Guid contractId)
    {
        Data = contractId;
    }
}

public class Link {
    public required string Title { get; set; }
    public required string Url { get; set; }
}

