using System.Net;
using System.Security;
using Microsoft.SharePoint.Client;
using Newtonsoft.Json;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, TraceWriter log)
{
    log.Info("Webhook triggered");

    // Grab the validationToken URL parameter
    string validationToken = req.GetQueryNameValuePairs()
        .FirstOrDefault(q => string.Compare(q.Key, "validationtoken", true) == 0)
        .Value;
    
    // If a validation token is present, we need to respond within 5 seconds by  
    // returning the given validation token. This only happens when a new 
    // web hook is being added
    if (validationToken != null)
    {
      log.Info($"Validation token {validationToken} received");
      var response = req.CreateResponse(HttpStatusCode.OK);
      response.Content = new StringContent(validationToken);
      return response;
    }

    log.Info($"Webhook is triggered");
    var content = await req.Content.ReadAsStringAsync();
    log.Info($"Received payload: {content}");

    var notifications = JsonConvert.DeserializeObject<ResponseModel<NotificationModel>>(content).Value;
    log.Info($"Found {notifications.Count} notifications");

    //
    // For the simplicity - getting username and password from app settings
    //
    var username = System.Configuration.ConfigurationManager.AppSettings["SPWEBHOOK_USER"];
    var password = System.Configuration.ConfigurationManager.AppSettings["SPWEBHOOK_PWD"];
    // creating secure strings for the password
    var securePassword = new SecureString();
    if (!string.IsNullOrEmpty(password))
    {
        foreach (char c in password.ToCharArray())
        {
            securePassword.AppendChar(c);
        }
    
    }

    // we need tenant url as SiteUrl from web hook is in relative format
    var tenantUrl = "https://<your-tenant>.sharepoint.com";

    foreach (var notification in notifications)
    {
        // creating context for the Site
        var ctx = new ClientContext($"{tenantUrl}{notification.SiteUrl}");
        ctx.Credentials = new SharePointOnlineCredentials(username, securePassword);
        // getting web
        var web = ctx.Site.OpenWebById(new Guid(notification.WebId));
        //getting list
        var list = ctx.Web.Lists.GetById(new Guid(notification.Resource));
        // getting changes
        var changeQuery = new ChangeQuery()
        {
            Add = true,
            Item = true
        };
        // look back - 5 minutes
        changeQuery.ChangeTokenStart = new ChangeToken();
        changeQuery.ChangeTokenStart.StringValue = string.Format("1;3;{0};{1};-1", notification.Resource, DateTime.Now.AddMinutes(-5).ToUniversalTime().Ticks.ToString());
        var changes = list.GetChanges(changeQuery);
        ctx.Load(changes);
        ctx.ExecuteQuery();
        // iterating through changes
        foreach (var change in changes)
        {
            // we know that all the changes are ChangeItem
            var changeItem = change as ChangeItem;
            // getting item by id
            var item = list.GetItemById(changeItem.ItemId);
            ctx.Load(item, i => i["Title"]);
            ctx.ExecuteQuery();

            // here we can store info to the database
            log.Info($"Request: {item["Title"]}");
        }
    }

    // if we get here we assume the request was well received
    return new HttpResponseMessage(HttpStatusCode.OK);

}

// supporting classes
public class ResponseModel<T>
{
    [JsonProperty(PropertyName = "value")]
    public List<T> Value { get; set; }
}

public class NotificationModel
{
    [JsonProperty(PropertyName = "subscriptionId")]
    public string SubscriptionId { get; set; }

    [JsonProperty(PropertyName = "clientState")]
    public string ClientState { get; set; }

    [JsonProperty(PropertyName = "expirationDateTime")]
    public DateTime ExpirationDateTime { get; set; }

    [JsonProperty(PropertyName = "resource")]
    public string Resource { get; set; }

    [JsonProperty(PropertyName = "tenantId")]
    public string TenantId { get; set; }

    [JsonProperty(PropertyName = "siteUrl")]
    public string SiteUrl { get; set; }

    [JsonProperty(PropertyName = "webId")]
    public string WebId { get; set; }
}
