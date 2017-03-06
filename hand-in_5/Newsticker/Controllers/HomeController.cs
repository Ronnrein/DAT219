using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Newsticker.Data;
using Newsticker.Models;

namespace Newsticker.Controllers {
    public class HomeController : Controller {

        private NewstickerContext db;

        public HomeController(NewstickerContext db) {
            this.db = db;
        }

        [HttpGet]
        public IActionResult Index() {
            return View();
        }

        [HttpGet]
        public IActionResult News(int? id) {
            return Json(id == null ? db.Stories : db.Stories.Where(s => s.Id > id));
        }

        [HttpGet]
        public IActionResult New() {
            return View();
        }

        [HttpGet]
        public IActionResult Story(int id) {
            return View(db.Stories.Single(s => s.Id == id));
        }

        [HttpPost]
        public IActionResult New(Story story) {
            if (!ModelState.IsValid) {
                return View();
            }
            db.Stories.Add(story);
            db.SaveChanges();
            return RedirectToAction("Story", new {id = story.Id});
        }

    }
}
