/**
 * Example: How to integrate the Save Button in your Polotno editor
 */

import React from 'react';
import { observer } from 'mobx-react-lite';
import { SaveButton, SavePanel } from '../components/SaveButton.jsx';
import { store } from '../store/polotnoStore.js';

/**
 * Example 1: Simple Save Button
 * Add this to your toolbar or header
 */
export const SimpleSaveExample = observer(() => {
    const handleSaveSuccess = (data) => {
        console.log('✅ Slide saved successfully:', data);
        alert('Slide saved successfully!');
    };

    const handleSaveError = (error) => {
        console.error('❌ Save failed:', error);
        alert(`Save failed: ${error}`);
    };

    return (
        <SaveButton
            store={store}
            groupId="your-story-group-id-here" // Replace with actual group ID
            slideId={null} // null for new slide, or provide slideId to update
            slideMetadata={{
                description: 'My awesome slide',
                enableCTA: true,
                button_text: 'Shop Now',
                link: 'https://example.com',
            }}
            onSaveSuccess={handleSaveSuccess}
            onSaveError={handleSaveError}
        />
    );
});

/**
 * Example 2: Save Panel with Metadata Form
 * Add this to your sidebar
 */
export const SavePanelExample = observer(() => {
    return (
        <SavePanel
            store={store}
            groupId="your-story-group-id-here"
            slideId={null}
            onSaveSuccess={(data) => {
                console.log('Saved:', data);
            }}
            onSaveError={(error) => {
                console.error('Error:', error);
            }}
        />
    );
});

/**
 * Example 3: Direct API Call (without component)
 * Use this if you want full control
 */
export const directSaveExample = async () => {
    const { handleSave } = await import('../utils/canvasSave.js');

    const result = await handleSave({
        groupId: 'your-story-group-id-here',
        slideId: null, // or provide slideId to update
        slideMetadata: {
            order: 1,
            description: 'Created from canvas editor',
            enableCTA: true,
            button_text: 'Click Here',
            link: 'https://example.com',
            enableCrossButton: false,
            enableMuteButton: false,
        },
        onSuccess: (data) => {
            console.log('✅ Success:', data);
        },
        onError: (error) => {
            console.error('❌ Error:', error);
        },
    });

    return result;
};

/**
 * Example 4: Integration with React Router
 * Get groupId from URL params
 */
import { useParams } from 'react-router-dom';

export const SaveWithRouterExample = observer(() => {
    const { groupId, slideId } = useParams();

    return (
        <SaveButton
            store={store}
            groupId={groupId}
            slideId={slideId || null}
            onSaveSuccess={(data) => {
                // Navigate back or show success message
                console.log('Saved:', data);
            }}
            onSaveError={(error) => {
                alert(`Failed to save: ${error}`);
            }}
        />
    );
});

/**
 * Example 5: Auto-save on interval
 */
export const AutoSaveExample = observer(() => {
    const [lastSaved, setLastSaved] = React.useState(null);

    React.useEffect(() => {
        const interval = setInterval(async () => {
            const { handleSave } = await import('../utils/canvasSave.js');

            await handleSave({
                groupId: 'your-group-id',
                slideId: 'your-slide-id', // Must have slideId for auto-save
                slideMetadata: {
                    description: 'Auto-saved',
                },
                onSuccess: () => {
                    setLastSaved(new Date());
                    console.log('Auto-saved at', new Date());
                },
                onError: (error) => {
                    console.error('Auto-save failed:', error);
                },
            });
        }, 60000); // Auto-save every 60 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ fontSize: '12px', color: '#666' }}>
            {lastSaved && `Last saved: ${lastSaved.toLocaleTimeString()}`}
        </div>
    );
});

/**
 * PAYLOAD STRUCTURE SENT TO BACKEND:
 * 
 * FormData fields:
 * - parent: string (group ID)
 * - order: string (slide order number)
 * - isActive: "1" | "0"
 * - link: string (redirect URL)
 * - button_text: string (CTA text)
 * - description: string
 * - themes: string
 * - enableCrossButton: "1" | "0"
 * - enableMuteButton: "1" | "0"
 * - enableCTA: "1" | "0"
 * - fullWidthCta: "1" | "0"
 * - canvasData: string (JSON stringified canvas payload)
 * - styling: string (JSON stringified CTA styling)
 * - id: string (only for updates)
 * 
 * Canvas Payload Structure (stored in canvasData):
 * {
 *   width: number,
 *   height: number,
 *   preset: string,
 *   exportScale: number,
 *   custom: object,
 *   pages: [
 *     {
 *       id: string,
 *       width: number | "auto",
 *       height: number | "auto",
 *       background: string,
 *       backgroundImage: string,
 *       duration: number,
 *       custom: object,
 *       children: [
 *         {
 *           id: string,
 *           type: "text" | "image" | "video" | "svg" | "figure" | "line" | "group",
 *           x: number,
 *           y: number,
 *           width: number,
 *           height: number,
 *           rotation: number,
 *           visible: boolean,
 *           opacity: number,
 *           custom: object,
 *           // Type-specific properties...
 *         }
 *       ]
 *     }
 *   ],
 *   version: string,
 *   createdAt: string (ISO date)
 * }
 * 
 * API ENDPOINTS:
 * - CREATE: POST /api/v1/campaigns/create-story-slide/
 * - UPDATE: PUT /api/v1/campaigns/update-story-slide/
 */
