using System.Collections.Generic;
using ChuckNorris.Api.Entities;

namespace ChuckNorris.Api.Repositories
{
    public interface ISubscriptionsRepository
    {
        IEnumerable<Subscription> GetAll();
        Subscription GetByUserName(string userName);
        void Add(Subscription subscription);
        void Remove(string userName);
        bool Complete();
    }
}
