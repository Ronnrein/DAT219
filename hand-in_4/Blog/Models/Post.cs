using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Blog.Models
{
    public class Post
    {
        [Key]
        public int Id { get; set; }
        public DateTime DateCreated { get; set; }

        [Required(ErrorMessage = "Please fill in the title of the post")]
        public string Title{ get; set; }

        [Required(ErrorMessage = "Please fill in the content of the post")]
        public string Content{ get; set; }

        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual ApplicationUser User { get; set; }

        public Post()
        {
            DateCreated = DateTime.Now;
        }
    }
}