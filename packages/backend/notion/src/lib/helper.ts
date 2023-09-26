export const getDatabaseId = (databaseUrl: string) => {
    const pattern = /https:\/\/www\.notion\.so\/([a-f0-9]+)\?/;

    // Use the RegExp.exec() method to find the match in the URL
    const match = pattern.exec(databaseUrl);

    // If a match is found, return the captured ID group (first capturing group)
    if (match && match[1]) {
        return match[1];
    }

    // Return null if no match is found
    return '';
}
