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

public class ShowLink : IDataMessage<Link> {

    public string MessageSubject => typeof(ShowLink).Name;
    public Link Data { get; set; }

    public ShowLink(string title, string url)
    {
        Data = new Link { Title = title, Url = url };
    }
}

public class Link {
    public required string Title { get; set; }
    public required string Url { get; set; }
}

