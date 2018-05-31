using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace ChuckNorris.Web
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddHttpsRedirection(options =>
            {
                options.RedirectStatusCode = StatusCodes.Status301MovedPermanently;
                options.HttpsPort = 443;
            });

            services.AddMvc();
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsEnvironment("localhost"))
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseMvcWithDefaultRoute();
        }
    }
}
