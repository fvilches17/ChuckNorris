using ChuckNorris.Api.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace ChuckNorris.Api
{
    public class AppContext : DbContext
    {
        public AppContext(DbContextOptions options) : base(options) { }

        public DbSet<Fact> Facts { get; set; }

        public void EnsureSeedForContext()
        {
            Facts.RemoveRange(Facts);
            SaveChanges();

            Database.ExecuteSqlCommand("DBCC CHECKIDENT('Facts', RESEED, 0)");

            var facts = new List<Fact>
            {
                new Fact{Description = "Chuck Norris mined all bitcoins...twice"},
                new Fact{Description = "Chuck Norris beat the sun in a staring contest"},
                new Fact{Description = "Chuck Norris narrates Morgan Freeman's life"}
            };

            Facts.AddRange(facts);
            SaveChanges();
        }
    }
}