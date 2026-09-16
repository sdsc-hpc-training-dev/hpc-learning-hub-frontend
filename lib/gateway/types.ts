export type GatewayListResponse<T> = T[] | GatewayListEnvelope<T>;

export interface GatewayListEnvelope<T> {
	data?: T[];
	items?: T[];
	results?: T[];
}

export interface GatewayMaterial {
	id: string;
	title: string;
	summary?: string | null;
	content_type?: string | null;
	contentType?: string | null;
	primary_url?: string | null;
	primaryUrl?: string | null;
	topics?: string[];
	systems?: string[];
	tools?: string[];
};

export interface GatewayLearningPath {
	id: string;
	name?: string;
	title?: string;
	description?: string | null;
	material_ids?: string[];
	materialIds?: string[];
};

export interface GatewayEvent {
	id: string;
	title?: string;
	name?: string;
	start_date?: string | null;
	startDate?: string | null;
	url?: string | null;
};

export interface GatewayProgram {
	id: string;
	name: string;
	eyebrow?: string | null;
	description?: string | null;
};
