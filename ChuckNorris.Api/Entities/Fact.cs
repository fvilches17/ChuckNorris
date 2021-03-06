﻿using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChuckNorris.Api.Entities
{
    public class Fact
    {
        public const int DescriptionMaxLength = 500;

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(500)]
        public string Description { get; set; }
    }
}
