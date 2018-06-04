using ChuckNorris.Api.Entities;
using System.Collections.Generic;

namespace ChuckNorris.Api.Repositories
{
    public interface IFactRepository
    {
        IEnumerable<Fact> GetAll();
        Fact GetById(int id);
        void Add(Fact fact);
        void Remove(Fact fact);
        bool Exists(int id);
        bool Complete();
    }
}
