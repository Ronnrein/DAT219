using Microsoft.EntityFrameworkCore;
using Guestbook.Models;

namespace Guestbook.Data
{
    public class GuestbookContext : DbContext
    {
        public GuestbookContext(DbContextOptions<GuestbookContext> options)
            : base(options)
        {
        }

        public DbSet<Post> Posts { get; set; }
    }
}
