using Microsoft.AspNetCore.Mvc;

namespace ChuckNorris.Web.Controllers
{
    public class OfflineController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
