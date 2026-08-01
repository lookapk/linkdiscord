using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();


app.MapGet("/", () =>
{
    return "VR Discord Backend is running!";
});


app.MapGet("/callback", async (
    HttpRequest request,
    IConfiguration config) =>
{
    var code = request.Query["code"].ToString();

    if (string.IsNullOrEmpty(code))
    {
        return Results.BadRequest("No Discord code received.");
    }


    var clientId = config["Discord:ClientId"];
    var secret = config["Discord:ClientSecret"];
    var redirect = config["Discord:RedirectUri"];


    using var http = new HttpClient();


    var tokenResponse = await http.PostAsync(
        "https://discord.com/api/oauth2/token",
        new FormUrlEncodedContent(
            new Dictionary<string, string>
            {
                {"client_id", clientId!},
                {"client_secret", secret!},
                {"grant_type", "authorization_code"},
                {"code", code},
                {"redirect_uri", redirect!}
            }
        )
    );


    var tokenJson = await tokenResponse.Content.ReadAsStringAsync();


    var token = JsonSerializer.Deserialize<JsonElement>(tokenJson);

    var accessToken = token.GetProperty("access_token").GetString();


    http.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue(
            "Bearer",
            accessToken
        );


    var userResponse =
        await http.GetAsync(
            "https://discord.com/api/users/@me"
        );


    var userJson =
        await userResponse.Content.ReadAsStringAsync();


    return Results.Ok(
        new
        {
            message = "Discord linked!",
            discord = userJson
        }
    );
});


app.Run();
