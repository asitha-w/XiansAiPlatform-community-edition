using LegalContract.Services;

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
