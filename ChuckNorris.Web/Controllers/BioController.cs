using Microsoft.AspNetCore.Mvc;

namespace ChuckNorris.Web.Controllers
{
    public class BioController:Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
