import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/** Só cria o cliente quando há URL e chave (evita erro no `astro build` sem variáveis de ambiente). */
export function getSupabase(): SupabaseClient {
	if (!url || !anonKey) {
		throw new Error(
			'Supabase não configurado: defina PUBLIC_SUPABASE_URL e PUBLIC_SUPABASE_ANON_KEY.',
		);
	}
	if (!client) {
		client = createClient(url, anonKey);
	}
	return client;
}
