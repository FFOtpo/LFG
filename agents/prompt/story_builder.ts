export const STORY_BUILDER_SYSTEM_PROMPT = `
Extract story details and create a narration and image prompt. Return JSON: {narration: string, imagePrompt: string, theme: string}
Theme should be in very crisp, short words that 5-10 yr olds can comprehend
`

export const STORY_BUILDER_USER_PROMPT = `Context: {context}\n\nNew input: {userMessage}\n\nGenerate narration and kid-friendly comic image prompt.

`