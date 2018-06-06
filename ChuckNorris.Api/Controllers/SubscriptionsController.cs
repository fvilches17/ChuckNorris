using System;
using ChuckNorris.Api.Entities;
using ChuckNorris.Api.Models;
using ChuckNorris.Api.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NSwag.Annotations;

namespace ChuckNorris.Api.Controllers
{
    [Route("api/subscriptions")]
    public class SubscriptionsController : Controller
    {
        private readonly ISubscriptionsRepository _subscriptionsRepository;

        public SubscriptionsController(ISubscriptionsRepository subscriptionsRepository)
        {
            _subscriptionsRepository = subscriptionsRepository;
        }

        [HttpGet("{userName}", Name = nameof(GetSubscriptionByUserName))]
        [SwaggerResponse(StatusCodes.Status200OK, typeof(Subscription))]
        [SwaggerResponse(StatusCodes.Status404NotFound, typeof(string), Description = "When a subscription is not found by the passed username")]
        public IActionResult GetSubscriptionByUserName(string userName)
        {
            var subscription = _subscriptionsRepository.GetByUserName(userName);
            if (subscription == null)
            {
                return NotFound("Subscription with user name " + userName + "not found");
            }

            return Ok(subscription);
        }

        [HttpPost(Name = nameof(AddSubscription))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, typeof(void))]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, typeof(string), Description = "Not your fault")]
        [SwaggerResponse(StatusCodes.Status201Created, typeof(Subscription), Description = "Representation of the newly created fact")]
        public IActionResult AddSubscription([FromBody]SubscriptionAddModel subscription)
        {
            if (subscription == null)
            {
                return BadRequest();
            }

            var subscriptionToAdd = new Subscription
            {
                UserName = subscription.UserName,
                Endpoint = subscription.Subscription.Endpoint,
                ExpirationTime = subscription.Subscription.ExpirationTime,
                auth = subscription.Subscription.Keys.auth,
                p256dh = subscription.Subscription.Keys.p256dh
            };

            _subscriptionsRepository.Add(subscriptionToAdd);
            if (!_subscriptionsRepository.Complete())
            {
                throw new Exception("Creating subscription failed on save");
            }

            return CreatedAtRoute(routeName: nameof(GetSubscriptionByUserName), routeValues: new { subscriptionToAdd.UserName }, value: subscriptionToAdd);
        }


        [HttpDelete("{userName}", Name = nameof(RemoveSubscription))]
        [SwaggerResponse(StatusCodes.Status404NotFound, typeof(string), Description = "Fact Id not found")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, typeof(string), Description = "Not your fault")]
        [SwaggerResponse(StatusCodes.Status204NoContent, typeof(void))]
        public IActionResult RemoveSubscription(string userName)
        {
            if (_subscriptionsRepository.GetByUserName(userName) == null)
            {
                return NotFound($"Subscription with username '{userName}' not found");
            }

            _subscriptionsRepository.Remove(userName);

            if (!_subscriptionsRepository.Complete())
            {
                throw new Exception("Removing subscrition failed on save");
            }

            return NoContent();
        }
    }
}
