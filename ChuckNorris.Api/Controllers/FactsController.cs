using ChuckNorris.Api.Entities;
using ChuckNorris.Api.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NSwag.Annotations;
using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;
using WebPush;

namespace ChuckNorris.Api.Controllers
{
    [Route("api/facts")]
    [Produces("application/json")]
    public class FactsController : Controller
    {
        private readonly IFactRepository _factRepo;
        private readonly ISubscriptionsRepository _subscriptionsRepository;

        public FactsController(IFactRepository factRepo, ISubscriptionsRepository subscriptionsRepository)
        {
            _factRepo = factRepo;
            _subscriptionsRepository = subscriptionsRepository;
        }

        /// <summary>
        /// Gets a list of all Chuck Norris facts
        /// </summary>
        [HttpGet(Name = nameof(GetAllFacts))]
        [SwaggerResponse(StatusCodes.Status200OK, typeof(IEnumerable<Fact>))]
        public IActionResult GetAllFacts()
        {
            return Ok(_factRepo.GetAll());
        }

        /// <summary>
        /// Gets a Chuck Norris fact by Id
        /// </summary>
        /// <param name="id"></param>
        [HttpGet("{id}", Name = nameof(GetFactById))]
        [SwaggerResponse(StatusCodes.Status200OK, typeof(Fact))]
        [SwaggerResponse(StatusCodes.Status404NotFound, typeof(string), Description = "When a fact is not found by the passed Id")]
        public IActionResult GetFactById(int id)
        {
            var entityObject = _factRepo.GetById(id);
            if (entityObject == null)
            {
                return NotFound($"Fact with id '{id}' not found");
            }

            return Ok(entityObject);
        }

        /// <summary>
        /// Adds a Chuck Norris fact
        /// </summary>
        /// <param name="description"></param>
        [HttpPost(Name = nameof(AddFact))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, typeof(void))]
        [SwaggerResponse(StatusCodes.Status422UnprocessableEntity, typeof(string), Description = "When description length is greater than allowed")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, typeof(string), Description = "Not your fault")]
        [SwaggerResponse(StatusCodes.Status201Created, typeof(Fact), Description = "Representation of the newly created fact")]
        public IActionResult AddFact([FromBody]string description)
        {
            if (string.IsNullOrWhiteSpace(description))
            {
                return BadRequest();
            }

            if (description.Length > Fact.DescriptionMaxLength)
            {
                ModelState.AddModelError("Description", $"Max length is {Fact.DescriptionMaxLength}");
                return new ObjectResult(StatusCodes.Status422UnprocessableEntity);
            }

            var newFact = new Fact {Description = description};
            _factRepo.Add(newFact);

            if (!_factRepo.Complete())
            {
                throw new Exception("Creating fact failed on save");
            }

            NotifyUsersOfNewFact(factId: newFact.Id, factDescription: description); //TODO-FV: make this call ASYNC

            return CreatedAtRoute(routeName: nameof(GetFactById), routeValues: new { newFact.Id }, value: newFact);
        }

        /// <summary>
        /// Removes a Chuck Norris fact
        /// </summary>
        /// <param name="id"></param>
        [HttpDelete(Name = nameof(RemoveFact))]
        [SwaggerResponse(StatusCodes.Status404NotFound, typeof(string), Description = "Fact Id not found")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, typeof(string), Description = "Not your fault")]
        [SwaggerResponse(StatusCodes.Status204NoContent, typeof(void))]
        public IActionResult RemoveFact(int id)
        {
            if (!_factRepo.Exists(id))
            {
                return NotFound($"Fact with id '{id}' not found");
            }

            var factToRemove = _factRepo.GetById(id);

            _factRepo.Remove(factToRemove);

            if (!_factRepo.Complete())
            {
                throw new Exception("Removing fact failed on save");
            }

            return NoContent();
        }


        private void NotifyUsersOfNewFact(int factId, string factDescription)
        {
            var vapidDetails = new VapidDetails(
                subject: @"mailto:franciscov@datacom.co.nz",
                publicKey: "BMvHf5RXbsME4s8p2iGh_rfazldy2PbaSvo1l-REog7e-PKBmtDPsSBA5ykmTVSH6F9D0JIsDL9dwReNwqewBDg",
                privateKey: "Z5SLGu-OlHvpH-C2D8uL3WnklEotnhWZVEsmYOo8jZQ");

            var subscriptions = _subscriptionsRepository.GetAll();
            var payload = JsonConvert.SerializeObject(new
            {
                factid = factId,
                newfact = factDescription
            });

            var webPushClient = new WebPushClient();
            foreach (var subscription in subscriptions.Select(s => new PushSubscription(s.Endpoint, s.p256dh, s.auth)))
            {
                try
                {
                    webPushClient.SendNotification(subscription, payload, vapidDetails);
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex);
                }
            }
        }
    }
}
