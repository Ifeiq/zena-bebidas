/** Opcional: caminho em `public`, ex.: `/produtos/coca-lata-350.jpg` */
export type MenuItem = {
	id: string;
	name: string;
	volume: string;
	price: number;
	image?: string;
};

export const menuLeft: MenuItem[] = [
	{ id: 'coca-lata-350', name: 'Coca Lata', volume: '350 ml', price: 5 },
	{ id: 'guarana-lata-350', name: 'Guarana Lata', volume: '350 ml', price: 5 },
	{ id: 'pepsi-lata-350', name: 'Pepsi Lata', volume: '350 ml', price: 5 },
	{ id: 'agua-coco-200', name: 'Água de Coco', volume: '200 ml', price: 4 },
	{ id: 'agua-coco-1l', name: 'Água de Coco', volume: '1 L', price: 12 },
	{ id: 'agua-gas-550', name: 'Água c/ Gás', volume: '550 ml', price: 3 },
	{ id: 'agua-sem-gas-550', name: 'Água s/ Gás', volume: '550 ml', price: 3 },
	{ id: 'schweppes-350', name: 'Schweppes', volume: '350 ml', price: 5 },
	{ id: 'redbull-250', name: 'Redbull', volume: '250 ml', price: 10 },
	{ id: 'redbull-355', name: 'Redbull', volume: '355 ml', price: 14 },
];

export const menuRight: MenuItem[] = [
	{ id: 'redbull-473', name: 'Redbull', volume: '473 ml', price: 17 },
	{ id: 'h2oh-500', name: 'H2OH!', volume: '500 ml', price: 6 },
	{ id: 'monster-473', name: 'Monster', volume: '473 ml', price: 12 },
	{ id: 'gatorade-500', name: 'Gatorade', volume: '500 ml', price: 6 },
	{ id: 'coca-25l', name: 'Coca Cola', volume: '2,5 L', price: 14 },
	{ id: 'coca-2l', name: 'Coca Cola', volume: '2 L', price: 12 },
	{ id: 'coca-15l', name: 'Coca Cola', volume: '1,5 L', price: 10 },
	{ id: 'sukita-2l', name: 'Sukita', volume: '2 L', price: 9 },
	{ id: 'kuat-2l', name: 'Kuat', volume: '2 L', price: 9 },
	{ id: 'guarana-antartica-2l', name: 'Guarana Antartica', volume: '2 L', price: 10 },
	{ id: 'guarana-antartica-1l', name: 'Guarana Antartica', volume: '1 L', price: 7 },
];

export const allMenuItems: MenuItem[] = [...menuLeft, ...menuRight];

export function itemById(id: string): MenuItem | undefined {
	return allMenuItems.find((i) => i.id === id);
}
