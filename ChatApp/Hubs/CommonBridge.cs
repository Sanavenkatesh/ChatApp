using ChatApp.Helpers;
using ChatApp.Models;
using Microsoft.AspNet.SignalR;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Chat_Messenger.Hubs
{
    public class CommonBridge : Hub
    {
        public override Task OnConnected()
        {
            using (var db = new ChatDbEntities())
            {
                var user = db.Users.Find(SessionManager.GetUserId());
                user.ConnectionId = Context.ConnectionId;
                db.SaveChanges();


                var connectedRooms = db.GroupChatRooms.ToList().Where(x => x.UserId == user.Id);
                foreach (var item in connectedRooms)
                {
                    Groups.Add(Context.ConnectionId, item.GroupName);
                }

            }
            return base.OnConnected();
        }

        public void sendMessageTo(string senderUserName, string receiverUserName, string message,string senderId, string receiverId)
        {
            var connectionId = "";
            using (var db = new ChatDbEntities())
            {                
                db.Messages.Add(new Message { 
                    SenderId = int.Parse(senderId),
                    TextMessage = message,
                    ReceiverId = int.Parse(receiverId),
                    SentOn = System.DateTime.Now,                    
                });
                db.SaveChanges();

                connectionId = db.Users.Find(int.Parse(receiverId)).ConnectionId;

                var userData = db.Users.Find(int.Parse(senderId));
                var isOldChat = db.UserChatRooms.ToList().Where(x => x.ParentUserId == int.Parse(receiverId) && x.UserId == userData.Id).FirstOrDefault();
                if (isOldChat == null)
                {
                    db.UserChatRooms.Add(new UserChatRoom
                    {
                        ParentUserId = int.Parse(receiverId),
                        UserId = userData.Id,
                        UserName = userData.UserName,
                        LastModified = DateTime.Now
                    });
                    db.SaveChanges();                    
                }
                else
                {
                    isOldChat.LastModified = DateTime.Now;
                    db.SaveChanges();
                }

            }
            if(connectionId != null)
            {
                Clients.Client(connectionId).messageReceived(senderUserName, receiverUserName, message, senderId, receiverId);
            }
            
        }
        public void sendGroupMessage(string senderUserName, string message, string senderId, string groupName, string groupId)
        {
            using (var db = new ChatDbEntities())
            {
                db.Messages.Add(new Message
                {
                    SenderId = int.Parse(senderId),
                    TextMessage = message,
                    SentOn = System.DateTime.Now,
                    GroupId = int.Parse(groupId)
                });
                db.SaveChanges();
            }

            Clients.Group(groupName, Context.ConnectionId).groupMessageReceived(senderUserName, message, senderId, groupName, groupId);

        }

        public void addUserToGroup(string senderId, string newUserId, string groupName, string groupId)
        {
            var connectinId = "";
            using (var db = new ChatDbEntities())
            {
                var isUserExist = db.GroupChatRooms.ToList().Where(r => r.UserId == int.Parse(newUserId) && r.GroupName == groupName && r.GroupId == int.Parse(groupId)).FirstOrDefault();
                if(isUserExist == null)
                {
                    db.GroupChatRooms.Add(new GroupChatRoom
                    {
                        GroupId = int.Parse(groupId),
                        UserId = int.Parse(newUserId),
                        GroupName = groupName
                    });
                    db.SaveChanges();
                }
                connectinId = db.Users.Find(int.Parse(newUserId)).ConnectionId;
            }
            if(connectinId != null)
            {
                Groups.Add(connectinId, groupName);
                Clients.Client(connectinId).groupChangeMethod();
            }

        }

        public void removeUserFromGroup(string existUserId, string groupName, string groupId)
        {
            var connectinId = "";
            using (var db = new ChatDbEntities())
            {
                var isUserExist = db.GroupChatRooms.ToList().Where(r => r.UserId == int.Parse(existUserId) && r.GroupName == groupName && r.GroupId == int.Parse(groupId)).FirstOrDefault();
                if (isUserExist != null)
                {
                    db.GroupChatRooms.Remove(isUserExist);
                    db.SaveChanges();
                }
                connectinId = db.Users.Find(int.Parse(existUserId)).ConnectionId;
            }

            Groups.Remove(connectinId, groupName);
            Clients.Client(connectinId).groupChangeMethod();
        }


    }
}