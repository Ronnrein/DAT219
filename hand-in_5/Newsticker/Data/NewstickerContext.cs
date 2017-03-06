using Microsoft.EntityFrameworkCore;
using Newsticker.Models;

namespace Newsticker.Data {
    public class NewstickerContext : DbContext{

        public NewstickerContext(DbContextOptions<NewstickerContext> options) : base(options) {}

        public DbSet<Story> Stories { get; set; }
    }
}