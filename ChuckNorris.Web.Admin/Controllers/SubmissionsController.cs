using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ChuckNorris.Web.Admin.Controllers
{
    public class SubmissionsController : Controller
    {
        private readonly ISubmissionsClient _submissionsClient;

        public SubmissionsController(ISubmissionsClient submissionsClient)
        {
            _submissionsClient = submissionsClient;
        }

        public async Task<IActionResult> Index()
        {
            var submissions = await _submissionsClient.GetAllSubmissionsAsync(onlyUnapprovedSubmissions: true);
            return View(submissions.ToList());
        }

        [HttpGet("{id}/approve")]
        public async Task<IActionResult> Approve(int id)
        {
            await _submissionsClient.ApproveSubmissionAsync(id);
            return RedirectToAction("Index", "Facts");
        }
    }
}
