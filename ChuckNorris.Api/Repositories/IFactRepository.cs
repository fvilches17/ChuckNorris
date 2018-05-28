using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ChuckNorris.Api.Entities;

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
