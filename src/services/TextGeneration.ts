import { HfInference } from "@huggingface/inference";

export class TextGenerationService {
	private hf: HfInference;
	private originalText: string;
	private model: string;
	private result: string;

	constructor(apiKey: string, model: string) {
		this.hf = new HfInference(apiKey);
		this.model = model;
	}

	public async generate(inputs: string): Promise<string> {
		this.originalText = inputs;

		const { generated_text } = await this.hf.textGeneration({
			inputs: this.originalText,
			model: this.model,
		});

		this.result = generated_text;
		return generated_text;
	}

	public set setModel(model: string) {
		this.model = model;
	}

	public get latestResult() {
		return this.result;
	}
}
