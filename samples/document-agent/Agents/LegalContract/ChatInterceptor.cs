using XiansAi.Flow;
using XiansAi.Messaging;

namespace Agents.LegalContract;

public class ChatInterceptor : IChatInterceptor
{

    public Task<MessageThread> InterceptIncomingMessageAsync(MessageThread messageThread)
    {
        return Task.FromResult(messageThread);
    }

    public Task<string> InterceptOutgoingMessageAsync(MessageThread messageThread, string? response)
    {
        response = response ?? string.Empty;
        return Task.FromResult(response);
    }
}