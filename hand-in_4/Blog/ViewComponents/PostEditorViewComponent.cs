using System.Threading.Tasks;
using Blog.Data;
using Blog.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Blog.ViewComponents
{
    public class PostEditorViewComponent : ViewComponent
    {
        private ApplicationDbContext db;
        private UserManager<ApplicationUser> userManager;

        public PostEditorViewComponent(ApplicationDbContext db, UserManager<ApplicationUser> userManager)
        {
            this.db = db;
            this.userManager = userManager;
        }

        public async Task<IViewComponentResult> InvokeAsync(int id, bool blank = false)
        {
            if (blank) {
                return View(new Post());
            }
            Post post = db.Posts.Find(id);
            if(post == null) {
                return Content("Post not found");
            }
            db.Entry(post).Reference(p => p.User).Load();
            ApplicationUser user = await userManager.GetUserAsync(HttpContext.User);
            if(user.Id != post.User.Id)
            {
                return Content("Not your post");
            }
            return View(post);
        }
    }
}