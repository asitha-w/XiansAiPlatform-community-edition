using System.Collections.Concurrent;
using Agents.Utils;
using Microsoft.Extensions.Logging;
using Temporalio.Workflows;
using XiansAi.Flow;
using XiansAi.Messaging;

namespace Agents.LegalContract;

[Workflow("Legal Contract Agent:Legal Contract Flow")]
public class LegalContractFlow : FlowBase
{
    private readonly ConcurrentQueue<MessageThread> _messageQueue = new();
    private readonly ILogger _logger = Workflow.Logger;

    public LegalContractFlow()
    {
        _messageHub.SubscribeDataHandler(_messageQueue.Enqueue);
    }

    [WorkflowRun]
    public async Task Run()
    {
        while (true)
        {
            try
            {
                var messageThread = await DequeueMessage();
                if (messageThread == null) continue;

                var messageType = messageThread.LatestMessage.Content;
                _logger.LogInformation("Message type: " + messageType + ". Checking for: " + nameof(DocumentRequest));

                switch (messageType)
                {
                    case nameof(DocumentRequest):
                        _logger.LogInformation("Handling document request");
                        await Workflow.ExecuteActivityAsync(
                            (IFlowActivities a) => a.Handle(messageThread),
                            new() { StartToCloseTimeout = TimeSpan.FromMinutes(5) });
                        break;
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in LegalContractFlow");
            }
        }
    }

    private async Task<MessageThread?> DequeueMessage()
    {
        _logger.LogInformation("Waiting for message...");
        await Workflow.WaitConditionAsync(() => _messageQueue.Count > 0);
        _logger.LogInformation("Message received");
        return _messageQueue.TryDequeue(out var thread) ? thread : null;
    }
}
