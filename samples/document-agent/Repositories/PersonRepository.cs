using System.Text.Json;
using Services;

namespace Repositories;

/// <summary>
/// Model to wrap user acquaintances for file storage
/// </summary>
public class UserAcquaintances
{
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime LastModified { get; set; } = DateTime.UtcNow;
    public List<Person> Acquaintances { get; set; } = new();
}

/// <summary>
/// Repository for managing person/acquaintance data with file-per-user storage
/// </summary>
public class PersonRepository
{
    private readonly string _tempDirectory;
    private readonly JsonSerializerOptions _jsonOptions;

    public PersonRepository()
    {
        _tempDirectory = Path.Combine(Path.GetTempPath(), "PersonAcquaintances");
        Directory.CreateDirectory(_tempDirectory);
        
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = true,
            PropertyNameCaseInsensitive = true
        };
    }

    /// <summary>
    /// Gets the file path for a user's acquaintances
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>Full file path for the user's acquaintances file</returns>
    private string GetUserFilePath(string userId)
    {
        return Path.Combine(_tempDirectory, $"{userId}-acquaintances.json");
    }

    /// <summary>
    /// Loads user acquaintances from file, or creates a new instance if file doesn't exist
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>UserAcquaintances instance</returns>
    private async Task<UserAcquaintances> LoadUserAcquaintancesAsync(string userId)
    {
        var filePath = GetUserFilePath(userId);
        
        if (!File.Exists(filePath))
        {
            return new UserAcquaintances { UserId = userId };
        }

        try
        {
            var jsonContent = await File.ReadAllTextAsync(filePath);
            var userAcquaintances = JsonSerializer.Deserialize<UserAcquaintances>(jsonContent, _jsonOptions);
            return userAcquaintances ?? new UserAcquaintances { UserId = userId };
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error reading acquaintances for user {userId}: {ex.Message}");
            return new UserAcquaintances { UserId = userId };
        }
    }

    /// <summary>
    /// Saves user acquaintances to file
    /// </summary>
    /// <param name="userAcquaintances">The user acquaintances to save</param>
    /// <returns>True if successful, false otherwise</returns>
    private async Task<bool> SaveUserAcquaintancesAsync(UserAcquaintances userAcquaintances)
    {
        var filePath = GetUserFilePath(userAcquaintances.UserId);
        
        try
        {
            userAcquaintances.LastModified = DateTime.UtcNow;
            var jsonContent = JsonSerializer.Serialize(userAcquaintances, _jsonOptions);
            await File.WriteAllTextAsync(filePath, jsonContent);
            Console.WriteLine($"Acquaintances saved for user {userAcquaintances.UserId} to {filePath}");
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error saving acquaintances for user {userAcquaintances.UserId}: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Gets all acquaintances for a specific user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>List of acquaintances for the user</returns>
    public async Task<List<Person>> GetAcquaintancesAsync(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException("User ID cannot be null or empty", nameof(userId));
        }

        var userAcquaintances = await LoadUserAcquaintancesAsync(userId);
        return userAcquaintances.Acquaintances.OrderBy(p => p.Name).ToList();
    }

    /// <summary>
    /// Creates a new acquaintance for a user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="person">The person to add as an acquaintance</param>
    /// <returns>The created person with generated ID if it was empty</returns>
    public async Task<Person> CreateAcquaintanceAsync(string userId, Person person)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException("User ID cannot be null or empty", nameof(userId));
        }

        if (person == null)
        {
            throw new ArgumentNullException(nameof(person));
        }

        if (string.IsNullOrWhiteSpace(person.Name))
        {
            throw new ArgumentException("Person name is required", nameof(person));
        }

        // Generate ID if not provided
        if (person.Id == Guid.Empty)
        {
            person.Id = Guid.NewGuid();
        }

        var userAcquaintances = await LoadUserAcquaintancesAsync(userId);
        
        // Check if person with same ID already exists
        if (userAcquaintances.Acquaintances.Any(p => p.Id == person.Id))
        {
            throw new InvalidOperationException($"Acquaintance with ID {person.Id} already exists for user {userId}");
        }

        // Check if person with same name already exists (optional check)
        var existingPerson = userAcquaintances.Acquaintances.FirstOrDefault(p => 
            p.Name.Equals(person.Name, StringComparison.OrdinalIgnoreCase));
        
        if (existingPerson != null)
        {
            Console.WriteLine($"Warning: Person with name '{person.Name}' already exists for user {userId}");
        }

        userAcquaintances.Acquaintances.Add(person);
        await SaveUserAcquaintancesAsync(userAcquaintances);

        Console.WriteLine($"Created acquaintance {person.Name} (ID: {person.Id}) for user {userId}");
        return person;
    }

    /// <summary>
    /// Gets a specific acquaintance by their GUID
    /// </summary>
    /// <param name="personId">The GUID of the person</param>
    /// <returns>The person if found, null otherwise</returns>
    public async Task<Person?> GetAcquaintanceAsync(Guid personId)
    {
        if (personId == Guid.Empty)
        {
            throw new ArgumentException("Person ID cannot be empty", nameof(personId));
        }

        // Search through all user files to find the person
        var files = Directory.GetFiles(_tempDirectory, "*-acquaintances.json");
        
        foreach (var file in files)
        {
            try
            {
                var jsonContent = await File.ReadAllTextAsync(file);
                var userAcquaintances = JsonSerializer.Deserialize<UserAcquaintances>(jsonContent, _jsonOptions);
                
                if (userAcquaintances?.Acquaintances != null)
                {
                    var person = userAcquaintances.Acquaintances.FirstOrDefault(p => p.Id == personId);
                    if (person != null)
                    {
                        return person;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading acquaintances file {file}: {ex.Message}");
            }
        }

        return null;
    }

    /// <summary>
    /// Updates an existing acquaintance
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="person">The updated person information</param>
    /// <returns>True if successful, false if person not found</returns>
    public async Task<bool> UpdateAcquaintanceAsync(string userId, Person person)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException("User ID cannot be null or empty", nameof(userId));
        }

        if (person.Id == Guid.Empty)
        {
            throw new ArgumentException("Person ID cannot be empty", nameof(person));
        }

        var userAcquaintances = await LoadUserAcquaintancesAsync(userId);
        var existingPersonIndex = userAcquaintances.Acquaintances.FindIndex(p => p.Id == person?.Id);
        
        if (existingPersonIndex == -1)
        {
            return false;
        }

        userAcquaintances.Acquaintances[existingPersonIndex] = person;
        await SaveUserAcquaintancesAsync(userAcquaintances);

        Console.WriteLine($"Updated acquaintance {person.Name} (ID: {person.Id}) for user {userId}");
        return true;
    }

    /// <summary>
    /// Deletes an acquaintance from a user's list
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <param name="personId">The GUID of the person to delete</param>
    /// <returns>True if successful, false if person not found</returns>
    public async Task<bool> DeleteAcquaintanceAsync(string userId, Guid personId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException("User ID cannot be null or empty", nameof(userId));
        }

        if (personId == Guid.Empty)
        {
            throw new ArgumentException("Person ID cannot be empty", nameof(personId));
        }

        var userAcquaintances = await LoadUserAcquaintancesAsync(userId);
        var personToRemove = userAcquaintances.Acquaintances.FirstOrDefault(p => p.Id == personId);
        
        if (personToRemove == null)
        {
            return false;
        }

        userAcquaintances.Acquaintances.Remove(personToRemove);
        await SaveUserAcquaintancesAsync(userAcquaintances);

        Console.WriteLine($"Deleted acquaintance {personToRemove.Name} (ID: {personId}) for user {userId}");
        return true;
    }

    /// <summary>
    /// Gets all users who have acquaintances stored
    /// </summary>
    /// <returns>List of user IDs</returns>
    public List<string> GetAllUserIds()
    {
        var files = Directory.GetFiles(_tempDirectory, "*-acquaintances.json");
        var userIds = new List<string>();

        foreach (var file in files)
        {
            var fileName = Path.GetFileNameWithoutExtension(file);
            if (fileName.EndsWith("-acquaintances"))
            {
                var userId = fileName.Substring(0, fileName.Length - "-acquaintances".Length);
                userIds.Add(userId);
            }
        }

        return userIds.OrderBy(u => u).ToList();
    }

    /// <summary>
    /// Clears all acquaintances for a specific user
    /// </summary>
    /// <param name="userId">The user ID</param>
    /// <returns>True if successful, false otherwise</returns>
    public async Task<bool> ClearUserAcquaintancesAsync(string userId)
    {
        await Task.CompletedTask;
        if (string.IsNullOrWhiteSpace(userId))
        {
            throw new ArgumentException("User ID cannot be null or empty", nameof(userId));
        }

        var filePath = GetUserFilePath(userId);
        
        try
        {
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                Console.WriteLine($"Cleared all acquaintances for user {userId}");
            }
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error clearing acquaintances for user {userId}: {ex.Message}");
            return false;
        }
    }

    /// <summary>
    /// Clears all acquaintances for all users (for testing/cleanup)
    /// </summary>
    /// <returns>True if successful, false otherwise</returns>
    public bool ClearAllAcquaintances()
    {
        try
        {
            var files = Directory.GetFiles(_tempDirectory, "*-acquaintances.json");
            foreach (var file in files)
            {
                File.Delete(file);
            }
            Console.WriteLine("Cleared all acquaintances for all users");
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error clearing all acquaintances: {ex.Message}");
            return false;
        }
    }
}