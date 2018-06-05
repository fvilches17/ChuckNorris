using System.ComponentModel.DataAnnotations;
using ChuckNorris.Api.Entities;

namespace ChuckNorris.Api.Models
{
    public class SubmissionApproval
    {
        [MinLength(1)]
        [MaxLength(Fact.DescriptionMaxLength)]
        public string Description { get; set; }
    }
}
