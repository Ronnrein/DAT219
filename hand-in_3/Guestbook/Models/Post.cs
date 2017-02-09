using System;
using System.ComponentModel.DataAnnotations;

namespace Guestbook.Models
{
    public class Post
    {
        [Key]
        public int Id { get; set; }
        public DateTime DateCreated { get; set; }
        [Required(ErrorMessage = "Please fill in your name")]
        public string Author { get; set; }
        [Required(ErrorMessage = "Please enter a message")]
        public string Message { get; set; }

        public Post()
        {
            DateCreated = DateTime.UtcNow;
        }
    }
}