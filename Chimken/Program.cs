using System;

namespace Chimken
{
    class Program
    {
        static void Main(string[] args)
        {
            var chimken = new Bot();
            chimken.RunAsync().GetAwaiter().GetResult();
        }
    }
}
