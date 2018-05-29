using Microsoft.AspNetCore.Mvc;

namespace ChuckNorris.Web.Controllers
{
    public class FactsController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
