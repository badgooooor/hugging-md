import { MarkdownRenderChild } from "obsidian";
import type { SvelteComponent } from "svelte/internal";

export class InjectedMarkdown extends MarkdownRenderChild {
	private readonly createComponent: (root: HTMLElement) => SvelteComponent;
	private component: SvelteComponent;

	constructor(
		container: HTMLElement,
		createComponent: (root: HTMLElement) => SvelteComponent
	) {
		super(container);
		this.createComponent = createComponent;
		this.containerEl = container;
	}

	onload(): void {
		this.component = this.createComponent(this.containerEl);
	}

	onunload(): void {
		if (this.component) this.component.$destroy();
	}
}
