using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Newsticker.Models {
    public class Story {

        [Key]
        public int Id { get; set; }

        [Required(ErrorMessage = "Please enter title")]
        public string Title { get; set; }

        [Required(ErrorMessage = "Please enter content")]
        public string Content { get; set; }

        public string ImageUrl { get; set; }

        public DateTime DateCreated { get; set; }

        public Story() {
            DateCreated = DateTime.Now;
        }

    }
}