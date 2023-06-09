import { HfInference } from "@huggingface/inference";
import {
	App,
	Editor,
	MarkdownView,
	Notice,
	Plugin,
	WorkspaceLeaf,
	type PluginManifest,
} from "obsidian";
import { HuggingMDSettingTab } from "./HuggingMDSettingTab";
import { ExampleView, VIEW_TYPE_EXAMPLE } from "./ItemView";
import type { ActionType, HuggingMDSettings } from "./interfaces";
import { SummaryMarkdown } from "./markdown/Summarization";
import { stringToHexColor } from "./utils";
import {
	SummarizationService,
	TextGenerationService,
	TokenClassificationService,
} from "./services";

const DEFAULT_SETTINGS: HuggingMDSettings = {
	apiKey: "hf_...",
	defaultModel: {
		summarization: "facebook/bart-large-cnn",
		tokenClassification:
			"Davlan/distilbert-base-multilingual-cased-ner-hrl",
		textGeneration: "gpt2-medium",
	},
	tokenClassification: {
		replaceResult: true,
	},
};

export default class HuggingMD extends Plugin {
	settings: HuggingMDSettings;
	hf: HfInference;

	latestAction: ActionType;
	private readonly testResult: SummaryMarkdown;

	// Test example view.
	private view: ExampleView;

	constructor(app: App, pluginManifest: PluginManifest) {
		super(app, pluginManifest);

		this.testResult = new SummaryMarkdown(app);
	}

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
				this.latestAction = "summarization";

				const selectedText = editor.getSelection();

				new Notice(`Sending inputs to HuggingFace for summarize.`);

				try {
					const service = new SummarizationService(
						this.settings.apiKey,
						this.settings.defaultModel.summarization
					);

					const summaryText = await service.summarize(selectedText);

					editor.replaceRange(
						`\n\n🤖 : ***${summaryText}***\n\n`,
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
				this.latestAction = "token-classification";
				const selectedText = editor.getSelection();

				new Notice(
					`Sending inputs to HuggingFace for extracting token.`
				);

				try {
					const service = new TokenClassificationService(
						this.settings.apiKey,
						this.settings.defaultModel.tokenClassification
					);

					const response = await service.extract(selectedText);

					const wordList = response.map((item) => item.word);
					const splitedText = selectedText.split(" ");

					const resultText = splitedText
						.map((text) => {
							const wordIndex = wordList.indexOf(text);
							const hexColor = stringToHexColor(text);
							if (wordIndex !== -1)
								return `<span style="background-color:${hexColor}">${text} [${response[wordIndex].entity_group}]</span>`;

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

		this.addCommand({
			id: "text-generation-command",
			name: "Generate text from selected text",
			editorCallback: async (editor: Editor) => {
				this.latestAction = "text-generation";
				const selectedText = editor.getSelection();

				new Notice(
					`Sending inputs to HuggingFace for generating text.`
				);

				try {
					const service = new TextGenerationService(
						this.settings.apiKey,
						this.settings.defaultModel.textGeneration
					);

					const response = await service.generate(selectedText);
					editor.replaceSelection(response);
				} catch (err) {
					new Notice("Error during requesting.");
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
