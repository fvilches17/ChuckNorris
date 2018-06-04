using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChuckNorris.Api.Entities
{
    public class Submission
    {
        public const int FactDescriptionMaxLength = 500;

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(500)]
        public string FactDescription { get; set; }

        public bool Approved { get; set; }
    }
}
