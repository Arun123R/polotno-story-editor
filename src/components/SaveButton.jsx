import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
    handleSave,
    saveAsNewSlide,
    updateExistingSlide,
    exportCanvasJSON,
    buildCanvasPayload,
    validateCanvasPayload,
} from '../utils/canvasSave.js';

/**
 * Save Button Component
 * Integrates with the canvas save flow
 */
export const SaveButton = observer(({
    store,
    groupId,
    slideId = null,
    slideMetadata = {},
    onSaveSuccess,
    onSaveError,
    className = '',
    style = {},
}) => {
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

    const handleSaveClick = async () => {
        console.log('🔵 [SAVE] Button clicked!');
        console.log('🔵 [SAVE] groupId:', groupId);
        console.log('🔵 [SAVE] slideId:', slideId);

        setIsSaving(true);
        setSaveStatus(null);

        try {
            console.log('🔵 [SAVE] Building canvas payload...');
            // Build and validate payload first
            const payload = buildCanvasPayload(store);
            console.log('🔵 [SAVE] Canvas payload built:', payload);

            console.log('🔵 [SAVE] Validating payload...');
            const validation = validateCanvasPayload(payload);
            console.log('🔵 [SAVE] Validation result:', validation);

            if (!validation.isValid) {
                throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
            }

            console.log('🔵 [SAVE] Calling save function...');
            console.log('🔵 [SAVE] slideId?', slideId, '- Will', slideId ? 'UPDATE' : 'CREATE');

            // Determine if creating new or updating existing
            const result = slideId
                ? await updateExistingSlide(slideId, groupId, slideMetadata)
                : await saveAsNewSlide(groupId, slideMetadata);

            console.log('🔵 [SAVE] Save result:', result);

            if (result.success) {
                console.log('✅ [SAVE] Save successful!', result.data);
                setSaveStatus('success');
                onSaveSuccess?.(result.data);

                // Clear success message after 3 seconds
                setTimeout(() => setSaveStatus(null), 3000);
            } else {
                console.error('❌ [SAVE] Save failed:', result.error);
                setSaveStatus('error');
                onSaveError?.(result.error);

                // Clear error message after 5 seconds
                setTimeout(() => setSaveStatus(null), 5000);
            }
        } catch (error) {
            console.error('❌ [SAVE] Exception during save:', error);
            console.error('❌ [SAVE] Error stack:', error.stack);
            setSaveStatus('error');
            onSaveError?.(error.message);

            setTimeout(() => setSaveStatus(null), 5000);
        } finally {
            console.log('🔵 [SAVE] Save flow complete');
            setIsSaving(false);
        }
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={handleSaveClick}
                disabled={isSaving || !groupId}
                className={`save-button ${className}`}
                style={{
                    padding: '10px 20px',
                    backgroundColor: isSaving ? '#666' : '#F97316',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: isSaving || !groupId ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: isSaving || !groupId ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                    ...style,
                }}
            >
                {isSaving ? (
                    <>
                        <span className="spinner" style={{
                            width: '14px',
                            height: '14px',
                            border: '2px solid #fff',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 0.6s linear infinite',
                        }} />
                        Saving...
                    </>
                ) : (
                    <>
                        <span>💾</span>
                        {slideId ? 'Update Slide' : 'Save Slide'}
                    </>
                )}
            </button>

            {/* Status indicator */}
            {saveStatus && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        marginTop: '8px',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                        backgroundColor: saveStatus === 'success' ? '#10B981' : '#EF4444',
                        color: '#fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        animation: 'fadeIn 0.2s ease',
                    }}
                >
                    {saveStatus === 'success' ? '✓ Saved successfully!' : '✗ Save failed'}
                </div>
            )}

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-4px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
        </div>
    );
});

/**
 * Advanced Save Panel Component
 * Provides more control over save options
 */
export const SavePanel = observer(({
    store,
    groupId,
    slideId = null,
    onSaveSuccess,
    onSaveError,
}) => {
    const [metadata, setMetadata] = useState({
        description: '',
        button_text: '',
        link: '',
        enableCTA: false,
        enableCrossButton: false,
        enableMuteButton: false,
        themes: '',
    });

    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleMetadataChange = (field, value) => {
        setMetadata(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div style={{
            padding: '16px',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            color: '#fff',
        }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '600' }}>
                Save Slide
            </h3>

            {/* Basic metadata */}
            <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>
                    Description
                </label>
                <input
                    type="text"
                    value={metadata.description}
                    onChange={(e) => handleMetadataChange('description', e.target.value)}
                    placeholder="Slide description..."
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        backgroundColor: '#2a2a2a',
                        border: '1px solid #3a3a3a',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '14px',
                    }}
                />
            </div>

            {/* CTA Toggle */}
            <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                        type="checkbox"
                        checked={metadata.enableCTA}
                        onChange={(e) => handleMetadataChange('enableCTA', e.target.checked)}
                    />
                    <span style={{ fontSize: '14px' }}>Enable CTA Button</span>
                </label>
            </div>

            {/* CTA fields (conditional) */}
            {metadata.enableCTA && (
                <>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>
                            Button Text
                        </label>
                        <input
                            type="text"
                            value={metadata.button_text}
                            onChange={(e) => handleMetadataChange('button_text', e.target.value)}
                            placeholder="Shop Now"
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                backgroundColor: '#2a2a2a',
                                border: '1px solid #3a3a3a',
                                borderRadius: '4px',
                                color: '#fff',
                                fontSize: '14px',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>
                            Link URL
                        </label>
                        <input
                            type="url"
                            value={metadata.link}
                            onChange={(e) => handleMetadataChange('link', e.target.value)}
                            placeholder="https://example.com"
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                backgroundColor: '#2a2a2a',
                                border: '1px solid #3a3a3a',
                                borderRadius: '4px',
                                color: '#fff',
                                fontSize: '14px',
                            }}
                        />
                    </div>
                </>
            )}

            {/* Advanced options toggle */}
            <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                    width: '100%',
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: '1px solid #3a3a3a',
                    borderRadius: '4px',
                    color: '#aaa',
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginBottom: '12px',
                }}
            >
                {showAdvanced ? '▼' : '▶'} Advanced Options
            </button>

            {/* Advanced options */}
            {showAdvanced && (
                <div style={{ marginBottom: '12px', paddingLeft: '12px', borderLeft: '2px solid #3a3a3a' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={metadata.enableCrossButton}
                            onChange={(e) => handleMetadataChange('enableCrossButton', e.target.checked)}
                        />
                        <span style={{ fontSize: '13px' }}>Enable Close Button</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={metadata.enableMuteButton}
                            onChange={(e) => handleMetadataChange('enableMuteButton', e.target.checked)}
                        />
                        <span style={{ fontSize: '13px' }}>Enable Mute Button</span>
                    </label>

                    <div style={{ marginTop: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>
                            Themes (comma-separated)
                        </label>
                        <input
                            type="text"
                            value={metadata.themes}
                            onChange={(e) => handleMetadataChange('themes', e.target.value)}
                            placeholder="summer, sale, promo"
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                backgroundColor: '#2a2a2a',
                                border: '1px solid #3a3a3a',
                                borderRadius: '4px',
                                color: '#fff',
                                fontSize: '14px',
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Save button */}
            <SaveButton
                store={store}
                groupId={groupId}
                slideId={slideId}
                slideMetadata={metadata}
                onSaveSuccess={onSaveSuccess}
                onSaveError={onSaveError}
                style={{ width: '100%', justifyContent: 'center' }}
            />

            {/* Debug: Export JSON */}
            <button
                onClick={() => exportCanvasJSON()}
                style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: '1px solid #3a3a3a',
                    borderRadius: '4px',
                    color: '#aaa',
                    fontSize: '12px',
                    cursor: 'pointer',
                }}
            >
                📥 Export JSON (Debug)
            </button>
        </div>
    );
});

export default SaveButton;
