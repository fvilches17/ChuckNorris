using ChuckNorris.Api.Entities;
using System.Collections.Generic;
using System.Linq;

namespace ChuckNorris.Api.Repositories
{
    public class SubmissionRepository : ISubmissionRepository
    {
        private readonly AppContext _context;

        public SubmissionRepository(AppContext context)
        {
            _context = context;
        }

        public void CreateSubmussion(Submission submission)
        {
            _context.Submissions.Add(submission);
        }

        public void ApproveSubmission(int submissionId)
        {
            var submission = _context.Submissions.First(s => s.Id == submissionId);
            submission.Approved = true;

            _context.Facts.Add(new Fact { Description = submission.FactDescription });
        }

        public Submission GetById(int id)
        {
            return _context.Submissions.FirstOrDefault(s => s.Id == id);
        }

        public IEnumerable<Submission> GetSubmissions(bool retrieveOnlyUnapproved = false)
        {
            return retrieveOnlyUnapproved
                ? _context.Submissions.Where(s => !s.Approved).ToList()
                : _context.Submissions.ToList();
        }

        public bool Complete()
        {
            return _context.SaveChanges() >= 0;
        }
    }
}
