import { HfInference } from "@huggingface/inference";
import { Editor, MarkdownView, Notice, Plugin } from "obsidian";
import { HuggingMDSettingTab } from "src/HuggingMDSettingTab";

const DEFAULT_SETTINGS: HuggingMDSettings = {
	apiKey: "hf_...",
};

export default class HuggingMD extends Plugin {
	settings: HuggingMDSettings;
	hf: HfInference;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "summarization-command",
			name: "Add Summarization command",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const selectedText = editor.getSelection();

				new Notice(`Sending inputs to HuggingFace for summarize.`);

				const response = await this.hf.summarization({
					model: "facebook/bart-large-cnn",
					inputs: selectedText,
				});
				editor.replaceRange(
					`\n\n🤖 : ***${response.summary_text}***\n\n`,
					editor.getCursor("to")
				);

				new Notice(`Summarized requested content.`);
			},
		});

		this.addSettingTab(new HuggingMDSettingTab(this.app, this));

		this.registerDomEvent(document, "click", (evt: MouseEvent) => {
			console.log("click", evt);
		});

		this.registerInterval(
			window.setInterval(() => console.log("setInterval"), 5 * 60 * 1000)
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);

		this.hf = new HfInference(this.settings.apiKey);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
