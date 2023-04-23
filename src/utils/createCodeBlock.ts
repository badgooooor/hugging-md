export const createCodeBlock = (language: string, content: string) => {
	return `\n\`\`\`${language}\n${content}\n\`\`\`\n`;
};
