using Microsoft.AspNetCore.Mvc;

namespace ChuckNorris.Web.Controllers
{
    public class ContactController:Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
