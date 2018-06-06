using System;
using System.ComponentModel.DataAnnotations;

namespace ChuckNorris.Api.Entities
{
    public class Subscription
    {
        [Key]
        public string UserName { get; set; }
        public string Endpoint { get; set; }
        public DateTime? ExpirationTime { get; set; }
        public string p256dh { get; set; }
        public string auth { get; set; }
    }
}
