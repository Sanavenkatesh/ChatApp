using ChatApp.Models;
using Microsoft.AspNet.SignalR;

namespace Chat_Messenger.Hubs
{
    public class CommonBridge : Hub
    {              
        public void sendMessageTo(string senderUserName, string receiverUserName, string message,string senderId, string receiverId)
        {
            using (var db = new ChatDbEntities())
            {                
                db.Messages.Add(new Message { 
                    SenderId = int.Parse(senderId),
                    TextMessage = message,
                    ReceiverId = int.Parse(receiverId),
                    SentOn = System.DateTime.Now,                    
                });
                db.SaveChanges();
            }
            Clients.All.messageReceived(senderUserName, receiverUserName, message, senderId, receiverId);
        }
        
    }
}