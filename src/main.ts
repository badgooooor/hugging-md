import { HfInference } from "@huggingface/inference";
import { Editor, MarkdownView, Notice, Plugin, WorkspaceLeaf } from "obsidian";
import { HuggingMDSettingTab } from "./HuggingMDSettingTab";
import { ExampleView, VIEW_TYPE_EXAMPLE } from "./ItemView";

const DEFAULT_SETTINGS: HuggingMDSettings = {
	apiKey: "hf_...",
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
