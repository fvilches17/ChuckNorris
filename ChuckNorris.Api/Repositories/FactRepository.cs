using ChuckNorris.Api.Entities;
using System;
using System.Collections.Generic;
using System.Linq;

namespace ChuckNorris.Api.Repositories
{
    public class FactRepository : IFactRepository
    {
        private readonly AppContext _context;

        public FactRepository(AppContext context)
        {
            _context = context;
        }

        public IEnumerable<Fact> GetAll()
        {
            return _context.Facts.ToList();
        }

        public Fact GetById(int id)
        {
            return _context.Facts.FirstOrDefault(f => f.Id == id);
        }

        public void Add(string description)
        {
            var newFact = _context.Add(new Fact { Description = description });
        }

        public void Remove(Fact fact)
        {
            _context.Facts.Remove(fact);
        }

        public bool Exists(int id)
        {
            return _context.Facts.Any(f => f.Id == id);
        }

        public bool Complete()
        {
            return _context.SaveChanges() >= 0;
        }
    }
}
