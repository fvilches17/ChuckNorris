using ChuckNorris.Api.Entities;
using ChuckNorris.Api.Models;
using ChuckNorris.Api.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NSwag.Annotations;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Newtonsoft.Json;
using WebPush;

namespace ChuckNorris.Api.Controllers
{
    [Route("api/submissions")]
    [Produces("application/json")]
    public class SubmissionsController : Controller
    {
        private readonly IFactRepository _factRepo;
        private readonly ISubmissionRepository _submissionRepo;
        private readonly ISubscriptionsRepository _subscriptionsRepository;

        public SubmissionsController(IFactRepository factRepo, ISubmissionRepository submissionRepo, ISubscriptionsRepository _subscriptionsRepository)
        {
            _factRepo = factRepo;
            _submissionRepo = submissionRepo;
            this._subscriptionsRepository = _subscriptionsRepository;
        }

        /// <summary>
        /// Gets a list of all Submissions. Possible to filter by only unapproved via query param
        /// </summary>
        [HttpGet(Name = nameof(GetAllSubmissions))]
        [SwaggerResponse(StatusCodes.Status200OK, typeof(IEnumerable<Submission>))]
        public IActionResult GetAllSubmissions([FromQuery] bool onlyUnapprovedSubmissions = false)
        {
            return Ok(_submissionRepo.GetSubmissions(onlyUnapprovedSubmissions));
        }

        /// <summary>
        /// Gets a Chuck Norris fact submission and it's status
        /// </summary>
        /// <param name="id"></param>
        [HttpGet("{id}", Name = nameof(GetSubmissionById))]
        [SwaggerResponse(StatusCodes.Status200OK, typeof(Fact))]
        [SwaggerResponse(StatusCodes.Status404NotFound, typeof(string), Description = "When a submission is not found by the passed Id")]
        public IActionResult GetSubmissionById(int id)
        {
            var entityObject = _submissionRepo.GetById(id);
            if (entityObject == null)
            {
                return NotFound($"Submision with id '{id}' not found");
            }

            return Ok(entityObject);
        }

        /// <summary>
        /// Creates a submission for review and approval
        /// </summary>
        /// <param name="submissionApproval"></param>
        [HttpPost(Name = nameof(AddSubmission))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, typeof(void))]
        [SwaggerResponse(StatusCodes.Status422UnprocessableEntity, typeof(string), Description = "When description length is greater than allowed")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, typeof(string), Description = "Not your fault")]
        [SwaggerResponse(StatusCodes.Status201Created, typeof(Fact), Description = "Representation of the newly created submission")]
        public IActionResult AddSubmission([FromBody] SubmissionApproval submissionApproval)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }

            var newSubmission = new Submission { Approved = false, FactDescription = submissionApproval.Description };
            _submissionRepo.CreateSubmussion(newSubmission);

            if (!_submissionRepo.Complete())
            {
                throw new Exception("Creating submission failed on save");
            }

            return CreatedAtRoute(routeName: nameof(GetSubmissionById), routeValues: new { newSubmission.Id }, value: newSubmission);
        }


        /// <summary>
        /// Approves a specified chuck norris fact submission
        /// </summary>
        /// <param name="id"></param>
        [HttpPut("{id}/approve", Name = nameof(ApproveSubmission))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, typeof(void))]
        [SwaggerResponse(StatusCodes.Status422UnprocessableEntity, typeof(string), Description = "When description length is greater than allowed")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, typeof(string), Description = "Not your fault")]
        [SwaggerResponse(StatusCodes.Status201Created, typeof(Fact), Description = "Representation of the newly created submission")]
        public IActionResult ApproveSubmission(int id)
        {
            var submissionToApprove = _submissionRepo.GetById(id);
            if (submissionToApprove == null)
            {
                return NotFound($"Submission with id '{id}' not found");
            }

            submissionToApprove.Approved = true;
            if (!_submissionRepo.Complete())
            {
                throw new Exception("Approving submission failed on save");
            }

            var newFact = new Fact {Description = submissionToApprove.FactDescription};

            _factRepo.Add(newFact);
            if (!_factRepo.Complete())
            {
                throw new Exception("Creating submission failed on save");
            }

            NotifyUsersOfNewFact(newFact.Id, newFact.Description);

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
