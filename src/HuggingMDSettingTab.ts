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
	}
}
