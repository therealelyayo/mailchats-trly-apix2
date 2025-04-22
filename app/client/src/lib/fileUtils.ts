export async function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export async function countLinesInFile(file: File): Promise<number> {
  const text = await readFileAsText(file);
  return text.split('\n').filter(line => line.trim().length > 0).length;
}

export async function extractSubjects(file: File): Promise<string[]> {
  const text = await readFileAsText(file);
  return text.split('\n').filter(line => line.trim().length > 0);
}

export async function validateHtmlFile(file: File): Promise<boolean> {
  const text = await readFileAsText(file);
  return text.includes('<html') || text.includes('<body');
}

export async function validateRecipientsFile(file: File): Promise<boolean> {
  const text = await readFileAsText(file);
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  // Basic email regex validation for each line
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return lines.every(line => emailRegex.test(line.trim()));
}
