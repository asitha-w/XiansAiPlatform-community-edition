using Temporalio.Workflows;
using XiansAi.Flow;

namespace Agents.LegalContract;

[Workflow("Legal Contract Agent:Legal Contract Bot")]
public class LegalContractBot : FlowBase
{
    public LegalContractBot(){
        SystemPromptName = "Legal Contract Bot";
        RouterOptions = new XiansAi.Flow.Router.RouterOptions {
            ModelName = "o3-mini"
        };
    }

    [WorkflowRun]
    public async Task Run()
    {
        await InitConversation();
    }
}