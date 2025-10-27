/**
 * Checks if there are unpublished changes between draft and published config
 */
export function hasUnpublishedChanges(draft: unknown, published: unknown): boolean {
  try {
    const draftStr = JSON.stringify(draft ?? {});
    const publishedStr = JSON.stringify(published ?? {});
    return draftStr !== publishedStr;
  } catch {
    return true;
  }
}
