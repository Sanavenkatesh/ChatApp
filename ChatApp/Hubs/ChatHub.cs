using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatApp.Hubs
{
    public class ChatHub : Hub
    {
        public void SendMessage(string user, string message)
        {
             Clients.All.SendAsync("ReceiveMessage", user, message);
        }

        public void SendToUser(string user, string receiverConnectionId, string message)
        {
            Clients.Client(receiverConnectionId).SendAsync("ReceiveMessage", user, message);
        }

        public string GetConnectionId() => Context.ConnectionId;
    }
}