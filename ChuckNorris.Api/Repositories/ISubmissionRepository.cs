using System.Collections.Generic;
using ChuckNorris.Api.Entities;

namespace ChuckNorris.Api.Repositories
{
    public interface ISubmissionRepository
    {
        void CreateSubmussion(Submission submission);
        void ApproveSubmission(int submissionId);
        Submission GetById(int id);
        IEnumerable<Submission> GetSubmissions(bool retrieveOnlyUnapproved = false);
        bool Complete();
    }
}
