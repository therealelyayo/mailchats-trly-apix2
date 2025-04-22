import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';

interface ThemeConfig {
  variant: 'professional' | 'vibrant' | 'tint';
  primary: string;
  appearance: 'light' | 'dark' | 'system';
  radius: number;
  name: string;
}

const THEME_FILE_PATH = path.join(process.cwd(), 'theme.json');

/**
 * Updates the theme.json file with new theme settings
 */
export async function updateTheme(req: Request, res: Response) {
  try {
    const themeConfig: ThemeConfig = req.body;
    
    // Validate theme config
    if (!themeConfig || 
        !themeConfig.variant || 
        !themeConfig.primary || 
        !themeConfig.appearance || 
        themeConfig.radius === undefined ||
        !themeConfig.name) {
      return res.status(400).json({ error: 'Invalid theme configuration' });
    }
    
    // Write to theme.json
    fs.writeFileSync(
      THEME_FILE_PATH,
      JSON.stringify(themeConfig, null, 2),
      'utf8'
    );
    
    return res.status(200).json({ message: 'Theme updated successfully' });
  } catch (error) {
    console.error('Error updating theme:', error);
    return res.status(500).json({ error: 'Failed to update theme' });
  }
}

/**
 * Gets the current theme settings from theme.json
 */
export async function getTheme(req: Request, res: Response) {
  try {
    if (fs.existsSync(THEME_FILE_PATH)) {
      const themeData = fs.readFileSync(THEME_FILE_PATH, 'utf8');
      const themeConfig = JSON.parse(themeData);
      return res.status(200).json(themeConfig);
    } else {
      return res.status(404).json({ error: 'Theme file not found' });
    }
  } catch (error) {
    console.error('Error reading theme:', error);
    return res.status(500).json({ error: 'Failed to read theme' });
  }
}