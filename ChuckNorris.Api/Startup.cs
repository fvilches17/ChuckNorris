using ChuckNorris.Api.Repositories;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NJsonSchema;
using NSwag;
using NSwag.AspNetCore;
using System.Collections.Generic;
using System.Reflection;

namespace ChuckNorris.Api
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<AppContext>(options => options.UseSqlServer(Configuration.GetConnectionString("DefaultConnection")));
            services.AddScoped<IFactRepository, FactRepository>();
            services.AddScoped<ISubmissionRepository, SubmissionRepository>();
            services.AddMvc();
            services.AddCors();
        }

        public void Configure(IApplicationBuilder app, IHostingEnvironment env, AppContext appContext)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseCors(builder => builder.WithOrigins("*").AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

            appContext.Database.Migrate();
            appContext.EnsureSeedForContext();
            app.UseMvc();

            // Enable the Swagger UI middleware and the Swagger generator
            app.UseSwaggerUi(typeof(Startup).GetTypeInfo().Assembly, settings =>
            {
                settings.GeneratorSettings.Description = "Chuck Norris API";
                settings.GeneratorSettings.IsAspNetCore = true;
                settings.GeneratorSettings.Title = $"Chuch Norris API - {env.EnvironmentName}";
                settings.GeneratorSettings.Version = "v1";
                settings.GeneratorSettings.DefaultPropertyNameHandling = PropertyNameHandling.CamelCase;

                settings.PostProcess = document =>
                {
                    document.BasePath = "/";
                    document.Schemes = new List<SwaggerSchema> { SwaggerSchema.Http, SwaggerSchema.Https };
                    document.Host = env.IsDevelopment() ? "localhost:5000" : "http://chucknorris-api.azurewebsites.net";
                };

                settings.SwaggerUiRoute = "/swagger/ui";
                settings.ValidateSpecification = true;
                settings.ShowRequestHeaders = true;
                settings.UseJsonEditor = true;
            });
        }
    }
}
