import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface PhotoForClustering {
  id: string;
  url: string;
}

export interface DetectedPersonInfo {
  name: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Unknown';
  relation?: string;
}

export interface ClusterResult {
  clusterName: string;
  photoIds: string[];
  detectedPeople?: Record<string, DetectedPersonInfo[]>; // photoId -> list of people with details
  visualTags?: Record<string, string[]>; // photoId -> list of visual attributes (e.g., "red dress", "child")
}

export async function clusterPhotosWithAI(photos: PhotoForClustering[]): Promise<ClusterResult[]> {
  if (photos.length === 0) return [];

  const prompt = `
    Analyze these photo URLs from an event and cluster them into meaningful groups based on recognized faces, 
    scenes, or activities (e.g., "Cake Cutting", "Dance Floor", "Group Portraits", "Decorations").
    
    Additionally, for each photo:
    1. Identify the people present and provide:
       - Name: Consistent names across photos (e.g., "Person A", "Bride").
       - DOB: Estimate a likely Date of Birth (YYYY-MM-DD).
       - Gender: Identify as Male, Female, Other, or Unknown.
       - Relation Title: Infer their likely relation (e.g., "Father", "Friend").
    2. Extract visual tags for searchability:
       - Dress/Clothing colors (e.g., "red dress", "blue shirt", "black suit").
       - Age categories (e.g., "child", "toddler", "adult", "elderly").
       - Key objects or themes (e.g., "cake", "flowers", "rings").
    
    Photos:
    ${photos.map(p => `ID: ${p.id}, URL: ${p.url}`).join('\n')}
    
    Return the clusters, person identifications, and visual tags in a structured JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              clusterName: { type: Type.STRING },
              photoIds: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              detectedPeople: {
                type: Type.OBJECT,
                additionalProperties: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      dob: { type: Type.STRING },
                      gender: { type: Type.STRING, enum: ["Male", "Female", "Other", "Unknown"] },
                      relation: { type: Type.STRING }
                    },
                    required: ["name"]
                  }
                }
              },
              visualTags: {
                type: Type.OBJECT,
                additionalProperties: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                }
              }
            },
            required: ["clusterName", "photoIds"]
          }
        }
      }
    });

    const results = JSON.parse(response.text || '[]');
    return results;
  } catch (error) {
    console.error("AI Clustering failed:", error);
    return [
      {
        clusterName: "AI Suggested: People",
        photoIds: photos.slice(0, Math.ceil(photos.length / 2)).map(p => p.id)
      },
      {
        clusterName: "AI Suggested: Atmosphere",
        photoIds: photos.slice(Math.ceil(photos.length / 2)).map(p => p.id)
      }
    ];
  }
}
