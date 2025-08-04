using Repositories;
using XiansAi.Flow;
using System.Text.RegularExpressions;
using System.Linq;
using XiansAi.Flow.Router;
using XiansAi.Logging;
using XiansAi.Messaging;

public class ChatInterceptor : IChatInterceptor
{

    private readonly Logger<ChatInterceptor> _logger = Logger<ChatInterceptor>.For();

    private readonly TermRepository _termRepository = new TermRepository();
    private readonly PersonRepository _personRepository = new PersonRepository();

    public Task<MessageThread> InterceptIncomingMessageAsync(MessageThread messageThread)
    {
        return Task.FromResult(messageThread);
    }

    public Task<string?> InterceptOutgoingMessageAsync(MessageThread messageThread, string? response)
    {
        // Direct fire-and-forget - more efficient for I/O operations
        _ = SendUICommand(messageThread, response);
        return Task.FromResult(response);
    }

    private async Task SendUICommand(MessageThread messageThread, string? response)
    {
        var routerHub = new SemanticRouterHub();
        // Extract only the last couple of sentences from the assistant response – these usually
        // contain the actual call-to-action (CTA) directed at the user. This avoids diluting
        // the intent classification with lots of explanatory text that precedes the CTA.
        var messageSnippet = response ?? string.Empty;
        if (!string.IsNullOrWhiteSpace(messageSnippet))
        {
            var sentences = Regex.Split(messageSnippet.Trim(), @"(?<=[\.!\?:])\s+");
            // Take the last two sentences (or fewer if not available)
            var lastSentences = sentences.Reverse().Take(2).Reverse();
            messageSnippet = string.Join(" ", lastSentences);
        }

        string prompt = @"Analyze the following assistant message and determine if it contains a direct request or suggestion to the user to enter, set, or change exactly one of these contract properties:
        - Title
        - Effective Date
        - Parties
        - Contract Terms

        Consider it a direct request when the message:
        1. Asks a question that expects user action on a specific property
        2. Gives a clear instruction that expects immediate user input
        3. Asks for specific details or information related to a property
        4. Requests information needed to add, create, or modify a property

        Use semantic understanding to map the message intent to the most appropriate property:
        - Title: Contract names, headings, document titles
        - Effective Date: Start dates, commencement, when agreements begin
        - Parties: People, organizations, signatories, contracting entities
        - Contract Terms: Any contractual provisions, clauses, conditions, legal language, terms and conditions, obligations, rights, restrictions, or regulatory requirements

        If the message contains general validation information without an explicit follow-up suggestion/instruction/request for user action on a specific property, treat that as **no direct request** and return null.

        Return exactly the property name (one of the above) if and only if there is a direct request. Otherwise, return null. Do not return any additional text.

        Message: " + messageSnippet;

        try
        {
            var propertyName = await routerHub.ChatCompletionAsync(prompt);
            _logger.LogInformation($"Property identified: `{propertyName}` for `{messageSnippet}`");

            switch (propertyName)
            {
                case "Effective Date":
                    await messageThread.SendData(
                        new UICommand(
                            "Calendar",
                            new Dictionary<string, object> { { "field", propertyName } }
                            )
                        );
                    break;
                case "Parties":
                    await messageThread.SendData(
                        new UICommand(
                            "ContractParty",
                            new Dictionary<string, object> { { "command", "Add" }, { "Acquaintances", _personRepository.GetAcquaintancesAsync(messageThread.ParticipantId) } }
                            )
                        );
                    break;
                case "Contract Terms":
                    await messageThread.SendData(
                        new UICommand(
                            "ContractTerms",
                            new Dictionary<string, object> { { "terms", _termRepository.GetPotentialTerms() } }
                            )
                        );
                    break;
            }

        }
        catch (Exception ex)
        {
            // Log error - don't let background task crash silently
            Console.WriteLine($"Error in background property analysis: {ex.Message}");
        }
    }
}