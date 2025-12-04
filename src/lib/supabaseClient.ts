import { createClient } from '@supabase/supabase-js';
// Replace import.meta.env with SvelteKit's $env module
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Access environment variables using the imported values
const supabaseUrl = PUBLIC_SUPABASE_URL;
const supabaseAnonKey = PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
	throw new Error('Supabase URL and Key are missing from .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Helper: Uploads a video file to the 'reels' bucket
 * Returns the public URL of the uploaded file
 */
export const uploadVideoFile = async (file: File, userId: string) => {
	// Create a unique file path: userId/timestamp.mp4
	const fileExt = file.name.split('.').pop();
	const fileName = `${userId}/${Date.now()}.${fileExt}`;

	// 1. Upload
	const { error: uploadError } = await supabase.storage.from('reels').upload(fileName, file);

	if (uploadError) {
		throw uploadError;
	}

	// 2. Get Public URL
	const { data } = supabase.storage.from('reels').getPublicUrl(fileName);

	return data.publicUrl;
};
