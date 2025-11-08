using System.ComponentModel.DataAnnotations;

namespace ToDo.Api.Dtos
{
    public class UpdateToDoStatusDto
    {
        [Required]
        public bool IsCompleted { get; set; }
    }
}
