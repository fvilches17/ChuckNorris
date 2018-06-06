using System.Collections.Generic;
using ChuckNorris.Api.Entities;
using System.Linq;

namespace ChuckNorris.Api.Repositories
{
    public class SubscriptionsRepository: ISubscriptionsRepository
    {
        private readonly AppContext _context;

        public SubscriptionsRepository(AppContext context)
        {
            _context = context;
        }

        public Subscription GetByUserName(string userName)
        {
            return _context.Subscriptions.FirstOrDefault(s => s.UserName == userName);
        }

        public IEnumerable<Subscription> GetAll()
        {
            return _context.Subscriptions.ToList();
        }

        public void Add(Subscription subscription)
        {
            var subscriptionOnDb = _context.Subscriptions.FirstOrDefault(s => s.UserName == subscription.UserName);
            if (subscriptionOnDb == null)
            {
                _context.Subscriptions.Add(subscription);
            }
            else
            {
                //Update
                subscriptionOnDb.Endpoint = subscription.Endpoint;
                subscriptionOnDb.ExpirationTime = subscription.ExpirationTime;
                subscriptionOnDb.auth = subscription.auth;
                subscriptionOnDb.p256dh = subscription.p256dh;
            }
        }

        public void Remove(string userName)
        {
            var subscriptionToRemove = _context.Subscriptions.First(s => s.UserName == userName);
            _context.Subscriptions.Remove(subscriptionToRemove);
        }

        public bool Complete()
        {
            return _context.SaveChanges() >= 0;
        }
    }
}
