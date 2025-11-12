using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ToDo.Api.Controllers;
using ToDo.Api.Data;
using ToDo.Api.Dtos;
using ToDo.Api.Models;
using Xunit;

namespace ToDo.Api.Tests.Controllers
{
    public class TodosControllerTests
    {
        private AppDbContext CreateInMemoryDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            return new AppDbContext(options);
        }

        private static TodosController CreateController(AppDbContext context)
            => new TodosController(context);

        [Fact]
        public async Task Create_ShouldReturnCreated_AndPersistTodo()
        {
            // Arrange
            using var context = CreateInMemoryDbContext();
            var controller = CreateController(context);

            var createDto = new CreateToDoItemDto
            {
                Title = "Test task",
                Description = "Test description"
            };

            // Act
            var result = await controller.Create(createDto, CancellationToken.None);

            // Assert: typ odpowiedzi
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(TodosController.GetById), createdResult.ActionName);
            var returnedDto = Assert.IsType<ToDoItemDto>(createdResult.Value);

            Assert.Equal("Test task", returnedDto.Title);
            Assert.False(returnedDto.IsCompleted);
            Assert.NotEqual(Guid.Empty, returnedDto.Id);

            // Assert: dane w "bazie"
            var todosInDb = await context.ToDoItems.ToListAsync();
            Assert.Single(todosInDb);

            var todo = todosInDb.First();
            Assert.Equal("Test task", todo.Title);
            Assert.False(todo.IsCompleted);
        }

        [Fact]
        public async Task ToggleStatus_ShouldFlipIsCompleted_WhenTodoExists()
        {
            // Arrange
            using var context = CreateInMemoryDbContext();

            var existing = new ToDoItem
            {
                Id = Guid.NewGuid(),
                Title = "Toggle test",
                Description = null,
                CreatedAt = DateTime.UtcNow,
                IsCompleted = false
            };

            context.ToDoItems.Add(existing);
            await context.SaveChangesAsync();

            var controller = CreateController(context);

            // Act
            var result = await controller.ToggleStatus(existing.Id, CancellationToken.None);

            // Assert: NoContent
            Assert.IsType<NoContentResult>(result);

            // Sprawdź w bazie po pierwszym toggle
            var updated = await context.ToDoItems.FindAsync(existing.Id);
            Assert.NotNull(updated);
            Assert.True(updated!.IsCompleted);

            // Drugi toggle - wraca na false
            await controller.ToggleStatus(existing.Id, CancellationToken.None);
            var updatedAgain = await context.ToDoItems.FindAsync(existing.Id);
            Assert.False(updatedAgain!.IsCompleted);
        }

        [Fact]
        public async Task GetById_ShouldReturnNotFound_WhenTodoDoesNotExist()
        {
            // Arrange
            using var context = CreateInMemoryDbContext();
            var controller = CreateController(context);

            // Act
            var result = await controller.GetById(Guid.NewGuid(), CancellationToken.None);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task Update_ShouldReturnNoContent_AndPersistChanges()
        {
            // Arrange
            using var context = CreateInMemoryDbContext();
            var existing = new ToDoItem
            {
                Id = Guid.NewGuid(),
                Title = "Old",
                Description = "Old desc",
                CreatedAt = DateTime.UtcNow,
                IsCompleted = false
            };
            context.ToDoItems.Add(existing);
            await context.SaveChangesAsync();

            var controller = CreateController(context);
            var editDto = new EditToDoItemDto
            {
                Title = "New",
                Description = "New desc"
            };

            // Act
            var result = await controller.Update(existing.Id, editDto, CancellationToken.None);

            // Assert
            Assert.IsType<NoContentResult>(result);

            var reloaded = await context.ToDoItems.FindAsync(existing.Id);
            Assert.Equal("New", reloaded!.Title);
            Assert.Equal("New desc", reloaded.Description);
        }
    }
}
