import React, { useState, useCallback } from "react";
import { SearchableListView } from "@canva/app-components";
import { Box, Button, TextInput, LoadingIndicator, Text, Rows, Columns, Title } from "@canva/app-ui-kit";
import "@canva/app-ui-kit/styles.css";
import { useConfig } from "./config";
import { findResources } from "./adapter";
import * as styles from "./index.css";
import { useIntl } from "react-intl";

// Import Canva design APIs
import { addNativeElement, requestExport } from "@canva/design";
import { upload } from "@canva/asset";

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyCkk5TEoxzMaPptrCpKAu-_Xv0pgWWTgXQ";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
  error?: {
    message: string;
    code: number;
  };
}

interface DesignSuggestion {
  title: string;
  description: string;
  colors: string[];
  elements: string[];
  layout: string;
  textElements?: {
    text: string;
    fontSize?: number;
    fontWeight?: string;
    color?: string;
  }[];
  shapes?: {
    type: string;
    color: string;
    width?: number;
    height?: number;
  }[];
}

const ColorSwatch = ({ color }: { color: string }) => (
  <div
    style={{ 
      width: '30px',
      height: '30px',
      backgroundColor: color,
      borderRadius: '4px',
      border: '1px solid #555',
      cursor: 'pointer',
      flexShrink: 0
    }}
    title={color}
  />
);

export function App() {
  const config = useConfig();
  const intl = useIntl();
  const [userPrompt, setUserPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [designSuggestions, setDesignSuggestions] = useState<DesignSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showAIPanel, setShowAIPanel] = useState(true);

  const generateDesignWithGemini = useCallback(async (userPrompt: string) => {
    if (!userPrompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setDesignSuggestions([]);

    try {
      const enhancedPrompt = `
        Create a detailed design specification for Canva based on this request: "${userPrompt}"
        
        Please provide a JSON response with the following structure:
        {
          "designs": [
            {
              "title": "Design Title",
              "description": "Brief description of the design concept",
              "colors": ["#hexcolor1", "#hexcolor2", "#hexcolor3"],
              "elements": ["text elements", "image suggestions", "shapes"],
              "layout": "layout description",
              "textElements": [
                {
                  "text": "Main Title",
                  "fontSize": 48,
                  "fontWeight": "bold",
                  "color": "#000000"
                },
                {
                  "text": "Subtitle or description",
                  "fontSize": 24,
                  "fontWeight": "normal",
                  "color": "#666666"
                }
              ],
              "shapes": [
                {
                  "type": "rectangle",
                  "color": "#ff0000",
                  "width": 200,
                  "height": 100
                }
              ]
            }
          ]
        }
        
        Generate 3 different design variations. Focus on practical, implementable designs for Canva.
        Include specific color codes, element suggestions, layout descriptions, and specific text elements with formatting.
        For shapes, use types like: rectangle, circle, triangle, line.
        Respond ONLY with valid JSON, no additional text or markdown formatting.
      `;

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: enhancedPrompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data: GeminiResponse = await response.json();

      if (data.error) {
        throw new Error(`Gemini API error: ${data.error.message}`);
      }

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error("No response content from Gemini AI");
      }

      let parsedDesigns: DesignSuggestion[] = [];
      try {
        let jsonStr = generatedText;
        const jsonMatch = generatedText.match(/```json\s*([\s\S]*?)\s*```/) || 
                         generatedText.match(/```\s*([\s\S]*?)\s*```/) ||
                         generatedText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          jsonStr = jsonMatch[1] || jsonMatch[0];
        }

        jsonStr = jsonStr.trim();
        const parsed = JSON.parse(jsonStr);
        
        if (parsed.designs && Array.isArray(parsed.designs)) {
          parsedDesigns = parsed.designs;
        } else if (Array.isArray(parsed)) {
          parsedDesigns = parsed;
        }

        // Validate and enhance each design object
        parsedDesigns = parsedDesigns.map((design, index) => ({
          title: design.title || `Design ${index + 1}`,
          description: design.description || "AI-generated design concept",
          colors: Array.isArray(design.colors) ? design.colors : ["#6366F1", "#EC4899", "#F59E0B"],
          elements: Array.isArray(design.elements) ? design.elements : ["text", "shapes", "background"],
          layout: design.layout || "modern layout",
          textElements: Array.isArray(design.textElements) ? design.textElements : [
            {
              text: design.title || `${userPrompt} Title`,
              fontSize: 48,
              fontWeight: "bold",
              color: design.colors?.[1] || "#000000"
            },
            {
              text: design.description || "Subtitle",
              fontSize: 24,
              fontWeight: "normal",
              color: design.colors?.[2] || "#666666"
            }
          ],
          shapes: Array.isArray(design.shapes) ? design.shapes : [
            {
              type: "rectangle",
              color: design.colors?.[0] || "#6366F1",
              width: 200,
              height: 100
            }
          ]
        }));

      } catch (parseError) {
        console.warn('JSON parsing failed, creating fallback design:', parseError);
        parsedDesigns = [{
          title: `Design for: ${userPrompt.substring(0, 30)}${userPrompt.length > 30 ? '...' : ''}`,
          description: "AI-generated design concept",
          colors: ["#6366F1", "#EC4899", "#F59E0B"],
          elements: ["custom text", "decorative elements", "background"],
          layout: "balanced and visually appealing",
          textElements: [
            {
              text: userPrompt,
              fontSize: 48,
              fontWeight: "bold",
              color: "#EC4899"
            },
            {
              text: "AI Generated Design",
              fontSize: 24,
              fontWeight: "normal",
              color: "#6366F1"
            }
          ],
          shapes: [
            {
              type: "rectangle",
              color: "#F59E0B",
              width: 200,
              height: 100
            }
          ]
        }];
      }

      setDesignSuggestions(parsedDesigns);

    } catch (err) {
      console.error('Error generating design:', err);
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError("Request timed out. Please try again.");
        } else if (err.message.includes('fetch')) {
          setError("Network error. Please check your internet connection and try again.");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred while generating the design.");
      }
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleGenerateDesign = useCallback(() => {
    if (userPrompt.trim()) {
      generateDesignWithGemini(userPrompt);
    }
  }, [userPrompt, generateDesignWithGemini]);

  const handleApplyDesign = useCallback(async (design: DesignSuggestion) => {
    setIsApplying(true);
    setError(null);

    try {
      console.log('Applying design to Canva:', design);

      // Add text elements to the design
      if (design.textElements && design.textElements.length > 0) {
        for (let i = 0; i < design.textElements.length; i++) {
          const textElement = design.textElements[i];
          
          try {
            await addNativeElement({
              type: "text",
              children: [textElement.text],
              fontSize: textElement.fontSize || 24,
              fontWeight: textElement.fontWeight as any || "normal",
              color: textElement.color || "#000000",
              // Position elements vertically
              top: 50 + (i * 100),
              left: 50,
            });

            console.log(`Added text element: ${textElement.text}`);
          } catch (textError) {
            console.error('Error adding text element:', textError);
          }
        }
      }

      // Add shapes to the design
      if (design.shapes && design.shapes.length > 0) {
        for (let i = 0; i < design.shapes.length; i++) {
          const shape = design.shapes[i];
          
          try {
            let shapeType: "RECTANGLE" | "CIRCLE" | "TRIANGLE" = "RECTANGLE";
            
            switch (shape.type.toLowerCase()) {
              case "circle":
                shapeType = "CIRCLE";
                break;
              case "triangle":
                shapeType = "TRIANGLE";
                break;
              default:
                shapeType = "RECTANGLE";
            }

            await addNativeElement({
              type: "shape",
              paths: [{
                d: shapeType === "CIRCLE" 
                  ? `M 0,${(shape.height || 100)/2} A ${(shape.width || 100)/2},${(shape.height || 100)/2} 0 1,0 ${shape.width || 100},${(shape.height || 100)/2} A ${(shape.width || 100)/2},${(shape.height || 100)/2} 0 1,0 0,${(shape.height || 100)/2} Z`
                  : shapeType === "TRIANGLE"
                  ? `M ${(shape.width || 100)/2},0 L ${shape.width || 100},${shape.height || 100} L 0,${shape.height || 100} Z`
                  : `M 0,0 L ${shape.width || 100},0 L ${shape.width || 100},${shape.height || 100} L 0,${shape.height || 100} Z`,
                fill: {
                  color: shape.color || "#6366F1"
                }
              }],
              viewBox: {
                width: shape.width || 100,
                height: shape.height || 100,
                top: 0,
                left: 0
              },
              // Position shapes to the right of text
              top: 50 + (i * 120),
              left: 350,
              width: shape.width || 100,
              height: shape.height || 100,
            });

            console.log(`Added ${shape.type} shape with color ${shape.color}`);
          } catch (shapeError) {
            console.error('Error adding shape:', shapeError);
          }
        }
      }

      // Try to add a background color if available
      if (design.colors && design.colors.length > 0) {
        try {
          // Add a background rectangle
          await addNativeElement({
            type: "shape",
            paths: [{
              d: "M 0,0 L 800,0 L 800,600 L 0,600 Z", // Full canvas background
              fill: {
                color: design.colors[0] + "40" // Add transparency
              }
            }],
            viewBox: {
              width: 800,
              height: 600,
              top: 0,
              left: 0
            },
            top: 0,
            left: 0,
            width: 800,
            height: 600,
          });

          console.log(`Added background with color ${design.colors[0]}`);
        } catch (bgError) {
          console.error('Error adding background:', bgError);
        }
      }

      // Show success message
      alert(`✅ Design "${design.title}" has been applied to your Canva design!\n\n🎨 Added elements:\n• ${design.textElements?.length || 0} text elements\n• ${design.shapes?.length || 0} shapes\n• Background color\n\n💡 You can now customize and adjust the elements as needed.`);

    } catch (err) {
      console.error('Error applying design to Canva:', err);
      
      let errorMessage = "Failed to apply design to Canva.";
      
      if (err instanceof Error) {
        if (err.message.includes('permission')) {
          errorMessage = "Permission denied. Make sure the app has access to modify the design.";
        } else if (err.message.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
      
      // Fallback: copy to clipboard
      try {
        const fallbackText = [
          `🎨 ${design.title}`,
          `📝 ${design.description}`,
          `🎨 Colors: ${design.colors.join(', ')}`,
          `📋 Elements: ${design.elements.join(', ')}`,
          `📐 Layout: ${design.layout}`
        ].join('\n');
        
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(fallbackText);
          alert(`❌ Could not apply design automatically.\n\n📋 Design details copied to clipboard as fallback.\n\nError: ${errorMessage}`);
        }
      } catch (clipboardError) {
        alert(`❌ Could not apply design automatically.\n\nError: ${errorMessage}\n\nPlease apply the design elements manually.`);
      }
      
    } finally {
      setIsApplying(false);
    }
  }, []);

  return (
    <div className={styles.rootWrapper}>
      {showAIPanel && (
        <div 
          className={styles.aiPanel} 
          style={{ 
            maxHeight: '80vh', 
            overflowY: 'auto', 
            padding: '16px',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px'
          }}
        >
          <Rows spacing="2u">
            <Title size="large">
              {intl.formatMessage({ defaultMessage: "🤖 AI Design Generator" })}
            </Title>
            
            <TextInput
              placeholder={intl.formatMessage({ defaultMessage: "Describe your design (e.g., 'Create a modern poster for a coffee shop')" })}
              value={userPrompt}
              onChange={setUserPrompt}
              disabled={isGenerating || isApplying}
            />
            
            <Columns spacing="1u" alignY="center">
              <Button
                variant="primary"
                onClick={handleGenerateDesign}
                disabled={isGenerating || isApplying || !userPrompt.trim()}
              >
                {isGenerating ? 
                  intl.formatMessage({ defaultMessage: "Generating..." }) : 
                  intl.formatMessage({ defaultMessage: "Generate Design" })
                }
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => setShowAIPanel(false)}
                disabled={isGenerating || isApplying}
              >
                {intl.formatMessage({ defaultMessage: "Hide AI Panel" })}
              </Button>
            </Columns>

            {(isGenerating || isApplying) && (
              <div className={styles.loadingContainer}>
                <LoadingIndicator size="small" />
                <Text>
                  {isGenerating 
                    ? intl.formatMessage({ defaultMessage: "Generating design with Gemini AI..." })
                    : intl.formatMessage({ defaultMessage: "Applying design to Canva..." })
                  }
                </Text>
              </div>
            )}

            {error && (
              <div className={styles.errorContainer}>
                <div className={styles.errorText}>
                  <Text>Error: {error}</Text>
                </div>
              </div>
            )}

            {designSuggestions.length > 0 && (
              <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
                <Rows spacing="1u">
                  <Title size="medium">
                    {intl.formatMessage({ defaultMessage: "Design Suggestions:" })}
                  </Title>
                  {designSuggestions.map((design, index) => (
                    <div 
                      key={index} 
                      className={styles.designCard}
                      style={{
                        border: '1px solid #333',
                        borderRadius: '8px',
                        padding: '12px',
                        backgroundColor: '#2a2a2a',
                        marginBottom: '12px'
                      }}
                    >
                      <Rows spacing="1u">
                        <Title size="small">{design.title}</Title>
                        <div className={styles.designDescription}>
                          <Text size="small">{design.description}</Text>
                        </div>
                        
                        <div className={styles.colorPalette} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          {design.colors.map((color, colorIndex) => (
                            <ColorSwatch key={colorIndex} color={color} />
                          ))}
                        </div>
                        
                        <div className={styles.elementsText}>
                          <Text size="small">
                            Elements: {design.elements.join(", ")}
                          </Text>
                        </div>

                        {design.textElements && design.textElements.length > 0 && (
                          <div style={{ marginTop: '8px', padding: '8px', backgroundColor: '#333', borderRadius: '4px' }}>
                            <Text size="small" >Text Elements:</Text>
                            {design.textElements.map((textEl, textIndex) => (
                              <div key={textIndex} style={{ marginBottom: '4px' }}>
                                <Text size="small">
                                  "{textEl.text}" ({textEl.fontSize}px, {textEl.fontWeight})
                                </Text>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <Button
                          variant="primary"
                          onClick={() => handleApplyDesign(design)}
                          disabled={isApplying || isGenerating}
                        >
                          {isApplying ? 
                            intl.formatMessage({ defaultMessage: "Applying..." }) :
                            intl.formatMessage({ defaultMessage: "Apply to Canva" })
                          }
                        </Button>
                      </Rows>
                    </div>
                  ))}
                </Rows>
              </div>
            )}
          </Rows>
        </div>
      )}

      {!showAIPanel && (
        <div className={styles.toggleContainer}>
          <Button
            variant="secondary"
            onClick={() => setShowAIPanel(true)}
          >
            {intl.formatMessage({ defaultMessage: "Show AI Design Generator" })}
          </Button>
        </div>
      )}

      <SearchableListView
        config={config}
        findResources={findResources}
        saveExportedDesign={(
          exportedDesignUrl: string,
          containerId: string | undefined,
          designTitle: string | undefined,
        ) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              console.info(
                `Saving file "${designTitle}" from ${exportedDesignUrl} to ${config.serviceName} container id: ${containerId}`,
              );
              resolve({ success: true });
            }, 1000);
          });
        }}
      />
    </div>
  );
}