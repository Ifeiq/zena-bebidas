import { useMemo, useState } from 'react';
import { allMenuItems, menuLeft, menuRight, type MenuItem } from '@/data/menu';

const WHATSAPP_E164 = '5519991193965';

function isMobileDevice(): boolean {
	return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
		typeof navigator !== 'undefined' ? navigator.userAgent : '',
	);
}

/**
 * Evita wa.me / api.whatsapp.com (tela "Abrir app").
 * — Celular: esquema `whatsapp://` abre o app direto.
 * — Desktop: WhatsApp Web com texto pré-preenchido (sem a landing do click-to-chat).
 */
function openWhatsAppWithText(phoneDigits: string, text: string): void {
	const encoded = encodeURIComponent(text);
	if (isMobileDevice()) {
		window.location.assign(
			`whatsapp://send?phone=${phoneDigits}&text=${encoded}`,
		);
		return;
	}
	window.open(
		`https://web.whatsapp.com/send?phone=${phoneDigits}&text=${encoded}`,
		'_blank',
		'noopener,noreferrer',
	);
}

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

export default function MenuApp() {
	const [quantities, setQuantities] = useState<Record<string, number>>({});
	const [customerName, setCustomerName] = useState('');

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

	const finalize = () => {
		const trimmed = customerName.trim();
		if (!trimmed) {
			window.alert('Informe seu nome para finalizar o pedido.');
			return;
		}
		const lines: string[] = [];
		for (const item of allMenuItems) {
			const q = quantities[item.id] ?? 0;
			if (q > 0) {
				const sub = item.price * q;
				lines.push(
					`• ${q}x ${item.name} (${item.volume}) — ${formatBRL(sub)}`,
				);
			}
		}
		if (lines.length === 0) {
			window.alert('Adicione pelo menos um item ao pedido.');
			return;
		}
		const body = [
			`Olá! Meu nome é *${trimmed}*.`,
			'',
			'*Pedido:*',
			...lines,
			'',
			`*Total: ${formatBRL(total)}*`,
		].join('\n');
		openWhatsAppWithText(WHATSAPP_E164, body);
	};

	return (
		<div className="menu-root min-h-screen bg-black pb-36 text-white max-lg:px-4">
			

			<div className="mx-auto max-w-5xl px-3 pt-6 sm:px-6">
				<div className="rounded-t-3xl border-x-[6px] border-t-4 border-[#e8c547] px-2 pb-8 pt-4 sm:px-4 md:px-6">
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

					<footer className="mt-10 grid gap-6 border-t border-yellow-500/30 pt-8 md:grid-cols-2">
						<div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-center md:justify-start">
							<div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-2xl border-4 border-[#e8c547] bg-black p-2">
								<span className="text-center text-[10px] leading-snug text-zinc-500">
									QR Code
									<br />
									(em breve)
								</span>
							</div>
							<div className="text-center sm:text-left">
								<p className="text-sm text-zinc-400">WhatsApp do pedido</p>
								<a
									href={`https://web.whatsapp.com/send?phone=${WHATSAPP_E164}`}
									className="mt-1 inline-flex items-center gap-2 font-semibold text-[#25D366]"
									target="_blank"
									rel="noreferrer"
									onClick={(e) => {
										if (isMobileDevice()) {
											e.preventDefault();
											window.location.assign(
												`whatsapp://send?phone=${WHATSAPP_E164}`,
											);
										}
									}}
								>
									<svg
										className="h-5 w-5 shrink-0"
										viewBox="0 0 24 24"
										fill="currentColor"
										aria-hidden
									>
										<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
									</svg>
									+55 19 99119-3965
								</a>
							</div>
						</div>
						<div
							className="relative overflow-hidden rounded-2xl border border-orange-400/40 bg-gradient-to-br from-orange-900/40 via-amber-900/30 to-orange-950/50 p-4"
							aria-hidden
						>
							<div className="pointer-events-none absolute inset-0 opacity-30 [background-image:repeating-linear-gradient(105deg,transparent,transparent_12px,rgba(244,208,63,0.08)_12px,rgba(244,208,63,0.08)_24px)]" />
							<p className="relative text-center text-sm font-medium text-orange-100/90">
								🍺 Obrigado pela preferência! 🍻
							</p>
						</div>
					</footer>
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
							onClick={finalize}
							className="shrink-0 rounded-xl bg-gradient-to-r from-[#c9a227] to-[#e8c547] px-4 py-2.5 text-sm font-bold text-black shadow-lg shadow-yellow-900/40 transition hover:brightness-110 active:scale-[0.99] sm:px-6 sm:py-3 sm:text-base"
						>
							Finalizar pedido
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
