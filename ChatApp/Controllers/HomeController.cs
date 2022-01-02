using ChatApp.Models;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Mvc;

namespace Chat_Messenger.Controllers
{
    public class HomeController : Controller
    {
        public List<object> messageBox = new List<object>();
        private ChatDbEntities db = new ChatDbEntities();
        
        public ActionResult HomePage()
        {
            ViewBag.Title = "Home Page";
            ViewBag.UsersListToConnect =new SelectList(db.Users.ToList().Where(x => x.Id != (int)Session["logedInUserId"]), "Id", "UserName");
            return View();
        }

        [HttpPost]
        public JsonResult sendMessage(messageBody message)
        {
            dynamic response = new ExpandoObject();
            messageBox.Add(message);
            response.messageBox = messageBox;
            return Json(response);
        }

        public ActionResult Login()
        {
            ViewBag.UsersList = new SelectList(db.Users.ToList(), "Id", "UserName");
            return View();
        }

        [HttpPost]
        public ActionResult Login(int userId)
        {
            var userData = db.Users.Find(userId);
            Session["logedInUserName"] = userData.UserName;
            Session["logedInUserId"] = userData.Id;
            return RedirectToAction("HomePage");
        }

        [HttpPost]
        public JsonResult startNewChat(int id)
        {
            var userData = db.Users.Find(id);
            var isOldChat = db.UserChatRooms.ToList().Where(x => x.ParentUserId == (int)Session["logedInUserId"] && x.UserId == userData.Id).FirstOrDefault();
            if (isOldChat == null)
            {
                db.UserChatRooms.Add(new UserChatRoom
                {
                    ParentUserId = (int)Session["logedInUserId"],
                    UserId = userData.Id,
                    UserName = userData.UserName,
                    LastModified = DateTime.Now
                });
                db.SaveChanges();
                return Json(false);
            }
           
            return Json(true);
        }       

        public JsonResult GetChatRooms()
        {
            try
            {
                var chatRoomsData = db.UserChatRooms.OrderByDescending(x=>x.LastModified).ToList().Where(x => x.ParentUserId == (int)Session["logedInUserId"]);
                return Json(chatRoomsData, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                return Json(new List<UserChatRoom> { }, JsonRequestBehavior.AllowGet);
                throw;
            }
            
        }
        
        public JsonResult GetChatMessages(int receiverId)
        {
            try
            {
                var chatData = db.Messages.OrderBy(x=>x.SentOn).ToList().Where(x => (x.SenderId == (int)Session["logedInUserId"] || x.ReceiverId == (int)Session["logedInUserId"]) && (x.SenderId == receiverId || x.ReceiverId == receiverId));
                return Json(chatData, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                return Json(new List<Message> { }, JsonRequestBehavior.AllowGet);
                throw;
            }
            
        }

    }

    public struct messageBody
    {
        public string accessToken { get; set; }
        public string messageString { get; set; }
    }
}
