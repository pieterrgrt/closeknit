// SPDX-FileCopyrightText: 2026 Aldus Lab and Closeknit contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Sample content for the clickable demo. Everything is fictional and lives in
 * the browser only; the real data model arrives with milestones M2 and M3.
 * The demo is Dutch-only; translations arrive with M1.
 */

export type Accent = 'groen' | 'blauw' | 'baksteen' | 'pruim' | 'oker';

export const accents: { id: Accent; label: string }[] = [
	{ id: 'groen', label: 'Groen' },
	{ id: 'blauw', label: 'Blauw' },
	{ id: 'baksteen', label: 'Baksteen' },
	{ id: 'pruim', label: 'Pruim' },
	{ id: 'oker', label: 'Oker' }
];

export interface Person {
	name: string;
	unit: string;
}

export const me: Person = { name: 'Jij', unit: '3e' };

export const group = {
	name: 'Marchlewski 63',
	place: 'Berlin-Friedrichshain',
	members: 48,
	dateLine: 'Zaterdag 24 oktober'
};

export const subgroups = [
	{ id: 'gebouw', name: 'Hele gebouw' },
	{ id: '3e', name: '3e verdieping' },
	{ id: 'tuin', name: 'Tuingroep' }
] as const;

export type SubgroupId = (typeof subgroups)[number]['id'];

export const announcement = {
	from: 'Van de beheerder',
	title: 'Water afgesloten di 27 okt, 9–12 uur',
	body: 'Vul vooraf een pan of fles. De lift blijft werken.'
};

export interface EventItem {
	id: string;
	weekday: string;
	day: string;
	month: string;
	title: string;
	time: string;
	place: string;
	description: string;
	attendees: string[];
	attending: boolean;
}

export const events: EventItem[] = [
	{
		id: 'borrel',
		weekday: 'do',
		day: '29',
		month: 'okt',
		title: 'Borrel op het dak',
		time: '19:00',
		place: 'Dakterras',
		description: 'Neem iets te drinken mee. Bij regen in de gemeenschappelijke ruimte.',
		attendees: ['Mira', 'Jonas', 'Lena', 'Sam', 'Ada', 'Tomasz'],
		attending: true
	},
	{
		id: 'schoonmaak',
		weekday: 'za',
		day: '31',
		month: 'okt',
		title: 'Schoonmaakdag fietsenkelder',
		time: '10:00',
		place: 'Kelder',
		description: 'We ruimen samen op. Fietsen zonder label gaan naar de kringloop.',
		attendees: ['Sanne', 'Sam'],
		attending: false
	},
	{
		id: 'vergadering',
		weekday: 'di',
		day: '3',
		month: 'nov',
		title: 'Bewonersvergadering',
		time: '20:00',
		place: 'Gemeenschappelijke ruimte',
		description: 'Op de agenda: de nieuwe sloten, de tuin en de kerstborrel.',
		attendees: ['Sanne', 'Mira', 'Ada'],
		attending: false
	}
];

export interface Comment {
	author: string;
	body: string;
}

export interface Post {
	id: string;
	author: string;
	unit: string;
	when: string;
	subgroup: SubgroupId;
	title: string;
	body: string;
	photo?: string;
	pinned?: boolean;
	liked: string[];
	comments: Comment[];
}

export const posts: Post[] = [
	{
		id: 'fietsenkelder',
		author: 'Sanne',
		unit: 'beheerder',
		when: '2 weken geleden',
		subgroup: 'gebouw',
		title: 'Huisregels voor de fietsenkelder',
		body: 'Fietsen zonder label gaan op 1 december naar de kringloop. Labels liggen bij de brievenbussen.',
		pinned: true,
		liked: [],
		comments: []
	},
	{
		id: 'pakketje',
		author: 'Mira',
		unit: '1e',
		when: 'vandaag 11:20',
		subgroup: 'gebouw',
		title: 'Pakketje voor Weber aangenomen',
		body: 'Ligt bij mij, nummer 4. Ik ben vanavond na zessen thuis.',
		liked: ['Weber'],
		comments: [{ author: 'Weber', body: 'Dank je wel! Ik kom het om zeven uur halen.' }]
	},
	{
		id: 'ladder',
		author: 'Jonas',
		unit: '3e',
		when: 'gisteren',
		subgroup: '3e',
		title: 'Wie heeft er een ladder van 3 meter?',
		body: 'De lamp in het trappenhuis bij de 3e is kapot. Ik vervang hem wel, als iemand een ladder heeft.',
		photo: 'Lamp in het trappenhuis',
		liked: ['Lena', 'Mira'],
		comments: [
			{ author: 'Lena', body: 'Staat in de kelder, box 12. Code weet je.' },
			{ author: 'Jonas', body: 'Top, ik pak hem vanavond.' }
		]
	},
	{
		id: 'tomaten',
		author: 'Ada',
		unit: 'begane grond',
		when: 'maandag',
		subgroup: 'tuin',
		title: 'Laatste tomaten van het seizoen',
		body: 'Er hangen nog een paar trossen in de bak bij de achterdeur. Pak gerust.',
		liked: ['Sam'],
		comments: []
	}
];

export type ItemKind = 'lenen' | 'weggeven';

export interface Item {
	id: string;
	title: string;
	kind: ItemKind;
	owner: string;
	unit: string;
	note: string;
	requested: boolean;
}

export const items: Item[] = [
	{
		id: 'boor',
		title: 'Boormachine',
		kind: 'lenen',
		owner: 'Lena',
		unit: '4e',
		note: 'Met klopstand en een doos boortjes.',
		requested: false
	},
	{
		id: 'ladder',
		title: 'Ladder, 3 meter',
		kind: 'lenen',
		owner: 'Lena',
		unit: '4e',
		note: 'Staat in de kelder, box 12.',
		requested: false
	},
	{
		id: 'fietsje',
		title: 'Kinderfietsje',
		kind: 'weggeven',
		owner: 'Sam',
		unit: '2e',
		note: '16 inch, met zijwieltjes. Ophalen op de 2e.',
		requested: false
	},
	{
		id: 'raclette',
		title: 'Raclette-set',
		kind: 'lenen',
		owner: 'Mira',
		unit: '1e',
		note: 'Voor acht personen.',
		requested: false
	}
];

export interface PollOption {
	id: string;
	label: string;
	votes: number;
}

export const poll = {
	question: 'Nieuwe sloten op de fietsenkelder?',
	closes: 'sluit vrijdag',
	options: [
		{ id: 'code', label: 'Ja, met een code', votes: 9 },
		{ id: 'sleutel', label: 'Ja, met een sleutel', votes: 4 },
		{ id: 'nee', label: 'Nee, laat zo', votes: 3 }
	] as PollOption[]
};

export interface Message {
	id: string;
	author: string;
	unit: string;
	time: string;
	body: string;
	thread?: Comment[];
}

export interface Channel {
	id: string;
	name: string;
	members: number;
	note: string;
	messages: Message[];
}

export const channels: Channel[] = [
	{
		id: 'gebouw',
		name: 'Hele gebouw',
		members: 48,
		note: 'Iedereen in het gebouw',
		messages: [
			{
				id: 'g1',
				author: 'Sanne',
				unit: 'beheerder',
				time: '09:12',
				body: 'De glasbak achter is weer geleegd. Graag geen dozen ernaast zetten.'
			},
			{
				id: 'g2',
				author: 'Tomasz',
				unit: '5e',
				time: '10:40',
				body: 'Iemand een tip voor een goede fietsenmaker in de buurt?',
				thread: [
					{ author: 'Ada', body: 'Radhaus in de Kopernikusstraße, snel en niet duur.' },
					{ author: 'Tomasz', body: 'Dank je!' }
				]
			}
		]
	},
	{
		id: '3e',
		name: '3e verdieping',
		members: 8,
		note: 'Alleen zichtbaar voor deze verdieping',
		messages: [
			{
				id: 'd1',
				author: 'Lena',
				unit: '4e',
				time: '18:02',
				body: 'Ruikt iemand anders ook gas bij de lift?',
				thread: [
					{ author: 'Mira', body: 'Ik ruik het ook, ik bel de netbeheerder.' },
					{ author: 'Jonas', body: 'Ik zet de ramen in het trappenhuis open.' },
					{ author: 'Mira', body: 'Ze komen binnen een uur.' }
				]
			},
			{
				id: 'd2',
				author: 'Jonas',
				unit: '3e',
				time: '18:20',
				body: 'Netbeheerder is geweest, was de afvoer van nummer 9. Alles veilig.'
			},
			{
				id: 'd3',
				author: 'Jij',
				unit: '3e',
				time: '18:24',
				body: 'Dank je! Iemand zin in soep? Ik heb te veel gemaakt.'
			},
			{
				id: 'd4',
				author: 'Mira',
				unit: '1e',
				time: '18:31',
				body: 'Ja graag, ik kom zo een kom halen.'
			}
		]
	},
	{
		id: 'tuin',
		name: 'Tuingroep',
		members: 6,
		note: 'Werkgroep voor de binnentuin',
		messages: [
			{
				id: 't1',
				author: 'Ada',
				unit: 'begane grond',
				time: 'gisteren',
				body: 'Zaterdag bollen planten? Ik heb er honderd gekocht.'
			}
		]
	}
];
