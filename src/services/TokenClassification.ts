import {
	HfInference,
	type TokenClassificationReturnValue,
} from "@huggingface/inference";

export class TokenClassificationService {
	private hf: HfInference;
	private originalText: string;
	private model: string;
	private result: TokenClassificationReturnValue[];

	constructor(apiKey: string, model: string) {
		this.hf = new HfInference(apiKey);
		this.model = model;
	}

	public async extract(
		inputs: string
	): Promise<TokenClassificationReturnValue[]> {
		this.originalText = inputs;

		const tokens = await this.hf.tokenClassification({
			model: this.model,
			inputs: this.originalText,
		});
		this.result = tokens;
		return this.result;
	}
}
