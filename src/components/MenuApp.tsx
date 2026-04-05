import { useMemo, useState } from 'react';
import { allMenuItems, menuLeft, menuRight, type MenuItem } from '@/data/menu';
import { supabase, supabaseConfigured } from '@/lib/supabase';

function formatBRL(value: number): string {
	return value.toLocaleString('pt-BR', {
		style: 'currency',
		currency: 'BRL',
	});
}

function ProductRow({
	item,
	qty,
	onAdd,
	onRemove,
}: {
	item: MenuItem;
	qty: number;
	onAdd: () => void;
	onRemove: () => void;
}) {
	return (
		<li className="border-b border-yellow-500/25 pb-3 pt-2 first:pt-0 max-lg:px-8">
			<div className="flex gap-3 sm:gap-4">
				<div className="min-w-0 flex-1">
					<p className="font-semibold leading-tight text-white">{item.name}</p>
					<p className="mt-0.5 text-sm font-medium text-[#f4d03f]">{item.volume}</p>
					<div className="mt-2 flex items-end gap-2">
						<span
							className="min-h-[1px] min-w-0 flex-1 border-b border-dotted border-[#b8860b]/70"
							aria-hidden
						/>
						<span className="shrink-0 text-sm font-semibold tabular-nums text-white">
							{formatBRL(item.price)}
						</span>
					</div>
				</div>
				<div className="flex shrink-0 flex-col items-center gap-2">
					{/* {item.image ? (
						<img
							src={item.image}
							alt=""
							className="h-16 w-16 rounded-lg border-2 border-[#d4af37]/60 object-cover"
							loading="lazy"
						/>
					) : (
						<div
							className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-[#d4af37]/60 bg-zinc-950 text-[10px] uppercase tracking-wide text-zinc-500"
							aria-hidden
						>
							Foto
						</div>
					)} */}
					<div className="flex items-center gap-1.5">
						<button
							type="button"
							onClick={onRemove}
							disabled={qty === 0}
							className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d4af37] bg-black text-lg font-bold text-[#f4d03f] transition hover:bg-yellow-500/10 disabled:cursor-not-allowed disabled:opacity-35"
							aria-label={`Remover ${item.name}`}
						>
							−
						</button>
						<span className="min-w-[1.25rem] text-center text-sm font-bold tabular-nums text-white">
							{qty}
						</span>
						<button
							type="button"
							onClick={onAdd}
							className="flex h-8 w-8 items-center justify-center rounded-md border border-[#d4af37] bg-black text-lg font-bold text-[#f4d03f] transition hover:bg-yellow-500/10"
							aria-label={`Adicionar ${item.name}`}
						>
							+
						</button>
					</div>
				</div>
			</div>
		</li>
	);
}

/** Chave: nome legível do item; valor: quantidade (JSON no Supabase). */
function buildOrderItemsJson(
	items: MenuItem[],
	quantities: Record<string, number>,
): Record<string, number> {
	const out: Record<string, number> = {};
	for (const item of items) {
		const q = quantities[item.id] ?? 0;
		if (q > 0) {
			const label = `${item.name} (${item.volume})`;
			out[label] = q;
		}
	}
	return out;
}

export default function MenuApp() {
	const [quantities, setQuantities] = useState<Record<string, number>>({});
	const [customerName, setCustomerName] = useState('');
	const [savingOrder, setSavingOrder] = useState(false);

	const total = useMemo(() => {
		let sum = 0;
		for (const item of allMenuItems) {
			const q = quantities[item.id] ?? 0;
			sum += item.price * q;
		}
		return sum;
	}, [quantities]);

	const setQty = (id: string, delta: number) => {
		setQuantities((prev) => {
			const next = { ...prev };
			const current = next[id] ?? 0;
			const n = Math.max(0, current + delta);
			if (n === 0) delete next[id];
			else next[id] = n;
			return next;
		});
	};

	const finalize = async () => {
		const trimmed = customerName.trim();
		if (!trimmed) {
			window.alert('Informe seu nome para finalizar o pedido.');
			return;
		}

		const itemsJson = buildOrderItemsJson(allMenuItems, quantities);
		if (Object.keys(itemsJson).length === 0) {
			window.alert('Adicione pelo menos um item ao pedido.');
			return;
		}

		if (!supabaseConfigured) {
			window.alert(
				'Configure PUBLIC_SUPABASE_URL e PUBLIC_SUPABASE_ANON_KEY no arquivo .env para registrar pedidos.',
			);
			return;
		}

		setSavingOrder(true);
		const { error } = await supabase.from('pedidos').insert({
			Nome: trimmed,
			Itens: itemsJson,
		});
		setSavingOrder(false);

		if (error) {
			window.alert(
				`Não foi possível registrar o pedido: ${error.message}. Tente de novo.`,
			);
			return;
		}

		window.alert('Pedido registrado com sucesso!');
		setQuantities({});
		setCustomerName('');
	};

	return (
		<div className="menu-root min-h-screen bg-black pb-36 text-white max-lg:px-4">
			

			<div className="mx-auto max-w-5xl px-3 pt-6 sm:px-6">
				<div className="rounded-3xl border-x-[6px] border-4 border-[#e8c547] p-16  sm:px-4">
					<div className="grid gap-8 md:grid-cols-[1fr_auto_1fr] md:gap-0 md:items-start">
						<section aria-label="Bebidas">
							<h2 className="sr-only">Lista esquerda</h2>
							<ul className="space-y-0">
								{menuLeft.map((item) => (
									<ProductRow
										key={item.id}
										item={item}
										qty={quantities[item.id] ?? 0}
										onAdd={() => setQty(item.id, 1)}
										onRemove={() => setQty(item.id, -1)}
									/>
								))}
							</ul>
						</section>

						<div
							className="my-4 flex items-center gap-3 md:hidden"
							aria-hidden
						>
							<div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8c547]/80 to-transparent" />
							<span className="text-2xl drop-shadow-[0_0_8px_rgba(244,208,63,0.5)]">🍺</span>
							<div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#e8c547]/80 to-transparent" />
						</div>

						<div
							className="hidden md:flex md:w-10 md:flex-col md:items-center md:self-stretch"
							aria-hidden
						>
							<div className="flex h-full w-px flex-1 bg-gradient-to-b from-[#e8c547] via-[#f4d03f] to-[#b8860b]" />
							<span className="my-2 text-2xl drop-shadow-[0_0_8px_rgba(244,208,63,0.6)]">
								🍺
							</span>
							<div className="flex h-full w-px flex-1 bg-gradient-to-b from-[#b8860b] via-[#f4d03f] to-[#e8c547]" />
						</div>

						<section aria-label="Mais bebidas">
							<h2 className="sr-only">Lista direita</h2>
							<ul className="space-y-0">
								{menuRight.map((item) => (
									<ProductRow
										key={item.id}
										item={item}
										qty={quantities[item.id] ?? 0}
										onAdd={() => setQty(item.id, 1)}
										onRemove={() => setQty(item.id, -1)}
									/>
								))}
							</ul>
						</section>
					</div>
				</div>
			</div>

			<div
				className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#d4af37]/50 bg-zinc-950/95 px-4 pt-3 shadow-[0_-8px_32px_rgba(0,0,0,0.65)] backdrop-blur-md"
				style={{
					paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))',
				}}
			>
				<div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
					<label className="block min-w-0 w-full sm:max-w-xs">
						<span className="text-xs font-medium text-[#f4d03f]">Seu nome</span>
						<input
							type="text"
							value={customerName}
							onChange={(e) => setCustomerName(e.target.value)}
							placeholder="Como devemos te chamar?"
							className="mt-1 w-full rounded-lg border border-yellow-600/50 bg-black px-3 py-2 text-white placeholder:text-zinc-600 focus:border-[#f4d03f] focus:outline-none focus:ring-1 focus:ring-[#f4d03f]"
							autoComplete="name"
						/>
					</label>
					<div className="flex w-full min-w-0 flex-row items-center max-lg:mt-4 justify-between gap-3 sm:w-auto sm:justify-end sm:gap-6">
						<div className="min-w-0 text-left">
							<p className="text-xs uppercase tracking-wide text-zinc-500">Total</p>
							<p className="text-xl font-bold tabular-nums text-[#f4d03f] sm:text-2xl">
								{formatBRL(total)}
							</p>
						</div>
						<button
							type="button"
							onClick={() => void finalize()}
							disabled={savingOrder}
							className="shrink-0 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#e8c547] px-4 py-2.5 text-sm font-bold text-black shadow-lg shadow-yellow-900/40 transition hover:brightness-110 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 sm:px-6 sm:py-3 sm:text-base"
						>
							{savingOrder ? 'Salvando…' : 'Finalizar pedido'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
