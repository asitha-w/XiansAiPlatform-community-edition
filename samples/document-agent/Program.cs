using DotNetEnv;
using XiansAi.Flow;
using Agents.LegalContract;

// Load the environment variables from the .env file
Env.Load();
Console.WriteLine("Starting Legal Contract Agent...\n");

var agent = new Agent("Legal Contract Agent");

var bot = agent.AddBot<LegalContractBot>();
bot.AddCapabilities(typeof(GeneralCapabilities));
bot.AddCapabilities(typeof(PersonCapabilities));
bot.AddCapabilities(typeof(PartyCapabilities));
bot.AddCapabilities(typeof(TermCapabilities));
bot.SetChatInterceptor(new ChatInterceptor());

await agent.RunAsync();