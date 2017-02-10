using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Blog.Models;
using Blog.Data;

namespace Blog.Controllers
{
    public class HomeController : Controller
    {
        private ApplicationDbContext db;
        private UserManager<ApplicationUser> userManager;

        public HomeController(
            ApplicationDbContext db,
            UserManager<ApplicationUser> userManager)
        {
            this.db = db;
            this.userManager = userManager;
        }

        public IActionResult Index()
        {
            return View(db.Posts);
        }

        public IActionResult Error()
        {
            return View();
        }

        [HttpGet("Home/Post")]
        public async Task<IActionResult> MyPosts()
        {
            ApplicationUser user = await userManager.GetUserAsync(User);
            if(user == null)
            {
                return Unauthorized();
            }
            db.Entry(user).Collection(u => u.Posts).Load();
            return View(user.Posts);
        }

        [HttpGet]
        public IActionResult Post(int id)
        {
            Post post = db.Posts.Find(id);
            if(post == null) {
                return NotFound();
            }
            db.Entry(post).Reference(p => p.User).Load();
            return View(post);
        }

        [HttpGet]
        [Authorize]
        public IActionResult New()
        {
            return View();
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> New(Post post)
        {
            if(!ModelState.IsValid) {
                return View();
            }
            post.User = await userManager.GetUserAsync(User);
            db.Posts.Add(post);
            db.SaveChanges();
            return RedirectToAction("Post", new {id = post.Id});
        }

        [HttpGet("Home/Post/{id}/Edit")]
        [Authorize]
        public IActionResult Edit(int id)
        {
            return View(id);
        }

        [HttpPost("Home/Post/{id}/Edit"), ActionName("Edit")]
        [Authorize]
        public async Task<IActionResult> EditPost(int id)
        {
            if(!ModelState.IsValid) {
                return View();
            }
            Post post = db.Posts.Find(id);
            if(post == null) {
                return NotFound();
            }
            db.Entry(post).Reference(p => p.User).Load();
            ApplicationUser user = await userManager.GetUserAsync(User);
            if(user.Id != post.User.Id)
            {
                return Unauthorized();
            }
            if(await TryUpdateModelAsync<Post>(post, "", p => p.Content, p => p.Title))
            {
                db.SaveChanges();
            }
            return RedirectToAction("Post", new {id = post.Id});
        }

        [HttpGet]
        public async Task<IActionResult> Delete(int id) {
            Post post = db.Posts.Find(id);
            if(post == null) {
                return NotFound();
            }
            db.Entry(post).Reference(p => p.User).Load();
            ApplicationUser user = await userManager.GetUserAsync(User);
            if(user.Id != post.User.Id)
            {
                return Unauthorized();
            }
            db.Posts.Remove(post);
            db.SaveChanges();
            return RedirectToAction("MyPosts");
        }
    }
}
