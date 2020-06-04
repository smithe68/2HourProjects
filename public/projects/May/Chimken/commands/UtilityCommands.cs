using DSharpPlus.CommandsNext;
using DSharpPlus.CommandsNext.Attributes;
using DSharpPlus;

using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using DSharpPlus.Entities;
using System.Linq;
using System.Text.RegularExpressions;

namespace Chimken.Commands
{
    public class UtilityCommands : BaseModule
    {
        private Random random = new Random();
        private List<string> Movies { get; set; } = new List<string>();
        
        private async Task<DiscordMessage> Message(CommandContext ctx, string message) {
            return await ctx.Channel.SendMessageAsync(message);
        }

        protected override void Setup(DiscordClient client) {}

        [Command("roll")]
        [Description("Rolls a random number between 0 and your number.")]
        public async Task Roll(CommandContext ctx, int diceSize)
        {
            int result = random.Next(0, diceSize);
            await Message(ctx, $"{result}");
        }

        [Command("coinflip")]
        [Description("Flips a coin.")]
        public async Task Flip(CommandContext ctx) 
        {
            bool flip = random.Next(0, 1) == 1;
            string result = flip ? "Heads" : "Tails";
            await Message(ctx, $"{result}");
        }

        [Command("movies")]
        [Description("Shows the current movie list")]
        public async Task DisplayMovieList(CommandContext ctx)
        {
            if (Movies.Count == 0)
            {
                await Message(ctx, "No movies in the list");
                return;
            }
            
            await Message(ctx, "Current WatchList:");
            StringBuilder builder = new StringBuilder("```\n");

            int index = 0;
            foreach (var m in Movies) 
            {
                builder.Append($"|-{index}: {m}\n");
                index++;
            }

            builder.Append("```");
            await Message(ctx, builder.ToString());
        }
        
        [Command("addmovie")]
        [Description("Adds a movie to the watchlist")]
        public async Task AddMovie(CommandContext ctx, string movie)
        {
            if (Movies.Contains(movie)) {
                await Message(ctx, $"That movies already in my list");
            }
            else
            {
                Movies.Add(movie);
                await Message(ctx, $"Added the movie [{movie}] to the watchlist!");
                await DisplayMovieList(ctx);
            }
        }

        [Command("removemovie")]
        [Description("Removes a movie to the watchlist")]
        public async Task RemoveMovie(CommandContext ctx, string movie)
        {
            if (Movies.Contains(movie))
            {
                Movies.Remove(movie);
                await Message(ctx, $"The movie [{movie}] has been removed!");
                await DisplayMovieList(ctx);
            }
            else {
                await Message(ctx, $"The movie [{movie}] is not current in the list.\n" + 
                    "Why don't you add it?");
            }    
        }

        [Command("clearmovies")]
        [Description("Clears all movies from the watchlist")]
        public async Task ClearMovies(CommandContext ctx)
        {
            Movies.Clear();
            await Message(ctx,"The list has been cleared no movies in list.");
        }
        
        [Command("pickmovie")]
        [Description("Picks a random movie from the watchlist and removes it")]
        public async Task PickMovie(CommandContext ctx)
        {
            int tonightsMovieNumber = random.Next(0, Movies.Count-1);

            await Message(ctx,$"Tonights movie is [{Movies[tonightsMovieNumber]}]");
            Movies.RemoveAt(tonightsMovieNumber);
            
            if (Movies.Count != 0) {
                await DisplayMovieList(ctx);
            }
            else {
                await Message(ctx, "Movie list now empty");
            }
        }

        [Command("shame")]
        [Description("Shames someone.")]
        public async Task Shame(CommandContext ctx)
        {
            int numUsers = ctx.Guild.MemberCount;
            int shameNumber = random.Next(0,numUsers-1);
            var membersIter = ctx.Guild.Members;
            var members = membersIter.ToList();
            await Message(ctx, $"Shame: {members[shameNumber].DisplayName} ");
        }

        [Command("big")]
        [Description("Make word big")]
        public async Task Big(CommandContext ctx, string word)
        {
            StringBuilder builder = new StringBuilder();

            foreach (var ch in word.ToLower()) 
            {
                if (ch != ' ') {
                    builder.Append($":regional_indicator_{ch}: ");
                } else {
                    builder.Append(" ");
                }
            }

            await Message(ctx, builder.ToString());
        }

        [Command("dangerpicture")]
        public async Task DangerPicture(CommandContext ctx)
        {
            int id = random.Next(0, 1000);
            await Message(ctx, $"https://picsum.photos/id/{id}/1920/1080");
        }
    }
}