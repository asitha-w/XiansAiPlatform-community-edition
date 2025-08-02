using XiansAi.Flow;
using XiansAi.Messaging;

namespace Agents.LegalContract;

public class ChatInterceptor : IChatInterceptor
{

    public Task<MessageThread> InterceptIncomingMessageAsync(MessageThread messageThread)
    {
        Console.WriteLine("&&&&&&&&&&&&&& messageThread: " + messageThread.LatestMessage.Content);
        return Task.FromResult(messageThread);
    }

    public Task<string> InterceptOutgoingMessageAsync(MessageThread messageThread, string? response)
    {
        response = response ?? string.Empty;

        // if (true || response.Contains("effective date"))
        // {
        //     _ = messageThread.SendData(new UICommand("ContractParty", new Dictionary<string, object> { { "command", "Add" } }));
        //     _ = messageThread.SendData(new UICommand("Calendar", new Dictionary<string, object> { { "field", "effective date" } }));
        //     _ = messageThread.SendData(new UICommand("TermsConditions", new Dictionary<string, object> { }));
        // }
        return Task.FromResult(response);
    }
}