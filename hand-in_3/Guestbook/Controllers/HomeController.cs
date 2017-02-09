using Microsoft.AspNetCore.Mvc;
using Guestbook.Data;
using Guestbook.Models;

namespace Guestbook.Controllers
{
    public class HomeController : Controller {

        private GuestbookContext db;

        public HomeController(GuestbookContext db) {
            this.db = db;
        }

        [HttpGet]
        public ActionResult Index()
        {
            return View(db.Posts);
        }

        [HttpPost]
        [ActionName("Index")]
        public ActionResult NewPost(Post post)
        {
            if (ModelState.IsValid) {
                db.Posts.Add(post);
                db.SaveChanges();
            }
            return View(db.Posts);
        }
    }
}