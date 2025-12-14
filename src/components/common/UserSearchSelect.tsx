'use client';

import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import api from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface UserSearchSelectProps {
  value?: string;
  onValueChange: (userId: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
}

export function UserSearchSelect({
  value,
  onValueChange,
  placeholder = 'Select user...',
  searchPlaceholder = 'Search by name or email...',
  emptyMessage = 'No user found.',
  className,
}: UserSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch users based on search query
  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setUsers([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Try the user search endpoint
        const response = await api.get('/admin/users/search', {
          params: {
            q: searchQuery.trim(),
            limit: 20, // Limit results for performance
          },
        });

        // Handle different response formats
        if (response.data) {
          // Check if data is in response.data.data or response.data
          const usersData = response.data.data || response.data;

          if (Array.isArray(usersData)) {
            // Map the response to our User interface
            const mappedUsers: User[] = usersData.map((user: any) => ({
              id: user.id || user.userId,
              name:
                user.name ||
                user.fullName ||
                `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                'Unknown',
              email: user.email || '',
              role: user.role || user.userRole,
            }));
            setUsers(mappedUsers);
          } else {
            setUsers([]);
          }
        } else {
          setUsers([]);
        }
      } catch (error: any) {
        console.error('Error fetching users:', error);
        // If endpoint doesn't exist (404), try alternative endpoint
        if (error?.status === 404 || error?.status === 501) {
          try {
            // Try alternative endpoint pattern
            const altResponse = await api.get('/admin/users', {
              params: {
                search: searchQuery.trim(),
                limit: 20,
              },
            });

            const usersData = altResponse.data?.data || altResponse.data;
            if (Array.isArray(usersData)) {
              const mappedUsers: User[] = usersData.map((user: any) => ({
                id: user.id || user.userId,
                name:
                  user.name ||
                  user.fullName ||
                  `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
                  'Unknown',
                email: user.email || '',
                role: user.role || user.userRole,
              }));
              setUsers(mappedUsers);
            } else {
              setUsers([]);
            }
          } catch (altError: any) {
            console.error('Alternative endpoint also failed:', altError);
            setUsers([]);
            // Only show error if both endpoints fail and it's not a 404
            if (altError?.status !== 404 && altError?.status !== 501) {
              setError('Failed to search users. Please check backend configuration.');
            }
          }
        } else if (error?.status !== 401 && error?.status !== 403) {
          // Don't show error for auth issues, those are handled elsewhere
          setError('Failed to search users. Please try again.');
          setUsers([]);
        } else {
          setUsers([]);
        }
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const selectedUser = users.find((user) => user.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', !value && 'text-muted-foreground', className)}
        >
          {selectedUser
            ? `${selectedUser.name} (${selectedUser.email})`
            : value
              ? 'User selected'
              : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                {error ? (
                  <div className="p-4 text-sm text-destructive">{error}</div>
                ) : (
                  <CommandEmpty>
                    {searchQuery.length >= 2
                      ? emptyMessage
                      : 'Type at least 2 characters to search'}
                  </CommandEmpty>
                )}
                <CommandGroup>
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      onSelect={() => {
                        onValueChange(user.id);
                        setOpen(false);
                        setSearchQuery('');
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === user.id ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                        {user.role && (
                          <span className="text-xs text-muted-foreground">Role: {user.role}</span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
