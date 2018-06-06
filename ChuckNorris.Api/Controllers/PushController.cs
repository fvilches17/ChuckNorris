using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using ChuckNorris.Api.Repositories;
using WebPush;

namespace ChuckNorris.Api.Controllers
{
    [Route("api/push")]
    public class PushController : Controller
    {
        private readonly ISubscriptionsRepository _subscriptionsRepository;

        public PushController(ISubscriptionsRepository subscriptionsRepository)
        {
            _subscriptionsRepository = subscriptionsRepository;
        }

        
    }
}
