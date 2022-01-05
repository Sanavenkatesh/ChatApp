using Chat_Messenger.Controllers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatApp.Helpers
{
    public class SessionManager
    {       
        public static int UserId { get; set; }

        public static int GetUserId()
        {
            return UserId;
        }
        public static void SetUserId(int userId)
        {
            UserId = userId;
        }

    }
}