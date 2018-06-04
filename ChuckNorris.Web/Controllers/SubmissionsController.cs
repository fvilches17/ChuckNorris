using Microsoft.AspNetCore.Mvc;

namespace ChuckNorris.Web.Controllers
{
    public class SubmissionsController:Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
