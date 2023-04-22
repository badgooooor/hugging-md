import { App, PluginSettingTab, Setting } from "obsidian";
import type HuggingMD from "./main";

export class HuggingMDSettingTab extends PluginSettingTab {
	plugin: HuggingMD;

	constructor(app: App, plugin: HuggingMD) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "HuggingMD Setting." });

		// API key
		new Setting(containerEl)
			.setName("HuggingFace User Access token")
			.setDesc("Access token for Inference API with `read` role")
			.addText((text) =>
				text
					.setPlaceholder("hf_...")
					.setValue(this.plugin.settings.apiKey)
					.onChange(async (value) => {
						this.plugin.settings.apiKey = value;
						await this.plugin.saveSettings();
					})
			);

		// Summarization
		new Setting(containerEl)
			.setName("Default summarization model")
			.addDropdown((component) =>
				component
					.addOptions({
						"facebook/bart-large-cnn": "facebook/bart-large-cnn",
						"google/pegasus-cnn_dailymail":
							"google/pegasus-cnn_dailymail",
					})
					.setValue(this.plugin.settings.defaultModel.summarization)
					.onChange(async (value) => {
						this.plugin.settings.defaultModel.summarization = value;
						await this.plugin.saveSettings();
					})
			);

		// Token classification
		new Setting(containerEl)
			.setName("Default token classification model")
			.addDropdown((component) =>
				component
					.addOptions({
						"Davlan/distilbert-base-multilingual-cased-ner-hrl":
							"Davlan/distilbert-base-multilingual-cased-ner-hrl",
						"dslim/bert-base-NER": "dslim/bert-base-NER",
						"dbmdz/bert-large-cased-finetuned-conll03-english":
							"dbmdz/bert-large-cased-finetuned-conll03-english",
					})
					.setValue(
						this.plugin.settings.defaultModel.tokenClassification
					)
					.onChange(async (value) => {
						this.plugin.settings.defaultModel.tokenClassification =
							value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Replace token classification result")
			.addToggle((component) =>
				component
					.setValue(
						this.plugin.settings.tokenClassification.replaceResult
					)
					.onChange(async (value) => {
						this.plugin.settings.tokenClassification.replaceResult =
							value;
						await this.plugin.saveSettings();
					})
			);
	}
}
