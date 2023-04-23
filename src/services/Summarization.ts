import { HfInference } from "@huggingface/inference";

export class SummarizationService {
	private hf: HfInference;
	private originalText: string;
	private model: string;
	private result: string;

	constructor(apiKey: string, model: string) {
		this.hf = new HfInference(apiKey);
		this.model = model;
	}

	public async summarize(inputs: string): Promise<string> {
		this.originalText = inputs;

		const { summary_text } = await this.hf.summarization({
			inputs: this.originalText,
			model: this.model,
		});

		this.result = summary_text;
		return summary_text;
	}

	public set setModel(model: string) {
		this.model = model;
	}

	public get latestResult() {
		return this.result;
	}
}
