//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace ChatApp.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class Message
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string TextMessage { get; set; }
        public Nullable<System.DateTime> SentOn { get; set; }
    }
}
