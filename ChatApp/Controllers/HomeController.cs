using ChatApp.Helpers;
using ChatApp.Models;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
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
            ViewBag.UsersListToConnect = new SelectList(db.Users.ToList().Where(x => x.Id != (int)Session["logedInUserId"]), "Id", "UserName");
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
            SessionManager.SetUserId(userData.Id);
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
            else
            {
                isOldChat.LastModified = DateTime.Now;
                db.SaveChanges();
            }

            return Json(true);
        }

        [HttpPost]
        public JsonResult AddGroup(string groupName)
        {
            var groupData = db.Groups.Where(x => x.GroupName == groupName).FirstOrDefault();
            if (groupData == null)
            {
                db.Groups.Add(new Group
                {
                    CreatedBy = (int)Session["logedInUserId"],
                    GroupName = groupName
                });
                db.SaveChanges();

                var data = db.Groups.Where(x => x.GroupName == groupName).FirstOrDefault();
                db.UserChatRooms.Add(new UserChatRoom
                {
                    GroupId = data.Id,
                    ParentUserId = data.CreatedBy,
                    LastModified = DateTime.Now,
                    UnreadMessagesCount = 0
                });
                db.SaveChanges();
            }

            return Json(true);
        }

        public ActionResult GetChatRooms()
        {
            try
            {
                var chatRoomsData = db.UserChatRooms.OrderByDescending(x => x.LastModified).ToList().Where(x => x.ParentUserId == (int)Session["logedInUserId"]);
                return PartialView("_ChatRooms", chatRoomsData);
            }
            catch (Exception)
            {
                return PartialView("_ChatRooms", new List<UserChatRoom>());
                throw;
            }

        }

        public ActionResult GetGroupRooms()
        {
            try
            {
                var chatRoomsData = db.UserChatRooms.ToList().Where(x => x.UserId == (int)Session["logedInUserId"] && x.GroupId != null);
                return PartialView("_GroupRooms", chatRoomsData);
            }
            catch (Exception)
            {
                return PartialView("_GroupRooms", new List<UserChatRoom>());
                throw;
            }

        }

        public ActionResult GetChatMessages(int receiverId, bool isGroup)
        {
            try
            {
                var chatRoomData = new UserChatRoom();
                if (isGroup)
                {
                    chatRoomData = db.UserChatRooms.ToList().Where(x => x.ParentUserId == (int)Session["logedInUserId"] && x.GroupId == receiverId).FirstOrDefault();
                }
                else
                {
                    chatRoomData = db.UserChatRooms.ToList().Where(x => x.ParentUserId == (int)Session["logedInUserId"] && x.UserId == receiverId).FirstOrDefault();
                }
                if (chatRoomData != null)
                {
                    chatRoomData.UnreadMessagesCount = 0;
                    db.SaveChanges();
                }

                var chatData = new List<Message>();
                if (isGroup)
                {
                    chatData = db.Messages.OrderBy(x => x.SentOn).ToList().Where(x => x.GroupId == receiverId).ToList();

                }
                else
                {
                    chatData = db.Messages.OrderBy(x => x.SentOn).ToList().Where(x => (x.SenderId == (int)Session["logedInUserId"] || x.ReceiverId == (int)Session["logedInUserId"]) && (x.SenderId == receiverId || x.ReceiverId == receiverId)).ToList();

                }
                return PartialView("_MessagesView", chatData);

            }
            catch (Exception)
            {
                return PartialView("_MessagesView", new List<Message> { });
                throw;
            }

        }

        public JsonResult GetGroupMessages(int groupId)
        {
            try
            {
                var grupRoomData = db.UserChatRooms.ToList().Where(x => x.ParentUserId == (int)Session["logedInUserId"] && x.GroupId == groupId).FirstOrDefault();
                grupRoomData.UnreadMessagesCount = 0;
                db.SaveChanges();

                var chatData = db.Messages.OrderBy(x => x.SentOn).ToList().Where(x => x.GroupId == groupId);
                return Json(chatData, JsonRequestBehavior.AllowGet);
            }
            catch (Exception)
            {
                return Json(new List<Message> { }, JsonRequestBehavior.AllowGet);
                throw;
            }

        }

        [HttpPost]
        public JsonResult SaveImage(string base64String, string fileName)
        {
            try
            {
                String path = Server.MapPath("~/Files");
                var fileNameType = fileName.Split('.');
                if (!Directory.Exists(path))
                {
                    Directory.CreateDirectory(path); 
                }
                var fileNameWithDate = fileNameType[0] + DateTime.Now.ToString("yyyyMMddHHmmssfff") + '.' + fileNameType[1];

                string imgPath = Path.Combine(path, fileNameWithDate);

                byte[] imageBytes = Convert.FromBase64String(base64String);

                System.IO.File.WriteAllBytes(imgPath, imageBytes);                

                return Json(new { FIlePath = "/Files/" + fileNameWithDate , FileName = fileNameWithDate }, JsonRequestBehavior.AllowGet);
            }
            catch (Exception e)
            {
                return Json("error", JsonRequestBehavior.AllowGet);
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
