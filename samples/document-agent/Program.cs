using DotNetEnv;
using XiansAi.Flow;
using Agents.LegalContract;

// Load the environment variables from the .env file
Env.Load();
Console.WriteLine("Starting Legal Contract Agent...\n");

var agent = new Agent("Legal Contract Agent");

var bot = agent.AddBot<LegalContractBot>();
bot.AddCapabilities(typeof(ContractCapabilities));

await agent.RunAsync();