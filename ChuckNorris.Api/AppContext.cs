using ChuckNorris.Api.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace ChuckNorris.Api
{
    public class AppContext : DbContext
    {
        public AppContext(DbContextOptions options) : base(options) { }

        public DbSet<Fact> Facts { get; set; }
        public DbSet<Submission> Submissions { get; set; }

        public void EnsureSeedForContext()
        {
            Facts.RemoveRange(Facts);
            Submissions.RemoveRange(Submissions);
            SaveChanges();

            Database.ExecuteSqlCommand("DBCC CHECKIDENT('Facts', RESEED, 0)");
            Database.ExecuteSqlCommand("DBCC CHECKIDENT('Submissions', RESEED, 0)");

            var facts = new List<Fact>
            {
                new Fact{Description = "Chuck Norris mined all bitcoins...twice"},
                new Fact{Description = "The Great Wall of China was originally created to keep Chuck Norris out. It failed miserably."},
                new Fact{Description = "Chuck Norris beat the sun in a staring contest"},
                new Fact{Description = "Chuck Norris narrates Morgan Freeman's life"},
                new Fact{Description = "When chuck Norris does division, there are no remainders"},
                new Fact{Description = "There are two types of people in the world... people that suck, and Chuck Norris"},
                new Fact{Description = "If at first you don't succeed, you're not Chuck Norris."}
            };

            Facts.AddRange(facts);
            SaveChanges();
        }
    }
}