using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ChuckNorris.Web.Admin.Controllers
{
    public class FactsController : Controller
    {
        private readonly IFactsClient _factsClient;

        public FactsController(IFactsClient factsClient)
        {
            _factsClient = factsClient;
        }

        public async Task<IActionResult> Index()
        {
            var facts = await _factsClient.GetAllFactsAsync();

            return View(facts.ToList());
        }

        public IActionResult Add()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Add(Fact fact)
        {
            await _factsClient.AddFactAsync(fact.Description);

            //TODO-FV: add push notification feature here

            return RedirectToAction("Index");
        }

        public async Task<IActionResult> Remove(int factId)
        {
            await _factsClient.RemoveFactAsync(factId);

            return RedirectToAction("Index");
        }
    }
}
