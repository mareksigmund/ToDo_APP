using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ToDo.Api.Data;
using ToDo.Api.Dtos;
using ToDo.Api.Models;

namespace ToDo.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TodosController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TodosController(AppDbContext context)
        {
            _context = context;
        }

        // GET api/todos
        [HttpGet]
        public async Task<IActionResult> GetAll(CancellationToken ct)
        {
            var todos = await _context.ToDoItems
                .AsNoTracking()
                .Select(t => new ToDoItemDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    CreatedAt = t.CreatedAt,
                    IsCompleted = t.IsCompleted

                }).ToListAsync(ct);
            return Ok(todos);
        }

        //GET /api/todos/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
        {
            var todo = await _context.ToDoItems
                .AsNoTracking()
                .Where(t => t.Id == id)
                .Select(t => new ToDoItemDto
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    CreatedAt = t.CreatedAt,
                    IsCompleted = t.IsCompleted
                }).FirstOrDefaultAsync(ct);
            if (todo == null)
            {
                return NotFound();
            }
            return Ok(todo);
        }


        //POST /api/todos
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateToDoItemDto createDto, CancellationToken ct)
        {

            var todoItem = new ToDoItem
            {
                Title = createDto.Title,
                Description = createDto.Description,
                CreatedAt = DateTime.UtcNow,
                IsCompleted = false
            };
            try
            {
                _context.ToDoItems.Add(todoItem);
                await _context.SaveChangesAsync(ct);
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, "Database write failed.");
            }


            var todoDto = new ToDoItemDto
            {
                Id = todoItem.Id,
                Title = todoItem.Title,
                Description = todoItem.Description,
                CreatedAt = todoItem.CreatedAt,
                IsCompleted = todoItem.IsCompleted
            };

            return CreatedAtAction(nameof(GetById), new { id = todoItem.Id }, todoDto);


        }

        //PUT /api/todos/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] EditToDoItemDto editDto, CancellationToken ct)
        {
            var todo = await _context.ToDoItems.FindAsync(id);

            if (todo == null)
            {
                return NotFound();
            }

            todo.Title = editDto.Title;
            todo.Description = editDto.Description;

            try
            {
                await _context.SaveChangesAsync(ct);
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, "Database write failed.");
            }
            return NoContent();
        }

        // PUT /api/todos/{id}/toggle
        [HttpPut("{id}/toggle")]
        public async Task<IActionResult> ToggleStatus(Guid id, CancellationToken ct)
        {
            var todo = await _context.ToDoItems.FindAsync(id);
            if (todo == null)
            {
                return NotFound();
            }
            todo.IsCompleted = !todo.IsCompleted;
            try
            {
                await _context.SaveChangesAsync(ct);
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, "Database write failed.");
            }
            return NoContent();
        }

        //DELETE /api/todos/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
        {
            var todo = await _context.ToDoItems.FindAsync(id);
            if (todo == null)
            {
                return NotFound();
            }
            _context.ToDoItems.Remove(todo);
            try
            {
                await _context.SaveChangesAsync(ct);
            }
            catch (DbUpdateException)
            {
                return StatusCode(500, "Database write failed.");
            }
            return NoContent();
        }
    }
}
