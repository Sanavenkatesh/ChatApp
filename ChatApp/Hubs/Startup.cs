using Microsoft.AspNet.SignalR;
using Microsoft.Owin;
using Owin;

[assembly: OwinStartup(typeof(Chat_Messenger.Startup))]

namespace Chat_Messenger
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {            
            app.MapSignalR();
            GlobalHost.Configuration.MaxIncomingWebSocketMessageSize = null;
        }
    }
}
