export class ContentFilter {
  static validateContent(content: string): boolean {
    // Add your content validation logic here
    // This is a basic example - enhance based on your needs
    const forbiddenWords = ['spam', 'abuse', 'hate'];
    const contentLowerCase = content.toLowerCase();

    return !forbiddenWords.some((word) => contentLowerCase.includes(word));
  }
}
