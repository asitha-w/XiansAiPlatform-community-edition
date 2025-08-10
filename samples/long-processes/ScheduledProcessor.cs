using Temporalio.Activities;
using Temporalio.Workflows;

public class ScheduledProcessor
{

    private UserRequestFlow _userRequestFlow;

    public ScheduledProcessor(UserRequestFlow userRequestFlow)
    {
        Console.WriteLine($"ScheduledProcessor constructor with UserRequestFlow: {userRequestFlow}");
        _userRequestFlow = userRequestFlow;
    }


    [IntervalSchedule(seconds: 10)]
    public void RunEvery10Seconds()
    {
        int count = _userRequestFlow.IncrementCount();

        Workflow.ExecuteActivityAsync(
            (Activities a) => a.WriteToFile($"Hello, world {count}"),
            new() { StartToCloseTimeout = TimeSpan.FromMinutes(5) });

        Console.WriteLine($"Processing 10-second interval data. In workflow: {Workflow.InWorkflow}");
    }
}



public class Activities
{
    [Activity]
    public void WriteToFile(string message)
    {
        Console.WriteLine(message);
        File.WriteAllText("user-request.txt", message);
    }
}