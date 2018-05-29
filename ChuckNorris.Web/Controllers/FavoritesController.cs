using Microsoft.AspNetCore.Mvc;

namespace ChuckNorris.Web.Controllers
{
    public class FavoritesController:Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
