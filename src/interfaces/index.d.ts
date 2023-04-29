import type { MarkdownPostProcessorContext } from "obsidian";

export type ActionType =
	| "summarization"
	| "token-classification"
	| "text-generation"
	| undefined;

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

export interface BaseInjectedMarkdown {
	target: HTMLElement;
	ctx: MarkdownPostProcessorContext;
}
