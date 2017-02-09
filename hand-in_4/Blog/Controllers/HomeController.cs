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
        private SignInManager<ApplicationUser> signInManager;

        public HomeController(
            ApplicationDbContext db,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager)
        {
            this.db = db;
            this.userManager = userManager;
            this.signInManager = signInManager;
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
                return RedirectToAction("Index");
            }
            db.Entry(user).Collection(u => u.Posts).Load();
            return View(user.Posts);
        }

        public IActionResult Post(int id)
        {
            Post post = db.Posts.Find(id);
            if(post != null) {
                db.Entry(post).Reference(p => p.User).Load();

                return View(post);
            }
            return NotFound();
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
            if(ModelState.IsValid) {
                post.User = await userManager.GetUserAsync(User);
                db.Posts.Add(post);
                db.SaveChanges();
                return RedirectToAction("Post", new {id = post.Id});
            }
            return View();
        }

        [HttpGet("Home/Post/{id}/Edit")]
        [Authorize]
        public async Task<IActionResult> Edit(int id)
        {
            Post post = db.Posts.Find(id);
            if(post != null) {
                db.Entry(post).Reference(p => p.User).Load();
                ApplicationUser user = await userManager.GetUserAsync(HttpContext.User);
                if(user.Id != post.User.Id)
                {
                    return Unauthorized();
                } 
                return View(post);
            }
            return NotFound();
        }

        [HttpPost("Home/Post/{id}/Edit"), ActionName("Edit")]
        [Authorize]
        public async Task<IActionResult> EditPost(int id)
        {
            if(ModelState.IsValid) {
                Post post = db.Posts.Find(id);
                if(post != null) {
                    db.Entry(post).Reference(p => p.User).Load();
                    ApplicationUser user = await userManager.GetUserAsync(User);
                    if(user.Id != post.User.Id)
                    {
                        return Unauthorized();
                    }
                    if(await TryUpdateModelAsync<Post>(post, "", p => p.Content, p => p.Title))
                    {
                        db.SaveChanges();
                        return RedirectToAction("Post", new {id = post.Id});
                    }
                }
            }
            return View();
        }
    }
}
