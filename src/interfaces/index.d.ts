export type ActionType = "summarization" | "token-classification" | undefined;

export interface HuggingMDSettings {
	apiKey: string;
	defaultModel: {
		summarization: string;
		tokenClassification: string;
	};
	tokenClassification: {
		replaceResult: boolean;
	};
}
