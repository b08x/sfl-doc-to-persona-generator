
const parseTextFile = async (file: File): Promise<string> => {
    const fileReader = new FileReader();
    return new Promise((resolve, reject) => {
        fileReader.onload = (event) => {
             if (!event.target?.result) {
                return reject(new Error("Failed to read the text file."));
            }
            resolve(event.target.result as string);
        };
        fileReader.onerror = () => reject(new Error("Error reading file."));
        fileReader.readAsText(file);
    });
};


export const parseFile = async (file: File): Promise<string> => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.type === 'text/markdown' || file.name.endsWith('.md')) {
        return parseTextFile(file);
    }
    throw new Error('Unsupported file type. Please use .txt or .md files.');
};
