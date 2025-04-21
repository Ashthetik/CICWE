type NTAS_STATE_DTO = {
	"date": string,
	"title": string,
	"type": string,
	"description": string
	"notes"?: string[]
};

type NTAS_TERROR_DTO = {
	"threat_level": string | undefined,
	"threat_no"?: string,
	"description": string | undefined,
	"contacts": {
		"email"?: string,
		"emails"?: string[], // Redundancy
		"phone": object,
		"reporting_link": string,
		"address"?: string,
		"addresses"?: string[]
	},
	"guidelines": string[],
	"news": string[],
	"notes"?: string[]
};

export {
	NTAS_STATE_DTO,
	NTAS_TERROR_DTO
};
