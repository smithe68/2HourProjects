using System.Threading.Tasks;
using DSharpPlus.EventArgs;
using DSharpPlus.CommandsNext;
using DSharpPlus;
using System.IO;
using System.Text;
using Newtonsoft.Json;
using Chimken.Commands;

namespace Chimken
{
    public class Bot
    {
        public DiscordClient Client { get; private set; }
        public CommandsNextModule Commands { get; private set; }
        
        public async Task RunAsync()
        {
            var json = string.Empty;

            using (var fs = File.OpenRead("config.json"))
                using (var sr = new StreamReader(fs, new UTF8Encoding(false)))
                    json = await sr.ReadToEndAsync().ConfigureAwait(false);

            var configJson = JsonConvert.DeserializeObject<ConfigJason>(json);

            var config = new DiscordConfiguration
            {
                Token = configJson.Token,
                TokenType = TokenType.Bot,
                AutoReconnect = true,
                LogLevel = LogLevel.Debug,
                UseInternalLogHandler = true
            };

            Client = new DiscordClient(config);
            Client.Ready += OnClientReady;

            var commandsConfig = new CommandsNextConfiguration
            {
                StringPrefix = configJson.Prefix,
                EnableDms = false,
                EnableMentionPrefix = true
            };

            Commands = Client.UseCommandsNext(commandsConfig);
            Commands.RegisterCommands<UtilityCommands>();

            await Client.ConnectAsync();
            await Task.Delay(-1);
        }

        private Task OnClientReady(ReadyEventArgs e)
        {
            return Task.CompletedTask;
        }
    }
}