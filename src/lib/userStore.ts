import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';

// A writable store to hold the current user object
export const user = writable<User | null>(null);
