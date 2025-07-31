
public interface IDataMessage
{
    string MessageSubject { get; } 
}

public interface IDataMessage<T> : IDataMessage
{
    T Data { get; }
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

public class UIComponent : IDataMessage<ComponentDef> {

    public string MessageSubject => typeof(UIComponent).Name;
    public ComponentDef Data { get; set; }

    public UIComponent(string componentName, IDictionary<string, object> properties)
    {
        Data = new ComponentDef(componentName, properties);
    }
}

public class ComponentDef {
    public string Name { get; set; }
    public IDictionary<string, object> Properties { get; set; }

    public ComponentDef(string name, IDictionary<string, object> properties)
    {
        Name = name;
        Properties = properties;
    }
}

