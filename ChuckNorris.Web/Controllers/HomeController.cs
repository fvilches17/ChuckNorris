using Microsoft.AspNetCore.Mvc;

namespace ChuckNorris.Web.Controllers
{
    public class HomeController:Controller
    {
        public IActionResult Index()
        {
            return RedirectToAction(controllerName: "Facts", actionName: "Index");
        }
    }
}
