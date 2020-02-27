using Microsoft.SharePoint.Client;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ProviderHostedAddInWeb.Controllers
{
	public class HomeController : Controller
	{
		[SharePointContextFilter]
		public ActionResult Index()
		{
			User spUser = null;

			var spContext = SharePointContextProvider.Current.GetSharePointContext(HttpContext);

			using (var clientContext = spContext.CreateUserClientContextForSPHost())
			{
				if (clientContext != null)
				{
					spUser = clientContext.Web.CurrentUser;

					clientContext.Load(spUser, user => user.Title);

					clientContext.ExecuteQuery();

					ViewBag.UserName = spUser.Title;
				}
			}

			using (var appOnlyContext = spContext.CreateAppOnlyClientContextForSPHost())
			{
				if (appOnlyContext != null)
				{
					var list = appOnlyContext.Web.Lists.GetByTitle("ProviderHostedAppVisitors");
					var newItemCreationInfo = new ListItemCreationInformation();
					var newItem = list.AddItem(newItemCreationInfo);
					newItem["Title"] = ViewBag.UserName.ToString();
					newItem.Update();
					appOnlyContext.ExecuteQuery();
				}
			}

			return View();
		}

		public ActionResult About()
		{
			ViewBag.Message = "Your application description page.";

			return View();
		}

		public ActionResult Contact()
		{
			ViewBag.Message = "Your contact page.";

			return View();
		}
	}
}
