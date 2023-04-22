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
