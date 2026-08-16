using System;

namespace EducationalPlatform.Application.DTOs.Answer
{
    public class AnswerDto
    {
        public Guid QuestionId { get; set; }
        public Guid SelectedOptionId { get; set; }
        public Guid OptionId
        {
            get => SelectedOptionId;
            set => SelectedOptionId = value;
        }
    }
}
