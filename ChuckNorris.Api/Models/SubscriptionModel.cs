using System;

namespace ChuckNorris.Api.Models
{
    public class SubscriptionModel
    {
        public string Endpoint { get; set; }
        public DateTime? ExpirationTime { get; set; }
        public KeyModel Keys { get; set; }
    }
}
