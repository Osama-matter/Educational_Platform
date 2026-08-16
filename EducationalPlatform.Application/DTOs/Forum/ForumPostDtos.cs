using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace EducationalPlatform.Application.DTOs.Forum
{
    public class ForumPostDto
    {
        public Guid Id { get; set; }
        public string Content { get; set; }
        public Guid ForumThreadId { get; set; }

        [JsonPropertyName("threadId")]
        public string ThreadId => ForumThreadId.ToString();

        public Guid UserId { get; set; }

        [JsonPropertyName("authorId")]
        public string AuthorId => UserId.ToString();

        public string UserName { get; set; }

        [JsonPropertyName("authorName")]
        public string AuthorName => !string.IsNullOrEmpty(UserName) ? UserName : "عضو";

        public Guid? ParentPostId { get; set; }
        public bool IsHelpful { get; set; }

        [JsonPropertyName("votesCount")]
        public int VoteCount { get; set; }

        public DateTime CreatedAt { get; set; }
        public List<ForumPostDto> Replies { get; set; } = new();
    }

    public class CreateForumPostDto
    {
        public string Content { get; set; }
        public Guid ForumThreadId { get; set; }

        [JsonPropertyName("threadId")]
        public Guid? ThreadId 
        { 
            get => ForumThreadId; 
            set => ForumThreadId = value ?? ForumThreadId; 
        }

        public Guid? ParentPostId { get; set; }
    }

    public class UpdateForumPostDto
    {
        public string Content { get; set; }
        public bool IsHelpful { get; set; }
    }
}
