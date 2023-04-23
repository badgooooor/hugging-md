import type { App, MarkdownPostProcessorContext } from "obsidian";
import { InjectedMarkdown } from "./InjectedMarkdown";
import type { BaseInjectedMarkdown } from "src/interfaces";
import TestResult from "src/components/Summarization.svelte";

interface InjectingSummarizationResult extends BaseInjectedMarkdown {
	result: string;
}

export class SummaryMarkdown {
	private app: App;

	constructor(app: App) {
		this.app = app;
	}

	public onNewBlock(
		result: string,
		el: HTMLElement,
		ctx: MarkdownPostProcessorContext
	) {
		const pendingResult: InjectingSummarizationResult = {
			result: result,
			target: el,
			ctx: ctx,
		};
		console.log("pending", pendingResult);

		this.injectMarkdown(pendingResult);
	}

	private injectMarkdown(injectingResult: InjectingSummarizationResult) {
		const child = new InjectedMarkdown(
			injectingResult.target,
			(root: HTMLElement) => {
				return new TestResult({
					target: root,
					props: {
						result: injectingResult.result,
					},
				});
			}
		);
		console.log("inject", child);

		injectingResult.ctx.addChild(child);
	}
}
