using EducationalPlatform.Application.Interfaces.Services;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Concurrent;
using System.Linq;
using System.Threading.Tasks;

namespace EducationalPlatform.Infrastructure.Services
{
    public class MemoryCacheService : ICacheService
    {
        private readonly IMemoryCache _memoryCache;
        private static readonly ConcurrentDictionary<string, byte> _cacheKeys = new();
        private static readonly TimeSpan DefaultExpiration = TimeSpan.FromMinutes(15);

        public MemoryCacheService(IMemoryCache memoryCache)
        {
            _memoryCache = memoryCache;
        }

        public Task<T?> GetAsync<T>(string key)
        {
            if (string.IsNullOrWhiteSpace(key)) return Task.FromResult<T?>(default);

            if (_memoryCache.TryGetValue<T>(key, out var value))
            {
                return Task.FromResult<T?>(value);
            }

            return Task.FromResult<T?>(default);
        }

        public Task SetAsync<T>(string key, T value, TimeSpan? expiration = null)
        {
            if (string.IsNullOrWhiteSpace(key) || value == null) return Task.CompletedTask;

            var options = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration ?? DefaultExpiration
            };

            // Remove key from index when entry expires or is evicted
            options.RegisterPostEvictionCallback((evictedKey, _, _, _) =>
            {
                _cacheKeys.TryRemove(evictedKey.ToString() ?? string.Empty, out _);
            });

            _memoryCache.Set(key, value, options);
            _cacheKeys.TryAdd(key, 0);

            return Task.CompletedTask;
        }

        public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null)
        {
            if (string.IsNullOrWhiteSpace(key)) return await factory();

            if (_memoryCache.TryGetValue<T>(key, out var cachedValue) && cachedValue != null)
            {
                return cachedValue;
            }

            var result = await factory();
            if (result != null)
            {
                await SetAsync(key, result, expiration);
            }

            return result;
        }

        public Task RemoveAsync(string key)
        {
            if (string.IsNullOrWhiteSpace(key)) return Task.CompletedTask;

            _memoryCache.Remove(key);
            _cacheKeys.TryRemove(key, out _);

            return Task.CompletedTask;
        }

        public Task RemoveByPrefixAsync(string prefix)
        {
            if (string.IsNullOrWhiteSpace(prefix)) return Task.CompletedTask;

            var matchingKeys = _cacheKeys.Keys.Where(k => k.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)).ToList();

            foreach (var key in matchingKeys)
            {
                _memoryCache.Remove(key);
                _cacheKeys.TryRemove(key, out _);
            }

            return Task.CompletedTask;
        }
    }
}
