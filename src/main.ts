import { HfInference } from "@huggingface/inference";
import { Editor, MarkdownView, Notice, Plugin, WorkspaceLeaf } from "obsidian";
import { HuggingMDSettingTab } from "./HuggingMDSettingTab";
import { ExampleView, VIEW_TYPE_EXAMPLE } from "./ItemView";
import type { HuggingMDSettings } from "./interfaces";

const DEFAULT_SETTINGS: HuggingMDSettings = {
	apiKey: "hf_...",
	defaultModel: {
		summarization: "facebook/bart-large-cnn",
		tokenClassification:
			"Davlan/distilbert-base-multilingual-cased-ner-hrl",
	},
	tokenClassification: {
		replaceResult: true,
	},
};

export default class HuggingMD extends Plugin {
	settings: HuggingMDSettings;
	hf: HfInference;

	// Test example view.
	private view: ExampleView;

	async onload() {
		await this.loadSettings();

		// Register view.
		this.registerView(
			VIEW_TYPE_EXAMPLE,
			(leaf: WorkspaceLeaf) => (this.view = new ExampleView(leaf))
		);

		// Add entry to view via icon in menu.
		this.addRibbonIcon("dice", "Activate view", () => {
			this.activateView();
		});

		this.addCommand({
			id: "summarization-command",
			name: "Summarize selected text",
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const selectedText = editor.getSelection();

				new Notice(`Sending inputs to HuggingFace for summarize.`);

				try {
					const { summary_text } = await this.hf.summarization({
						model: this.settings.defaultModel.summarization,
						inputs: selectedText,
					});

					editor.replaceRange(
						`\n\n🤖 [${this.settings.defaultModel.summarization}] : ***${summary_text}***\n\n`,
						editor.getCursor("to")
					);

					new Notice(`Summarized requested content.`);
				} catch (err) {
					new Notice(`Error during requesting.`);
				}
			},
		});

		this.addCommand({
			id: "token-classification-command",
			name: "Extract token from selected text",
			editorCallback: async (editor: Editor) => {
				const selectedText = editor.getSelection();

				new Notice(
					`Sending inputs to HuggingFace for extracting token.`
				);

				try {
					const response = await this.hf.tokenClassification({
						model: this.settings.defaultModel.tokenClassification,
						inputs: selectedText,
					});

					const wordList = response.map((item) => item.word);
					const splitedText = selectedText.split(" ");

					const resultText = splitedText
						.map((text) => {
							const wordIndex = wordList.indexOf(text);
							if (wordIndex !== -1) {
								return `<mark>${text} [${response[wordIndex].entity_group}]</mark>`;
							}

							return text;
						})
						.join(" ");

					if (this.settings.tokenClassification.replaceResult) {
						editor.replaceSelection(resultText);
					} else {
						editor.replaceRange(
							`\n\n🤖 [${this.settings.defaultModel.tokenClassification}] : ***${resultText}***\n\n`,
							editor.getCursor("to")
						);
					}
					new Notice(`Extract requested content.`);
				} catch (err) {
					new Notice(`Error during requesting.`);
				}
			},
		});

		this.addSettingTab(new HuggingMDSettingTab(this.app, this));
	}

	onunload() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);
	}

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

	// Open view.
	async activateView() {
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_EXAMPLE);

		await this.app.workspace.getRightLeaf(false).setViewState({
			type: VIEW_TYPE_EXAMPLE,
			active: true,
		});

		this.app.workspace.revealLeaf(
			this.app.workspace.getLeavesOfType(VIEW_TYPE_EXAMPLE)[0]
		);
	}
}
