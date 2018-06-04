using ChuckNorris.Api.Entities;
using ChuckNorris.Api.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NSwag.Annotations;
using System;
using System.Collections.Generic;

namespace ChuckNorris.Api.Controllers
{
    [Route("api/submissions")]
    [Produces("application/json")]
    public class SubmissionsController : Controller
    {
        private readonly IFactRepository _factRepo;
        private readonly ISubmissionRepository _submissionRepo;

        public SubmissionsController(IFactRepository factRepo, ISubmissionRepository submissionRepo)
        {
            _factRepo = factRepo;
            _submissionRepo = submissionRepo;
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
        /// <param name="description"></param>
        [HttpPost(Name = nameof(AddSubmission))]
        [SwaggerResponse(StatusCodes.Status400BadRequest, typeof(void))]
        [SwaggerResponse(StatusCodes.Status422UnprocessableEntity, typeof(string), Description = "When description length is greater than allowed")]
        [SwaggerResponse(StatusCodes.Status500InternalServerError, typeof(string), Description = "Not your fault")]
        [SwaggerResponse(StatusCodes.Status201Created, typeof(Fact), Description = "Representation of the newly created submission")]
        public IActionResult AddSubmission([FromBody]string description)
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

            var newSubmission = new Submission { Approved = false, FactDescription = description };
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

            _factRepo.Add(new Fact { Description = submissionToApprove.FactDescription });
            if (!_factRepo.Complete())
            {
                throw new Exception("Creating submission failed on save");
            }

            return NoContent();
        }



    }
}
